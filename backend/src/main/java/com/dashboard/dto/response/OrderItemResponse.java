package com.dashboard.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderItemResponse(
        UUID id,
        UUID productId,
        String productName,
        String productCategory,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal subtotal
) {}
