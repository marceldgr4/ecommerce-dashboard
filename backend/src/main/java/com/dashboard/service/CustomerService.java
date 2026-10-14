package com.dashboard.service;

import com.dashboard.dto.request.CustomerRequest;
import com.dashboard.dto.response.CustomerResponse;
import com.dashboard.exception.BusinessException;
import com.dashboard.model.Customer;
import com.dashboard.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;

    @Transactional(readOnly = true)
    public List<CustomerResponse> getAllCustomers() {
        return customerRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public CustomerResponse createCustomer(CustomerRequest request) {
        if (customerRepository.existsByEmail(request.email().trim().toLowerCase())) {
            throw new BusinessException("Ya existe un cliente registrado con el correo: " + request.email());
        }

        Customer customer = Customer.builder()
                .fullName(request.fullName().trim())
                .email(request.email().trim().toLowerCase())
                .country(request.country() != null ? request.country().trim() : "Colombia")
                .build();

        Customer saved = customerRepository.save(customer);
        return mapToResponse(saved);
    }

    private CustomerResponse mapToResponse(Customer customer) {
        return new CustomerResponse(
                customer.getId(),
                customer.getFullName(),
                customer.getEmail(),
                customer.getCountry(),
                customer.getCreatedAt()
        );
    }
}
