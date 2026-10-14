package com.dashboard.service;

import com.dashboard.dto.response.*;
import com.dashboard.repository.DashboardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final DashboardRepository dashboardRepository;

    public DashboardMetricsResponse getMetrics() {
        return new DashboardMetricsResponse(
                dashboardRepository.getTotalRevenue(),
                dashboardRepository.getTotalOrders(),
                dashboardRepository.getTotalCustomers(),
                dashboardRepository.getPendingOrders(),
                mapMonthlySales(dashboardRepository.getMonthlySales()),
                mapCategorySales(dashboardRepository.getSalesByCategory()),
                mapTopProducts(dashboardRepository.getTopProducts()),
                mapOrderStatus(dashboardRepository.getOrdersByStatus())
        );
    }

    private List<MonthlySalesResponse> mapMonthlySales(List<Map<String, Object>> rows) {
        return rows.stream()
                .map(row -> new MonthlySalesResponse(
                        (String) row.get("month"),
                        toBigDecimal(row.get("revenue")),
                        ((Number) row.get("orders")).longValue()
                ))
                .toList();
    }

    private List<CategorySalesResponse> mapCategorySales(List<Map<String, Object>> rows) {
        return rows.stream()
                .map(row -> new CategorySalesResponse(
                        (String) row.get("category"),
                        toBigDecimal(row.get("revenue"))
                ))
                .toList();
    }

    private List<TopProductResponse> mapTopProducts(List<Map<String, Object>> rows) {
        return rows.stream()
                .map(row -> new TopProductResponse(
                        (String) row.get("name"),
                        (String) row.get("category"),
                        ((Number) row.get("units_sold")).longValue(),
                        toBigDecimal(row.get("revenue"))
                ))
                .toList();
    }

    private List<OrderStatusResponse> mapOrderStatus(List<Map<String, Object>> rows) {
        return rows.stream()
                .map(row -> new OrderStatusResponse(
                        (String) row.get("status"),
                        ((Number) row.get("count")).longValue()
                ))
                .toList();
    }

    private BigDecimal toBigDecimal(Object value) {
        if (value == null) return BigDecimal.ZERO;
        if (value instanceof BigDecimal bd) return bd;
        if (value instanceof Number n) return BigDecimal.valueOf(n.doubleValue());
        return new BigDecimal(value.toString());
    }
}
