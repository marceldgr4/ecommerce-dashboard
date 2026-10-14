package com.dashboard.service;

import com.dashboard.dto.request.ProductRequest;
import com.dashboard.dto.response.ProductResponse;
import com.dashboard.exception.BusinessException;
import com.dashboard.model.Product;
import com.dashboard.repository.OrderItemRepository;
import com.dashboard.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private OrderItemRepository orderItemRepository;

    @InjectMocks
    private ProductService productService;

    private Product product;
    private UUID productId;

    @BeforeEach
    void setUp() {
        productId = UUID.randomUUID();
        product = Product.builder()
                .id(productId)
                .name("Teclado Gamer")
                .category("Electronics")
                .price(new BigDecimal("89.99"))
                .stock(20)
                .createdAt(OffsetDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Debe crear un producto correctamente")
    void testCreateProduct() {
        ProductRequest request = new ProductRequest("Teclado Gamer", "Electronics", new BigDecimal("89.99"), 20);
        when(productRepository.save(any(Product.class))).thenReturn(product);

        ProductResponse response = productService.createProduct(request);

        assertNotNull(response);
        assertEquals("Teclado Gamer", response.name());
        assertEquals("Electronics", response.category());
        assertEquals(new BigDecimal("89.99"), response.price());
        assertEquals(20, response.stock());
        verify(productRepository, times(1)).save(any(Product.class));
    }

    @Test
    @DisplayName("Debe impedir eliminar un producto si tiene pedidos asociados")
    void testDeleteProductWithOrdersFails() {
        when(productRepository.existsById(productId)).thenReturn(true);
        when(orderItemRepository.existsByProductId(productId)).thenReturn(true);

        BusinessException exception = assertThrows(BusinessException.class, () -> {
            productService.deleteProduct(productId);
        });

        assertTrue(exception.getMessage().contains("pedidos asociados"));
        verify(productRepository, never()).deleteById(any());
    }

    @Test
    @DisplayName("Debe eliminar un producto si no tiene pedidos asociados")
    void testDeleteProductSuccess() {
        when(productRepository.existsById(productId)).thenReturn(true);
        when(orderItemRepository.existsByProductId(productId)).thenReturn(false);

        assertDoesNotThrow(() -> productService.deleteProduct(productId));
        verify(productRepository, times(1)).deleteById(productId);
    }
}
