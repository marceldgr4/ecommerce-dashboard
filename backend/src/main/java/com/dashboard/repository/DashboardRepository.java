package com.dashboard.repository;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Uses JdbcClient (Spring 6.1+) for native SQL queries.
 * These queries showcase CTEs, window functions, and aggregations.
 * All queries filter only COMPLETED orders for revenue metrics.
 */
@Repository
public class DashboardRepository {

    private final JdbcClient jdbcClient;

    public DashboardRepository(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    public BigDecimal getTotalRevenue() {
        return jdbcClient.sql("""
                SELECT COALESCE(SUM(total_amount), 0)
                FROM orders
                WHERE status = 'COMPLETED'
                """)
                .query(BigDecimal.class)
                .single();
    }

    public long getTotalOrders() {
        return jdbcClient.sql("SELECT COUNT(*) FROM orders")
                .query(Long.class)
                .single();
    }

    public long getTotalCustomers() {
        return jdbcClient.sql("SELECT COUNT(*) FROM customers")
                .query(Long.class)
                .single();
    }

    public long getPendingOrders() {
        return jdbcClient.sql("SELECT COUNT(*) FROM orders WHERE status = 'PENDING'")
                .query(Long.class)
                .single();
    }

    /**
     * Monthly sales for the last 6 months.
     * Uses DATE_TRUNC to group by month and TO_CHAR for readable labels.
     */
    public List<Map<String, Object>> getMonthlySales() {
        return jdbcClient.sql("""
                WITH monthly AS (
                    SELECT
                        DATE_TRUNC('month', created_at) AS month_date,
                        SUM(total_amount)               AS revenue,
                        COUNT(*)                        AS orders
                    FROM orders
                    WHERE status = 'COMPLETED'
                      AND created_at >= NOW() - INTERVAL '6 months'
                    GROUP BY DATE_TRUNC('month', created_at)
                )
                SELECT
                    TO_CHAR(month_date, 'Mon YYYY') AS month,
                    revenue,
                    orders
                FROM monthly
                ORDER BY month_date ASC
                """)
                .query()
                .listOfRows();
    }

    /**
     * Revenue grouped by product category.
     * Joins order_items → products to get category context.
     */
    public List<Map<String, Object>> getSalesByCategory() {
        return jdbcClient.sql("""
                SELECT
                    p.category,
                    SUM(oi.quantity * oi.unit_price) AS revenue
                FROM order_items oi
                JOIN products p ON p.id = oi.product_id
                JOIN orders o   ON o.id = oi.order_id
                WHERE o.status = 'COMPLETED'
                GROUP BY p.category
                ORDER BY revenue DESC
                """)
                .query()
                .listOfRows();
    }

    /**
     * Top 5 products by units sold.
     */
    public List<Map<String, Object>> getTopProducts() {
        return jdbcClient.sql("""
                SELECT
                    p.name,
                    p.category,
                    SUM(oi.quantity)                  AS units_sold,
                    SUM(oi.quantity * oi.unit_price)  AS revenue
                FROM order_items oi
                JOIN products p ON p.id = oi.product_id
                JOIN orders o   ON o.id = oi.order_id
                WHERE o.status = 'COMPLETED'
                GROUP BY p.id, p.name, p.category
                ORDER BY units_sold DESC
                LIMIT 5
                """)
                .query()
                .listOfRows();
    }

    /**
     * Order count grouped by status (COMPLETED, PENDING, CANCELLED).
     */
    public List<Map<String, Object>> getOrdersByStatus() {
        return jdbcClient.sql("""
                SELECT status, COUNT(*) AS count
                FROM orders
                GROUP BY status
                ORDER BY count DESC
                """)
                .query()
                .listOfRows();
    }
}
