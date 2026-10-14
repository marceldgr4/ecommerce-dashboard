package com.dashboard.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record OrderStatusUpdateRequest(
        @NotBlank(message = "El estado no puede estar vacío")
        @Pattern(regexp = "^(COMPLETED|PENDING|CANCELLED)$", message = "El estado debe ser COMPLETED, PENDING o CANCELLED")
        String status
) {}
