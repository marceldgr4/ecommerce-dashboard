package com.dashboard.repository;

import com.dashboard.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, UUID> {
    boolean existsByProductId(UUID productId);
    List<OrderItem> findByOrderId(UUID orderId);
}
