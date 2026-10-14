package com.dashboard.repository;

import com.dashboard.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, UUID> {
    List<Customer> findAllByOrderByCreatedAtDesc();
    Optional<Customer> findByEmail(String email);
    boolean existsByEmail(String email);
}
