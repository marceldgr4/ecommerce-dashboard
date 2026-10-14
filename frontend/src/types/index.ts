// Auth
export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  email: string;
  fullName: string;
  role: string;
}

// Dashboard metrics
export interface MonthlySales {
  month: string;
  revenue: number;
  orders: number;
}

export interface CategorySales {
  category: string;
  revenue: number;
}

export interface TopProduct {
  name: string;
  category: string;
  unitsSold: number;
  revenue: number;
}

export interface OrderStatus {
  status: string;
  count: number;
}

export interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  pendingOrders: number;
  monthlySales: MonthlySales[];
  salesByCategory: CategorySales[];
  topProducts: TopProduct[];
  ordersByStatus: OrderStatus[];
}

// Products
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  createdAt?: string;
}

export interface ProductRequest {
  name: string;
  category: string;
  price: number;
  stock: number;
}

// Customers
export interface Customer {
  id: string;
  fullName: string;
  email: string;
  country?: string;
  createdAt?: string;
}

export interface CustomerRequest {
  fullName: string;
  email: string;
  country?: string;
}

// Orders
export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productCategory: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderItemRequest {
  productId: string;
  quantity: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerCountry: string;
  status: 'COMPLETED' | 'PENDING' | 'CANCELLED';
  totalAmount: number;
  createdAt: string;
  items?: OrderItem[];
}

export interface OrderRequest {
  customerId: string;
  status: string;
  items: OrderItemRequest[];
}
