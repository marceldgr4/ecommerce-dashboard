package com.dashboard.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.util.StringUtils;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(DataSourceConfig.class);

    @Value("${spring.datasource.url:#{null}}")
    private String springDatasourceUrl;

    @Value("${spring.datasource.username:dashboard_user}")
    private String defaultUsername;

    @Value("${spring.datasource.password:dashboard_pass}")
    private String defaultPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();

        // 1. Check for cloud-standard DATABASE_URL or DATABASE_PUBLIC_URL (Railway, Render, Fly.io, etc.)
        String rawUrl = System.getenv("DATABASE_URL");
        if (!StringUtils.hasText(rawUrl)) {
            rawUrl = System.getenv("DATABASE_PUBLIC_URL");
        }
        if (!StringUtils.hasText(rawUrl)) {
            rawUrl = springDatasourceUrl;
        }

        String jdbcUrl;
        String user = defaultUsername;
        String password = defaultPassword;

        if (StringUtils.hasText(rawUrl)) {
            if (rawUrl.startsWith("postgres://") || rawUrl.startsWith("postgresql://")) {
                try {
                    URI uri = new URI(rawUrl);
                    String host = uri.getHost();
                    int port = uri.getPort() == -1 ? 5432 : uri.getPort();
                    String path = uri.getPath();
                    String query = uri.getQuery() != null ? "?" + uri.getQuery() : "";

                    jdbcUrl = "jdbc:postgresql://" + host + ":" + port + path + query;

                    if (uri.getUserInfo() != null) {
                        String[] parts = uri.getUserInfo().split(":", 2);
                        user = parts[0];
                        if (parts.length > 1) {
                            password = parts[1];
                        }
                    }
                    log.info("Detected postgres:// URL. Converted to JDBC URL: jdbc:postgresql://{}:{}{}", host, port, path);
                } catch (Exception e) {
                    log.warn("Failed to parse DATABASE_URL URI ({}), attempting fallback: {}", rawUrl, e.getMessage());
                    jdbcUrl = rawUrl.startsWith("jdbc:") ? rawUrl : "jdbc:" + rawUrl;
                }
            } else if (rawUrl.startsWith("jdbc:")) {
                jdbcUrl = rawUrl;
            } else {
                jdbcUrl = "jdbc:" + rawUrl;
            }
        } else if (StringUtils.hasText(System.getenv("PGHOST"))) {
            // 2. Check PGHOST / PGPORT / PGDATABASE variables (common on Railway Postgres)
            String pghost = System.getenv("PGHOST");
            String pgport = System.getenv("PGPORT") != null ? System.getenv("PGPORT") : "5432";
            String pgdb = System.getenv("PGDATABASE") != null ? System.getenv("PGDATABASE") : "ecommerce_db";
            jdbcUrl = "jdbc:postgresql://" + pghost + ":" + pgport + "/" + pgdb;
            if (System.getenv("PGUSER") != null) user = System.getenv("PGUSER");
            if (System.getenv("PGPASSWORD") != null) password = System.getenv("PGPASSWORD");
        } else {
            // 3. Fallback default
            jdbcUrl = "jdbc:postgresql://localhost:5432/ecommerce_db";
        }

        config.setJdbcUrl(jdbcUrl);
        if (StringUtils.hasText(user)) {
            config.setUsername(user);
        }
        if (StringUtils.hasText(password)) {
            config.setPassword(password);
        }
        config.setDriverClassName("org.postgresql.Driver");

        // Pool tuning for cloud environments
        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setIdleTimeout(300000);
        config.setConnectionTimeout(20000);

        log.info("Configured DataSource for JDBC URL: {}", jdbcUrl);
        return new HikariDataSource(config);
    }
}
