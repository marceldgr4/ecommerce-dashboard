package com.dashboard.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ProductRequest(
        @NotBlank(message = "El nombre del producto es requerido")
        String name,

        @NotBlank(message = "La categoría es requerida")
        String category,

        @NotNull(message = "El precio es requerido")
        @DecimalMin(value = "0.01", message = "El precio debe ser mayor a 0")
        BigDecimal price,

        @NotNull(message = "El stock es requerido")
        @Min(value = 0, message = "El stock no puede ser negativo")
        Integer stock
) {}
