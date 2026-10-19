-- ============================================
-- SCHEMA: E-Commerce Dashboard
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users (app users / admins)
CREATE TABLE IF NOT EXISTS users (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    full_name   VARCHAR(255) NOT NULL,
    role        VARCHAR(50)  NOT NULL DEFAULT 'ADMIN',
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Customers (e-commerce customers)
CREATE TABLE IF NOT EXISTS customers (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name   VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    country     VARCHAR(100),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(255)   NOT NULL,
    category    VARCHAR(100)   NOT NULL,
    price       NUMERIC(10, 2) NOT NULL,
    stock       INT            NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id     UUID           NOT NULL REFERENCES customers(id),
    status          VARCHAR(50)    NOT NULL DEFAULT 'PENDING',
    total_amount    NUMERIC(10, 2) NOT NULL,
    created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id    UUID           NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id  UUID           NOT NULL REFERENCES products(id),
    quantity    INT            NOT NULL,
    unit_price  NUMERIC(10, 2) NOT NULL
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_orders_created_at    ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status        ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer      ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order    ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product  ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_products_category    ON products(category);

-- ============================================
-- SEED DATA
-- ============================================

-- Default admin user (password: Admin123!)
INSERT INTO users (email, password, full_name, role) VALUES
('admin@dashboard.com', '$2a$10$sdiJk1SISP2Tz4.8v.Zspu7Mxrfm9DqHrKZtF5feo.jw1G8FBMYHO', 'Admin User', 'ADMIN')
ON CONFLICT (email) DO NOTHING;

-- Customers
INSERT INTO customers (full_name, email, country) VALUES
('Alice Johnson',   'alice@example.com',   'USA'),
('Bob Smith',       'bob@example.com',     'Canada'),
('Carol White',     'carol@example.com',   'UK'),
('David Brown',     'david@example.com',   'Australia'),
('Eva Martinez',    'eva@example.com',     'Spain'),
('Frank Wilson',    'frank@example.com',   'Germany'),
('Grace Lee',       'grace@example.com',   'Japan'),
('Henry Taylor',    'henry@example.com',   'France'),
('Isabella Davis',  'isabella@example.com','Brazil'),
('James Anderson',  'james@example.com',   'Mexico')
ON CONFLICT (email) DO NOTHING;

-- Products (insert if products table is empty)
INSERT INTO products (name, category, price, stock)
SELECT name, category, price, stock FROM (
    VALUES
    ('Laptop Pro 15"',       'Electronics',  1299.99::numeric, 45),
    ('Wireless Mouse',       'Electronics',    29.99::numeric, 200),
    ('USB-C Hub',            'Electronics',    49.99::numeric, 150),
    ('Mechanical Keyboard',  'Electronics',   129.99::numeric, 80),
    ('Monitor 4K 27"',       'Electronics',   599.99::numeric, 30),
    ('Running Shoes',        'Clothing',       89.99::numeric, 120),
    ('Winter Jacket',        'Clothing',      149.99::numeric, 60),
    ('Yoga Mat',             'Sports',         39.99::numeric, 90),
    ('Protein Powder 2kg',   'Health',         54.99::numeric, 110),
    ('Desk Lamp LED',        'Home',           34.99::numeric, 175)
) AS v(name, category, price, stock)
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);

-- Orders with varying dates (last 6 months, only if orders is empty)
INSERT INTO orders (customer_id, status, total_amount, created_at)
SELECT
    c.id,
    (ARRAY['COMPLETED','COMPLETED','COMPLETED','PENDING','CANCELLED'])[floor(random()*5+1)::int],
    (random() * 1500 + 50)::NUMERIC(10,2),
    NOW() - (random() * INTERVAL '180 days')
FROM customers c
CROSS JOIN generate_series(1, 3)
WHERE NOT EXISTS (SELECT 1 FROM orders LIMIT 1);

-- Order items (only if order_items is empty)
INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT
    o.id,
    p.id,
    (floor(random() * 3) + 1)::int,
    p.price
FROM orders o
CROSS JOIN LATERAL (
    SELECT id, price FROM products ORDER BY random() LIMIT 2
) p
WHERE NOT EXISTS (SELECT 1 FROM order_items LIMIT 1);
