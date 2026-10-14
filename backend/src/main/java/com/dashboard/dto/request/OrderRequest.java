package com.dashboard.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record OrderRequest(
        @NotNull(message = "El cliente es requerido")
        UUID customerId,

        @NotBlank(message = "El estado del pedido es requerido")
        String status,

        @NotEmpty(message = "El pedido debe contener al menos un producto")
        @Valid
        List<OrderItemRequest> items
) {}
