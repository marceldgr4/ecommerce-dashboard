package com.dashboard.repository;

import com.dashboard.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.customer ORDER BY o.createdAt DESC")
    List<Order> findAllWithCustomer();

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.customer LEFT JOIN FETCH o.items i LEFT JOIN FETCH i.product WHERE o.id = :id")
    Optional<Order> findByIdWithDetails(@Param("id") UUID id);
}
