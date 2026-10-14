package com.dashboard.dto.response;

import java.time.OffsetDateTime;
import java.util.UUID;

public record CustomerResponse(
        UUID id,
        String fullName,
        String email,
        String country,
        OffsetDateTime createdAt
) {}
