package com.dashboard.dto.response;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record ProductResponse(
        UUID id,
        String name,
        String category,
        BigDecimal price,
        Integer stock,
        OffsetDateTime createdAt
) {}
