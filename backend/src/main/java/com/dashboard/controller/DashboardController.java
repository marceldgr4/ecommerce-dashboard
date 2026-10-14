package com.dashboard.controller;

import com.dashboard.dto.response.DashboardMetricsResponse;
import com.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/metrics")
    public ResponseEntity<DashboardMetricsResponse> getMetrics() {
        return ResponseEntity.ok(dashboardService.getMetrics());
    }
}
