package com.dashboard.service;

import com.dashboard.dto.request.OrderItemRequest;
import com.dashboard.dto.request.OrderRequest;
import com.dashboard.dto.response.OrderItemResponse;
import com.dashboard.dto.response.OrderResponse;
import com.dashboard.exception.BusinessException;
import com.dashboard.exception.ResourceNotFoundException;
import com.dashboard.model.Customer;
import com.dashboard.model.Order;
import com.dashboard.model.OrderItem;
import com.dashboard.model.Product;
import com.dashboard.repository.CustomerRepository;
import com.dashboard.repository.OrderRepository;
import com.dashboard.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllWithCustomer()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(UUID id) {
        Order order = orderRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado con ID: " + id));
        return mapToResponse(order);
    }

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        Customer customer = customerRepository.findById(request.customerId())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con ID: " + request.customerId()));

        String status = request.status().toUpperCase().trim();
        if (!List.of("COMPLETED", "PENDING", "CANCELLED").contains(status)) {
            throw new BusinessException("Estado inválido. Debe ser COMPLETED, PENDING o CANCELLED");
        }

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();
        List<Product> productsToUpdate = new ArrayList<>();

        Order order = Order.builder()
                .customer(customer)
                .status(status)
                .totalAmount(BigDecimal.ZERO)
                .items(new ArrayList<>())
                .build();

        for (OrderItemRequest itemReq : request.items()) {
            Product product = productRepository.findById(itemReq.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con ID: " + itemReq.productId()));

            if (product.getStock() < itemReq.quantity()) {
                throw new BusinessException("Stock insuficiente para el producto: " + product.getName() +
                        ". Disponible: " + product.getStock() + ", Solicitado: " + itemReq.quantity());
            }

            // Reducir stock del producto
            product.setStock(product.getStock() - itemReq.quantity());
            productsToUpdate.add(product);

            BigDecimal unitPrice = product.getPrice();
            BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(itemReq.quantity()));
            totalAmount = totalAmount.add(subtotal);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(itemReq.quantity())
                    .unitPrice(unitPrice)
                    .build();

            orderItems.add(orderItem);
        }

        order.setTotalAmount(totalAmount);
        order.setItems(orderItems);

        productRepository.saveAll(productsToUpdate);
        Order savedOrder = orderRepository.save(order);

        return mapToResponse(savedOrder);
    }

    @Transactional
    public OrderResponse updateOrderStatus(UUID id, String newStatus) {
        Order order = orderRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado con ID: " + id));

        String normalizedStatus = newStatus.toUpperCase().trim();
        if (!List.of("COMPLETED", "PENDING", "CANCELLED").contains(normalizedStatus)) {
            throw new BusinessException("Estado inválido. Debe ser COMPLETED, PENDING o CANCELLED");
        }

        // Si se cancela una orden, restaurar el inventario
        if ("CANCELLED".equals(normalizedStatus) && !"CANCELLED".equals(order.getStatus())) {
            for (OrderItem item : order.getItems()) {
                Product product = item.getProduct();
                if (product != null) {
                    product.setStock(product.getStock() + item.getQuantity());
                    productRepository.save(product);
                }
            }
        }

        order.setStatus(normalizedStatus);
        Order updated = orderRepository.save(order);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteOrder(UUID id) {
        if (!orderRepository.existsById(id)) {
            throw new ResourceNotFoundException("Pedido no encontrado con ID: " + id);
        }
        orderRepository.deleteById(id);
    }

    private OrderResponse mapToResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems() != null
                ? order.getItems().stream().map(item -> new OrderItemResponse(
                        item.getId(),
                        item.getProduct() != null ? item.getProduct().getId() : null,
                        item.getProduct() != null ? item.getProduct().getName() : "Producto no disponible",
                        item.getProduct() != null ? item.getProduct().getCategory() : "",
                        item.getQuantity(),
                        item.getUnitPrice(),
                        item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()))
                )).toList()
                : List.of();

        return new OrderResponse(
                order.getId(),
                order.getCustomer() != null ? order.getCustomer().getId() : null,
                order.getCustomer() != null ? order.getCustomer().getFullName() : "Cliente no registrado",
                order.getCustomer() != null ? order.getCustomer().getEmail() : "",
                order.getCustomer() != null ? order.getCustomer().getCountry() : "",
                order.getStatus(),
                order.getTotalAmount(),
                order.getCreatedAt(),
                itemResponses
        );
    }
}
