# E-Commerce Dashboard & Management System

Plataforma full-stack para la gestión de comercio electrónico y análisis de métricas operativas en tiempo real. Diseñada con una arquitectura moderna de microservicios contenerizados utilizando **Spring Boot 3.4**, **PostgreSQL 16**, **React 18 con Vite**, **Tailwind CSS** y **pgAdmin 4**.

---

## 🚀 Características Principales

- **Dashboard Analítico en Tiempo Real:** Métricas clave de rendimiento (KPIs), cálculo automático de ingresos totales, volumen histórico de pedidos, clientes registrados y pedidos pendientes.
- **Gráficos Interactivos:** Evolución de ventas mensuales, distribución de facturación por categoría y desglose de pedidos por estado (`COMPLETED`, `PENDING`, `CANCELLED`).
- **Gestión Integral de Productos (CRUD):** Registro, actualización de precios y existencias, filtrado por categorías, búsqueda por texto y control de integridad referencial.
- **Gestión Transaccional de Pedidos (CRUD):** Creación de órdenes con cálculo automático de totales, verificación y descuento de existencias en inventario, cambio dinámico de estado y restauración de stock en cancelaciones.
- **Directorio de Clientes:** Módulo para registro y consulta de compradores.
- **Seguridad Robusta:** Autenticación stateless mediante tokens **JWT (JSON Web Token)** y contraseñas protegidas con **BCrypt**.
- **Administración Visual de Base de Datos:** Consola **pgAdmin 4** integrada y preconfigurada para inspección y consultas avanzadas.
- **Despliegue Contenerizado:** Todo el ecosistema listo para ejecutar en un solo comando con **Docker Compose**.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnologías |
|---|---|
| **Frontend** | React 18, TypeScript 5, Vite, Tailwind CSS, Recharts, Lucide Icons, Axios |
| **Backend** | Java 21, Spring Boot 3.4, Spring Data JPA, Spring Security 6, Hibernate 6, JdbcClient, JJWT |
| **Base de Datos** | PostgreSQL 16 Alpine |
| **Administración DB** | pgAdmin 4 |
| **Infraestructura** | Docker, Docker Compose, Nginx (Reverse Proxy) |

---

## 🏗️ Arquitectura del Sistema

```
[ Navegador Web ]
       │
       ▼
[ Nginx / React SPA ] (Puerto 5173)
       │
       ▼ (Llamadas HTTP con Bearer JWT)
[ Spring Boot API ] (Puerto 8080)
       │
       ├── JPA / Hibernate ──┐
       └── JdbcClient (SQL) ─┼──> [ PostgreSQL 16 ] (Puerto 5433 en host / 5432 red interna)
                             │           ▲
                             └───────────┼── [ pgAdmin 4 ] (Puerto 5050)
```

### Estructura del Repositorio

```
ecommerce-dashboard/
├── backend/                  # API REST en Spring Boot 3.4 (Java 21)
│   ├── src/main/java/        # Controladores, Servicios, Repositorios, DTOs y Seguridad
│   ├── src/main/resources/   # Configuración (application.yml) y script DDL inicial (init.sql)
│   └── Dockerfile            # Construcción multi-stage de la API
├── frontend/                 # Aplicación Web React + TypeScript + Vite
│   ├── src/                  # Componentes, Hooks, Vistas, Servicios y Modelos
│   ├── nginx.conf            # Configuración de Nginx para producción y proxy inverso
│   └── Dockerfile            # Construcción multi-stage de la SPA
├── pgadmin/
│   └── servers.json          # Preconfiguración de conexión a la base de datos
├── docker-compose.yml        # Orquestación de todos los contenedores
└── .env.example              # Plantilla de variables de entorno configurables
```

---

## ⚙️ Requisitos Previos

- **Docker Desktop** (versión 24.0 o superior) y **Docker Compose** (v2.0 o superior).
- *(Opcional para desarrollo local sin Docker)*:
  - Node.js 20+ y npm.
  - Java 21 JDK y Maven 3.9+.

---

## 📦 Configuración de Variables de Entorno

Antes de iniciar el proyecto, copia el archivo de plantilla `.env.example` a `.env`:

```bash
cp .env.example .env
```

Puedes personalizar los puertos y credenciales según tus necesidades. Los valores por defecto funcionan de forma inmediata:

| Variable | Valor por defecto | Descripción |
|---|---|---|
| `POSTGRES_DB` | `ecommerce_db` | Nombre de la base de datos |
| `POSTGRES_USER` | `dashboard_user` | Usuario de PostgreSQL |
| `POSTGRES_PASSWORD` | `dashboard_pass` | Contraseña de PostgreSQL |
| `POSTGRES_HOST_PORT` | `5433` | Puerto expuesto de PostgreSQL al host |
| `SERVER_PORT` | `8080` | Puerto del Backend Spring Boot |
| `FRONTEND_PORT` | `5173` | Puerto del Frontend Web |
| `PGADMIN_PORT` | `5050` | Puerto de la consola web pgAdmin 4 |
| `JWT_SECRET` | *(Clave Base64 256 bits)* | Clave para firma de tokens JWT |
| `JWT_EXPIRATION` | `86400000` | Tiempo de vida del token (24 horas en ms) |

---

## 🚀 Puesta en Marcha

### Opción 1: Ejecución con Docker Compose (Recomendada)

Para compilar y levantar todos los servicios automáticamente:

```bash
docker compose up --build -d
```

Para verificar que todos los contenedores se encuentren activos y saludables:

```bash
docker compose ps
```

Para detener los contenedores:

```bash
docker compose down
```

---

### Opción 2: Ejecución para Desarrollo Local (Paso a Paso)

1. **Iniciar PostgreSQL y pgAdmin:**
   ```bash
   docker compose up -d postgres pgadmin
   ```

2. **Iniciar el Backend (Spring Boot):**
   ```bash
   cd backend
   mvn spring-boot:run
   ```

3. **Iniciar el Frontend (Vite Dev Server):**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 🔑 Credenciales de Acceso

### 1. Aplicación Web E-Commerce Dashboard
- **URL:** [http://localhost:5173](http://localhost:5173)
- **Email:** `admin@dashboard.com`
- **Contraseña:** `Admin123!`

### 2. Consola de Base de Datos (pgAdmin 4)
- **URL:** [http://localhost:5050](http://localhost:5050)
- **Email:** `admin@dashboard.com`
- **Contraseña:** `Admin123!`
- **Contraseña de PostgreSQL:** `dashboard_pass` *(al conectar con el servidor `Ecommerce DB`)*

---

## 🖥️ Uso de la Aplicación

Una vez iniciada la sesión, dispones de una barra de navegación con 4 módulos principales:

1. **Dashboard:**
   - Resumen de ingresos, pedidos y usuarios.
   - Gráficas interactivas de ventas mensuales, categorías y estados de órdenes.
   - Tabla de productos más vendidos.
   - Botón de **Actualizar** para sincronizar datos en tiempo real.

2. **Productos:**
   - Catálogo completo con buscador por nombre y filtro por categoría.
   - Botón **Nuevo Producto** para dar de alta artículos con nombre, categoría, precio y stock.
   - Opciones para **Editar** precio/existencias o **Eliminar** productos (con protección si tienen pedidos asociados).

3. **Pedidos:**
   - Listado histórico de transacciones.
   - Botón **Nuevo Pedido** con selección de cliente, adición dinámica de productos, validación de stock y cálculo de total en vivo.
   - Selector directo para actualizar el estado del pedido (`COMPLETED`, `PENDING`, `CANCELLED`). Al cancelar, el inventario se devuelve automáticamente.
   - Botón para inspeccionar el desglose detallado de cada orden.

4. **Clientes:**
   - Directorio de clientes registrados y formulario para añadir nuevos compradores.

---

## 🗄️ Administración de Base de Datos con pgAdmin 4

pgAdmin 4 permite gestionar visualmente la misma base de datos utilizada por el sistema:

1. Ingresa a [http://localhost:5050](http://localhost:5050) e inicia sesión.
2. En el panel izquierdo, despliega **Servers** ➔ **Ecommerce DB**.
3. Si solicita contraseña, ingresa `dashboard_pass` y marca la casilla *Save Password*.
4. Navega a **Databases** ➔ **ecommerce_db** ➔ **Schemas** ➔ **public** ➔ **Tables**.
5. Haz clic derecho sobre cualquier tabla (ej. `products` u `orders`) y selecciona **View/Edit Data** ➔ **All Rows** para ver y editar registros visualmente.

### Consulta SQL de Ejemplo
Puedes abrir el **Query Tool** (icono de llave o menú `Tools` > `Query Tool`) y ejecutar consultas como:

```sql
-- Consultar el balance de inventario y unidades vendidas
SELECT 
    p.name, 
    p.category, 
    p.price, 
    p.stock, 
    COALESCE(SUM(oi.quantity), 0) AS unidades_vendidas
FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.id
GROUP BY p.id, p.name, p.category, p.price, p.stock
ORDER BY unidades_vendidas DESC;
```

---

## 📡 Endpoints de la API REST

Todos los endpoints (excepto `/api/auth/login`) requieren cabecera `Authorization: Bearer <TOKEN>`.

### Autenticación
- `POST /api/auth/login`: Autenticación de usuario. Retorna token JWT y datos de perfil.

### Dashboard
- `GET /api/dashboard/metrics`: Obtiene el resumen de KPIs, series mensuales y estadísticas de ventas.

### Productos
- `GET /api/products`: Lista todos los productos.
- `GET /api/products/{id}`: Obtiene el detalle de un producto por ID.
- `POST /api/products`: Crea un nuevo producto.
- `PUT /api/products/{id}`: Actualiza un producto existente.
- `DELETE /api/products/{id}`: Elimina un producto.

### Pedidos
- `GET /api/orders`: Lista todos los pedidos con datos de cliente.
- `GET /api/orders/{id}`: Obtiene el detalle de un pedido y sus artículos.
- `POST /api/orders`: Registra un nuevo pedido y descuenta el stock.
- `PATCH /api/orders/{id}/status`: Actualiza el estado (`COMPLETED`, `PENDING`, `CANCELLED`).
- `DELETE /api/orders/{id}`: Elimina un pedido.

### Clientes
- `GET /api/customers`: Lista todos los clientes registrados.
- `POST /api/customers`: Registra un nuevo cliente.

---

## 🧪 Pruebas Unitarias

Para ejecutar la suite de pruebas unitarias del backend:

```bash
docker run --rm -v "$(pwd)/backend":/app -w /app maven:3.9-eclipse-temurin-21-alpine mvn test
```

O localmente con Maven:

```bash
cd backend
mvn test
```

---

## 📄 Licencia

Este proyecto se distribuye bajo la licencia MIT.
