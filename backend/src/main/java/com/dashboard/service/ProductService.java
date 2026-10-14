package com.dashboard.service;

import com.dashboard.dto.request.ProductRequest;
import com.dashboard.dto.response.ProductResponse;
import com.dashboard.exception.BusinessException;
import com.dashboard.exception.ResourceNotFoundException;
import com.dashboard.model.Product;
import com.dashboard.repository.OrderItemRepository;
import com.dashboard.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;

    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con ID: " + id));
        return mapToResponse(product);
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        Product product = Product.builder()
                .name(request.name().trim())
                .category(request.category().trim())
                .price(request.price())
                .stock(request.stock())
                .build();

        Product saved = productRepository.save(product);
        return mapToResponse(saved);
    }

    @Transactional
    public ProductResponse updateProduct(UUID id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con ID: " + id));

        product.setName(request.name().trim());
        product.setCategory(request.category().trim());
        product.setPrice(request.price());
        product.setStock(request.stock());

        Product updated = productRepository.save(product);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteProduct(UUID id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Producto no encontrado con ID: " + id);
        }

        if (orderItemRepository.existsByProductId(id)) {
            throw new BusinessException("No se puede eliminar el producto porque tiene pedidos asociados. Puedes actualizar su stock a 0.");
        }

        productRepository.deleteById(id);
    }

    private ProductResponse mapToResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getCategory(),
                product.getPrice(),
                product.getStock(),
                product.getCreatedAt()
        );
    }
}
