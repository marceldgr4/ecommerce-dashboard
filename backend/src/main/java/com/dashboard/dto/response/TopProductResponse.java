package com.dashboard.dto.response;

import java.math.BigDecimal;

public record TopProductResponse(String name, String category, long unitsSold, BigDecimal revenue) {}
