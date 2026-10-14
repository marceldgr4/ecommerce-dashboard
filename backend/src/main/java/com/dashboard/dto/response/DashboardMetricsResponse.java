package com.dashboard.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record DashboardMetricsResponse(
        BigDecimal totalRevenue,
        long totalOrders,
        long totalCustomers,
        long pendingOrders,
        List<MonthlySalesResponse> monthlySales,
        List<CategorySalesResponse> salesByCategory,
        List<TopProductResponse> topProducts,
        List<OrderStatusResponse> ordersByStatus
) {}
