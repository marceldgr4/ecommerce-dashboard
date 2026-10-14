package com.dashboard.repository;

import com.dashboard.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {
    List<Product> findAllByOrderByCreatedAtDesc();
    List<Product> findByCategoryIgnoreCaseOrderByCreatedAtDesc(String category);
}
