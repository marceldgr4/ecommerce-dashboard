package com.dashboard.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CustomerRequest(
        @NotBlank(message = "El nombre completo es requerido")
        String fullName,

        @NotBlank(message = "El email es requerido")
        @Email(message = "Debe ser un correo electrónico válido")
        String email,

        String country
) {}
