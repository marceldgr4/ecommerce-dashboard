package com.dashboard.config;

import com.dashboard.model.Customer;
import com.dashboard.model.Order;
import com.dashboard.model.OrderItem;
import com.dashboard.model.Product;
import com.dashboard.model.User;
import com.dashboard.repository.CustomerRepository;
import com.dashboard.repository.OrderRepository;
import com.dashboard.repository.ProductRepository;
import com.dashboard.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    @Override
    @Transactional
    public void run(String... args) {
        try {
            initUsers();
            initCustomersAndProducts();
        } catch (Exception e) {
            log.warn("Database initialization check skipped or encountered note: {}", e.getMessage());
        }
    }

    private void initUsers() {
        if (userRepository.count() == 0) {
            log.info("No users found. Seeding default admin user (admin@dashboard.com)...");
            User admin = User.builder()
                    .email("admin@dashboard.com")
                    // BCrypt for "Admin123!"
                    .password("$2a$10$sdiJk1SISP2Tz4.8v.Zspu7Mxrfm9DqHrKZtF5feo.jw1G8FBMYHO")
                    .fullName("Admin User")
                    .role("ADMIN")
                    .build();
            userRepository.save(admin);
            log.info("Default admin user created successfully.");
        }
    }

    private void initCustomersAndProducts() {
        if (customerRepository.count() == 0 && productRepository.count() == 0) {
            log.info("Seeding initial demo customers and products...");

            List<Customer> customers = List.of(
                    Customer.builder().fullName("Alice Johnson").email("alice@example.com").country("USA").build(),
                    Customer.builder().fullName("Bob Smith").email("bob@example.com").country("Canada").build(),
                    Customer.builder().fullName("Carol White").email("carol@example.com").country("UK").build(),
                    Customer.builder().fullName("David Brown").email("david@example.com").country("Australia").build(),
                    Customer.builder().fullName("Eva Martinez").email("eva@example.com").country("Spain").build()
            );
            List<Customer> savedCustomers = customerRepository.saveAll(customers);

            List<Product> products = List.of(
                    Product.builder().name("Laptop Pro 15\"").category("Electronics").price(new BigDecimal("1299.99")).stock(45).build(),
                    Product.builder().name("Wireless Mouse").category("Electronics").price(new BigDecimal("29.99")).stock(200).build(),
                    Product.builder().name("USB-C Hub").category("Electronics").price(new BigDecimal("49.99")).stock(150).build(),
                    Product.builder().name("Mechanical Keyboard").category("Electronics").price(new BigDecimal("129.99")).stock(80).build(),
                    Product.builder().name("Monitor 4K 27\"").category("Electronics").price(new BigDecimal("599.99")).stock(30).build(),
                    Product.builder().name("Running Shoes").category("Clothing").price(new BigDecimal("89.99")).stock(120).build(),
                    Product.builder().name("Winter Jacket").category("Clothing").price(new BigDecimal("149.99")).stock(60).build(),
                    Product.builder().name("Yoga Mat").category("Sports").price(new BigDecimal("39.99")).stock(90).build(),
                    Product.builder().name("Protein Powder 2kg").category("Health").price(new BigDecimal("54.99")).stock(110).build(),
                    Product.builder().name("Desk Lamp LED").category("Home").price(new BigDecimal("34.99")).stock(175).build()
            );
            List<Product> savedProducts = productRepository.saveAll(products);

            if (orderRepository.count() == 0 && !savedCustomers.isEmpty() && !savedProducts.isEmpty()) {
                Customer firstCustomer = savedCustomers.get(0);
                Product p1 = savedProducts.get(0);
                Product p2 = savedProducts.get(1);

                Order sampleOrder = Order.builder()
                        .customer(firstCustomer)
                        .status("COMPLETED")
                        .totalAmount(p1.getPrice().add(p2.getPrice()))
                        .items(new ArrayList<>())
                        .build();

                OrderItem item1 = OrderItem.builder()
                        .order(sampleOrder)
                        .product(p1)
                        .quantity(1)
                        .unitPrice(p1.getPrice())
                        .build();

                OrderItem item2 = OrderItem.builder()
                        .order(sampleOrder)
                        .product(p2)
                        .quantity(1)
                        .unitPrice(p2.getPrice())
                        .build();

                sampleOrder.getItems().add(item1);
                sampleOrder.getItems().add(item2);

                orderRepository.save(sampleOrder);
            }
            log.info("Demo data seeded successfully.");
        }
    }
}
