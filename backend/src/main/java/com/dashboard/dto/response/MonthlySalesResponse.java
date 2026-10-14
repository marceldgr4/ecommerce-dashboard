package com.dashboard.dto.response;

import java.math.BigDecimal;

public record MonthlySalesResponse(String month, BigDecimal revenue, long orders) {}
