# E-Commerce Dashboard & Management System

Plataforma integral de gestión de comercio electrónico y visualización de métricas en tiempo real, respaldada por **Spring Boot 3.4**, **PostgreSQL 16**, **React 18 con Vite**, **Tailwind CSS** y **pgAdmin 4**, orquestada mediante **Docker Compose**.

---

## 1. Descripción del Proyecto

### Propósito y Funcionalidades Principales
El sistema proporciona una solución completa para la administración y monitoreo de un negocio de comercio electrónico:
- **Dashboard Analítico en Tiempo Real**: Cálculo nativo en base de datos de ingresos totales, pedidos acumulados, total de clientes, órdenes pendientes, gráficos históricos de facturación mensual, distribución de ventas por categoría y productos más vendidos.
- **Gestión Integral de Productos (CRUD)**: Creación, consulta filtrada, actualización de precios y existencias, y eliminación controlada de artículos del catálogo.
- **Gestión de Pedidos y Ventas (CRUD)**: Registro de nuevos pedidos con selección de cliente y múltiples productos, deducción transaccional de inventario, cambio dinámico de estado (`COMPLETED`, `PENDING`, `CANCELLED`), restauración de existencias en cancelaciones e inspección de artículos.
- **Directorio de Clientes**: Consulta y registro de clientes con validación de unicidad de correo electrónico.
- **Seguridad y Control de Acceso**: Autenticación basada en JSON Web Tokens (JWT) con roles de usuario y rutas protegidas.
- **Doble Alternativa de Gestión**: Operación segura desde la aplicación web o administración avanzada directa de PostgreSQL mediante consola visual pgAdmin 4.

### Tecnologías Realmente Utilizadas
- **Base de Datos**: PostgreSQL 16 (Alpine).
- **Backend**: Java 21, Spring Boot 3.4.1, Spring Data JPA, Spring Security 6.2, Hibernate 6.6, Spring `JdbcClient`, JJWT 0.12.3, Lombok.
- **Frontend**: TypeScript 5.5, React 18.3, Vite 5.3, React Router DOM 6.24, Tailwind CSS 3.4, Recharts 2.12, Axios 1.7, Lucide Icons.
- **Administración DB**: pgAdmin 4 v8+.
- **Infraestructura**: Docker & Docker Compose con redes aisladas y volúmenes persistentes.

### Arquitectura y Organización de Módulos

```
ecommerce-dashboard/
├── backend/
│   ├── src/main/java/com/dashboard/
│   │   ├── config/              # SecurityConfig (HTTP filter chain, CORS) y ApplicationConfig (Beans de Auth)
│   │   ├── controller/          # Endpoints REST (AuthController, DashboardController, ProductController, OrderController, CustomerController)
│   │   ├── dto/
│   │   │   ├── request/         # Records de entrada con validaciones Jakarta (@Valid, @NotNull, @Min)
│   │   │   └── response/        # Records de respuesta inmutables
│   │   ├── exception/           # GlobalExceptionHandler (@RestControllerAdvice, ProblemDetail RFC 7807)
│   │   ├── model/               # Entidades JPA (User, Product, Customer, Order, OrderItem)
│   │   ├── repository/          # Repositorios JPA y DashboardRepository con native SQL (JdbcClient)
│   │   ├── security/            # Filtro JwtAuthenticationFilter y utilidades de cifrado JwtService
│   │   └── service/             # Capa de lógica de negocio transaccional (@Transactional)
│   ├── src/main/resources/
│   │   ├── application.yml      # Configuración de datasource, JPA y variables JWT
│   │   └── db/init.sql          # Esquema DDL, índices y datos semilla iniciales
│   └── Dockerfile               # Compilación multi-stage (Maven builder + Eclipse Temurin JRE)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── charts/          # Gráficos Recharts (Revenue, Orders, Categories, Status, TopProducts)
│   │   │   ├── customers/       # Vista de clientes y modal de registro
│   │   │   ├── layout/          # ProtectedRoute para control de sesión
│   │   │   ├── orders/          # Vista de pedidos, modal de creación dinámica y detalle de orden
│   │   │   ├── products/        # Inventario de productos, filtros y modal de creación/edición
│   │   │   └── ui/              # Tarjetas KPI (MetricCard)
│   │   ├── hooks/               # useAuth (estado de sesión) y useDashboard (métricas con refetch)
│   │   ├── pages/               # LoginPage y DashboardPage (navegación por pestañas)
│   │   ├── services/            # Clientes Axios tipados con interceptor de token Bearer
│   │   ├── types/               # Modelos e interfaces TypeScript unificadas
│   │   └── utils/               # Formateadores numéricos y de moneda
│   ├── nginx.conf               # Servidor web en producción con reverse-proxy a /api/
│   └── Dockerfile               # Multi-stage (Node builder + Nginx Alpine)
├── pgadmin/
│   └── servers.json             # Preconfiguración automática de conexión al servidor PostgreSQL
├── docker-compose.yml           # Orquestación de contenedores (db, api, web, pgadmin)
└── .env.example                 # Plantilla de variables de entorno sin credenciales expuestas
```

---

## 2. Diagnóstico Técnico de la Auditoría

| # | Problema Identificado | Componente Afectado | Causa Raíz Confirmada | Impacto | Corrección Aplicada |
|---|----------------------|---------------------|-----------------------|---------|---------------------|
| 1 | Fallo de inicio en Spring Boot (Ciclo de beans) | `SecurityConfig.java` / `JwtAuthenticationFilter.java` | `SecurityConfig` requería `JwtAuthenticationFilter` en su constructor, y a su vez `JwtAuthenticationFilter` dependía de `UserDetailsService`, declarado como `@Bean` en `SecurityConfig`. | El backend abortaba el arranque (`Application failed to start`) y el contenedor salía con código 1. | Se creó `ApplicationConfig.java` para aislar `UserDetailsService`, `AuthenticationProvider`, `AuthenticationManager` y `PasswordEncoder`. |
| 2 | Excepción en decodificación de clave JWT | `JwtService.java` / `application.yml` | `Decoders.BASE64.decode()` fallaba al procesar texto plano con guiones (`your-256-bit...`). | Cualquier intento de login generaba `DecodingException: Illegal base64 character`. | Se blindó `getSigningKey()` con fallback automático a UTF-8 y padding mínimo de 256 bits, configurando además una clave Base64 válida en `.env.example`. |
| 3 | Imposibilidad de autenticación con credenciales por defecto | `init.sql` / `users` (DB) | El hash almacenado para `admin@dashboard.com` correspondía a `'password'` y no a `'Admin123!'`. | Todo intento de iniciar sesión con la contraseña documentada (`Admin123!`) era rechazado con HTTP 401 Unauthorized. | Se calculó el hash bcrypt legítimo (`$2a$10$sdi...`), se actualizó `init.sql` y se ejecutó la actualización en la base de datos activa. |
| 4 | Ausencia de operaciones de escritura desde Frontend | Frontend & Backend Controllers | El proyecto original solo contaba con endpoints de lectura del Dashboard (`/api/dashboard/metrics`). | El usuario no podía registrar ni modificar productos, clientes ni ventas desde la interfaz. | Se implementó el backend CRUD completo (`ProductController`, `OrderController`, `CustomerController`) y los módulos interactivos en React con pestañas. |
| 5 | Falta de herramienta gráfica de administración DB | `docker-compose.yml` | No existía interfaz visual para inspeccionar directamente PostgreSQL. | Obligaba a usar terminal o instalar clientes locales externos. | Se integró **pgAdmin 4** en `docker-compose.yml` con preconfiguración en `servers.json`. |
| 6 | Directorio residual corrupto | `{backend/` | Ejecución errónea de comando de creación de directorios en shell. | Ruido en el árbol del proyecto. | Directorio eliminado de forma segura. |

---

## 3. Configuración del Entorno y Ejecución

### Requisitos Previos
- **Docker Desktop** (v24 o superior) y **Docker Compose** (v2 o superior) instalados y en ejecución.
- *(Opcional para desarrollo sin Docker)*: Node.js 20+, Java 21 JDK y Maven 3.9+.

### Variables de Entorno
Crea tu archivo local `.env` a partir de la plantilla:
```bash
cp .env.example .env
```

Las variables principales configurables son:
- `POSTGRES_DB`: Nombre de la base de datos (por defecto: `ecommerce_db`).
- `POSTGRES_USER`: Usuario administrador de PostgreSQL (por defecto: `dashboard_user`).
- `POSTGRES_PASSWORD`: Contraseña de PostgreSQL (por defecto: `dashboard_pass`).
- `POSTGRES_HOST_PORT`: Puerto de PostgreSQL expuesto al host (por defecto: `5433`).
- `JWT_SECRET`: Clave secreta Base64 para firma de tokens.
- `PGADMIN_PORT`: Puerto web para acceder a pgAdmin 4 (por defecto: `5050`).

### Ejecución con Docker Compose (Recomendada)
Para compilar y levantar todos los servicios en segundo plano:
```bash
docker compose up --build -d
```

Verifica el estado de los 4 contenedores:
```bash
docker compose ps
```

Acceso a los servicios:
- **Frontend Web:** [http://localhost:5173](http://localhost:5173)
- **API Backend:** [http://localhost:8080](http://localhost:8080)
- **pgAdmin 4:** [http://localhost:5050](http://localhost:5050)
- **PostgreSQL Directo:** `localhost:5433`

---

## 4. Base de Datos PostgreSQL

- **Motor:** PostgreSQL 16 Alpine
- **Base de Datos:** `ecommerce_db`
- **Esquema:** `public`

### Esquema y Relaciones Verificadas

```
┌──────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  customers   │1     *│     orders      │1     *│   order_items   │
├──────────────┤───────├─────────────────┤───────├─────────────────┤
│ id (PK)      │       │ id (PK)         │       │ id (PK)         │
│ full_name    │       │ customer_id(FK) ├───────┤ order_id (FK)   │
│ email (UQ)   │       │ status          │       │ product_id (FK) ├──┐
│ country      │       │ total_amount    │       │ quantity        │  │
│ created_at   │       │ created_at      │       │ unit_price      │  │
└──────────────┘       └─────────────────┘       └─────────────────┘  │
                                                                      │
                                                 ┌─────────────────┐  │
                                                 │    products     │1 │
                                                 ├─────────────────┤  │
                                                 │ id (PK)         │◄─┘
                                                 │ name            │
                                                 │ category        │
                                                 │ price           │
                                                 │ stock           │
                                                 │ created_at      │
                                                 └─────────────────┘
```

### Índices de Rendimiento
- `idx_orders_created_at`: Optimiza agrupaciones temporales por fecha en `DATE_TRUNC`.
- `idx_orders_status`: Acelera filtros sobre órdenes con estado `'COMPLETED'`.
- `idx_order_items_product` y `idx_order_items_order`: Optimizan uniones relacionales (JOIN) para cálculo de ventas por categoría y productos estrella.

---

## 5. Gestión de Datos desde el Frontend

### Flujo de Comunicación Seguro
El navegador del usuario **nunca** se conecta directamente a la base de datos PostgreSQL. Todo tráfico fluye a través de la API protegida:

```
[Usuario] ──> [React Frontend] ──(Axios + Bearer Token)──> [Spring Boot REST API] ──(JPA / HikariCP)──> [PostgreSQL]
```

### Módulos y Operaciones Disponibles en la Interfaz

1. **Pestaña Dashboard:**
   - Muestra KPIs de ingresos y ventas en vivo.
   - Cuenta con botón manual de **Actualizar** y se sincroniza automáticamente al navegar entre pestañas.
2. **Pestaña Productos:**
   - **Listar:** Tabla con filtrado por categoría y buscador por texto en tiempo real.
   - **Crear:** Modal interactivo con validación de nombre, categoría, precio (> 0) y existencias (>= 0).
   - **Editar:** Modificación de precios y stock.
   - **Eliminar:** Validación de integridad referencial. Si el producto ya tiene compras registradas en `order_items`, el sistema impide su eliminación accidental para preservar el historial contable.
3. **Pestaña Pedidos:**
   - **Listar:** Registro histórico de transacciones con badges de estado.
   - **Crear:** Selección de cliente registrado, adición dinámica de múltiples productos, validación de stock disponible y cálculo de total en vivo.
   - **Cambio de Estado:** Selector directo en la tabla para alternar entre `COMPLETED`, `PENDING` y `CANCELLED`. Si una orden se cancela, el backend restaura automáticamente el inventario de los productos.
   - **Detalle:** Modal con desglose de artículos, subtotales, fecha y datos del cliente.
4. **Pestaña Clientes:**
   - Consulta del directorio y formulario para registrar nuevos clientes.

---

## 6. Administración mediante pgAdmin 4

pgAdmin 4 está integrado y configurado para conectarse a la **misma base de datos** utilizada por la aplicación.

### Acceso a la Consola
1. Ingresa a **[http://localhost:5050](http://localhost:5050)**.
2. Credenciales de acceso:
   - **Email:** `admin@dashboard.com`
   - **Contraseña:** `Admin123!`

### Conexión al Servidor de Base de Datos
El servidor viene pre-registrado como **Ecommerce DB**. Al desplegarlo en el menú de la izquierda, si solicita contraseña:
- **Contraseña de DB:** `dashboard_pass` *(marcar "Save Password")*.

*(Parámetros para registro manual si se requiere):*
- **Host name:** `postgres` *(nombre del servicio en la red interna de Docker)*
- **Port:** `5432`
- **Maintenance database:** `ecommerce_db`
- **Username:** `dashboard_user`
- **Password:** `dashboard_pass`

### Ejemplos de Consultas SQL Administrativas

Abre la herramienta **Query Tool** en `ecommerce_db` para ejecutar consultas:

#### Consulta de Inventario y Ventas
```sql
SELECT p.name, p.category, p.price, p.stock, COALESCE(SUM(oi.quantity), 0) AS total_vendidos
FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.id
GROUP BY p.id, p.name, p.category, p.price, p.stock
ORDER BY total_vendidos DESC;
```

#### Inserción Segura de un Nuevo Pedido (Transaccional)
```sql
BEGIN;

-- 1. Insertar orden
WITH orden AS (
    INSERT INTO orders (customer_id, status, total_amount, created_at)
    VALUES (
        (SELECT id FROM customers LIMIT 1),
        'COMPLETED',
        199.98,
        NOW()
    )
    RETURNING id
)
-- 2. Insertar artículos
INSERT INTO order_items (order_id, product_id, quantity, unit_price)
SELECT 
    orden.id,
    p.id,
    2,
    p.price
FROM orden, products p
WHERE p.name LIKE 'Wireless Mouse%'
LIMIT 1;

-- 3. Descontar stock
UPDATE products 
SET stock = stock - 2 
WHERE name LIKE 'Wireless Mouse%';

COMMIT;
```

---

## 7. Garantía de Consistencia Bidireccional

Ambas alternativas operan de forma concurrente sobre la misma base de datos `ecommerce_db`:

- **Caso 1 (Frontend ➔ pgAdmin):** Al registrar un producto o pedido desde la aplicación web en [http://localhost:5173](http://localhost:5173), la fila se inserta en PostgreSQL y es visible inmediatamente en pgAdmin al hacer `SELECT * FROM products;`.
- **Caso 2 (pgAdmin ➔ Frontend):** Al ejecutar un `UPDATE` o `INSERT` en pgAdmin (o modificar una celda desde la cuadrícula de datos y guardar con `F6`), el cambio impacta inmediatamente en la base de datos. Al hacer clic en **Actualizar** en el frontend, la interfaz refleja los nuevos valores sin necesidad de reiniciar servicios.

---

## 8. Pruebas y Validación Ejecutadas

Las siguientes pruebas fueron ejecutadas y verificadas directamente en el entorno activo:

| Prueba | Tipo | Comando / Procedimiento | Resultado Verificado |
|--------|------|-------------------------|----------------------|
| **Autenticación** | API | `POST /api/auth/login` con credenciales `admin@dashboard.com` / `Admin123!` | Retorna `HTTP 200 OK` con token JWT válido. |
| **Métricas** | API | `GET /api/dashboard/metrics` con Bearer Token | Retorna `HTTP 200 OK` con cálculo exacto de ingresos e histórico. |
| **Creación de Producto** | Integración | `POST /api/products` (Silla Ergonómica Pro) | Creado con `HTTP 201`. Verificado en PostgreSQL con `SELECT`. |
| **Inserción directa en DB** | Consistencia | `INSERT INTO products (Cámara 4K Ultra)` en PostgreSQL | Consultado desde `GET /api/products`, comprobando lectura inmediata. |
| **Actualización en DB** | Consistencia | `UPDATE products SET stock = 99` en PostgreSQL | Reflejado en la API retornando `stock: 99`. |
| **Creación de Pedido** | Transaccional | `POST /api/orders` con 2 unidades | Descuenta stock automáticamente y actualiza métricas de `Revenue` (+799.98). |
| **Reglas de Integridad** | Validación | Intento de eliminar producto con pedidos asociados | `HTTP 400 Bad Request` controlado por regla de negocio. |
| **Build Frontend** | Tipado | `npm run build` (`tsc && vite build`) | Compilación limpia con 0 errores TypeScript. |
| **pgAdmin 4** | Web | Conexión HTTP al puerto 5050 y enlace a PostgreSQL | Sesión iniciada y esquema `public` accesible. |

---

## 9. Solución de Problemas Frecuentes

1. **Error: `Port 5433 already in use` o `Port 5173 already in use`:**
   - Verifica si tienes otra instancia o proceso corriendo:
     ```bash
     lsof -iTCP:5433 -sTCP:LISTEN
     ```
   - Puedes cambiar los puertos mapeados al host en tu archivo `.env` (`POSTGRES_HOST_PORT` o `FRONTEND_PORT`).
2. **Reiniciar la base de datos limpia con los datos iniciales:**
   - Para eliminar el volumen persistente y forzar la recarga de `init.sql`:
     ```bash
     docker compose down -v
     docker compose up --build -d
     ```
3. **Credenciales rechazadas al iniciar sesión:**
   - Asegúrate de usar `admin@dashboard.com` y `Admin123!`. Si la base de datos se inicializó previamente con datos antiguos, ejecuta:
     ```bash
     docker exec dashboard_db psql -U dashboard_user -d ecommerce_db -c "UPDATE users SET password = '\$2a\$10\$sdiJk1SISP2Tz4.8v.Zspu7Mxrfm9DqHrKZtF5feo.jw1G8FBMYHO' WHERE email = 'admin@dashboard.com';"
     ```
