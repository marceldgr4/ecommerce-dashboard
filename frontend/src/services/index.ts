import apiClient from './apiClient';
import type {
  AuthResponse,
  Customer,
  CustomerRequest,
  DashboardMetrics,
  LoginRequest,
  Order,
  OrderRequest,
  Product,
  ProductRequest,
} from '../types';

export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return data;
  },
};

export const dashboardService = {
  getMetrics: async (): Promise<DashboardMetrics> => {
    const { data } = await apiClient.get<DashboardMetrics>('/dashboard/metrics');
    return data;
  },
};

export const productService = {
  getAll: async (): Promise<Product[]> => {
    const { data } = await apiClient.get<Product[]>('/products');
    return data;
  },
  getById: async (id: string): Promise<Product> => {
    const { data } = await apiClient.get<Product>(`/products/${id}`);
    return data;
  },
  create: async (payload: ProductRequest): Promise<Product> => {
    const { data } = await apiClient.post<Product>('/products', payload);
    return data;
  },
  update: async (id: string, payload: ProductRequest): Promise<Product> => {
    const { data } = await apiClient.put<Product>(`/products/${id}`, payload);
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },
};

export const customerService = {
  getAll: async (): Promise<Customer[]> => {
    const { data } = await apiClient.get<Customer[]>('/customers');
    return data;
  },
  create: async (payload: CustomerRequest): Promise<Customer> => {
    const { data } = await apiClient.post<Customer>(`/customers`, payload);
    return data;
  },
};

export const orderService = {
  getAll: async (): Promise<Order[]> => {
    const { data } = await apiClient.get<Order[]>('/orders');
    return data;
  },
  getById: async (id: string): Promise<Order> => {
    const { data } = await apiClient.get<Order>(`/orders/${id}`);
    return data;
  },
  create: async (payload: OrderRequest): Promise<Order> => {
    const { data } = await apiClient.post<Order>('/orders', payload);
    return data;
  },
  updateStatus: async (id: string, status: string): Promise<Order> => {
    const { data } = await apiClient.patch<Order>(`/orders/${id}/status`, { status });
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/orders/${id}`);
  },
};
