package com.dashboard.dto.response;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record OrderResponse(
        UUID id,
        UUID customerId,
        String customerName,
        String customerEmail,
        String customerCountry,
        String status,
        BigDecimal totalAmount,
        OffsetDateTime createdAt,
        List<OrderItemResponse> items
) {}
