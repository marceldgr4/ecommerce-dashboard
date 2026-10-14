import { useState } from 'react';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Clock,
  LogOut,
  LayoutDashboard,
  Package,
  ShoppingBag,
  RefreshCw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../../hooks/useDashboard';
import { useAuth } from '../../hooks/useAuth';
import { MetricCard } from '../../components/ui/MetricCard';
import {
  RevenueChart,
  OrdersChart,
  CategoryChart,
  OrderStatusChart,
  TopProductsTable,
} from '../../components/charts';
import { ProductsView } from '../../components/products/ProductsView';
import { OrdersView } from '../../components/orders/OrdersView';
import { CustomersView } from '../../components/customers/CustomersView';
import { formatCurrency, formatNumber } from '../../utils';

type ActiveTab = 'dashboard' | 'products' | 'orders' | 'customers';

export const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const { metrics, isLoading, error, refetch } = useDashboard();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab === 'dashboard') {
      refetch();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-slate-800/95 backdrop-blur-md border-b border-slate-700 sticky top-0 z-40 px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">E-Commerce System</h1>
              <p className="text-[11px] text-slate-400">PostgreSQL + Spring Boot + React</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-750 p-1 rounded-xl border border-slate-700/80">
            <button
              onClick={() => handleTabChange('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dashboard
            </button>
            <button
              onClick={() => handleTabChange('products')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'products'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              Productos
            </button>
            <button
              onClick={() => handleTabChange('orders')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'orders'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Pedidos
            </button>
            <button
              onClick={() => handleTabChange('customers')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'customers'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Clientes
            </button>
          </nav>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <div className="text-xs font-medium text-white">{user?.fullName}</div>
            <div className="text-[10px] text-indigo-400 font-mono uppercase">{user?.role}</div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-slate-400 hover:text-rose-400 text-xs transition px-3 py-1.5 rounded-lg hover:bg-slate-700/80 border border-slate-700"
            title="Cerrar sesión"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      {/* Mobile Navigation Tabs */}
      <div className="md:hidden flex items-center justify-around bg-slate-800 border-b border-slate-700 p-2 text-xs">
        <button
          onClick={() => handleTabChange('dashboard')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg ${
            activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          Métricas
        </button>
        <button
          onClick={() => handleTabChange('products')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg ${
            activeTab === 'products' ? 'bg-indigo-600 text-white' : 'text-slate-400'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          Productos
        </button>
        <button
          onClick={() => handleTabChange('orders')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg ${
            activeTab === 'orders' ? 'bg-indigo-600 text-white' : 'text-slate-400'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          Pedidos
        </button>
        <button
          onClick={() => handleTabChange('customers')}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg ${
            activeTab === 'customers' ? 'bg-indigo-600 text-white' : 'text-slate-400'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Clientes
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Resumen Operativo</h2>
                <p className="text-xs text-slate-400">
                  Métricas calculadas en tiempo real directamente sobre PostgreSQL
                </p>
              </div>
              <button
                onClick={refetch}
                title="Actualizar métricas"
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 text-xs transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Actualizar</span>
              </button>
            </div>

            {isLoading && !metrics ? (
              <div className="py-24 text-center">
                <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-slate-400 text-sm">Cargando métricas de la base de datos...</p>
              </div>
            ) : error || !metrics ? (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-red-400 text-center">
                <p className="font-semibold text-base">Error al conectar con la base de datos</p>
                <p className="text-xs mt-1 opacity-75">{error}</p>
                <button
                  onClick={refetch}
                  className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs rounded-lg transition"
                >
                  Reintentar
                </button>
              </div>
            ) : (
              <>
                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <MetricCard
                    title="Ingresos Totales"
                    value={formatCurrency(metrics.totalRevenue)}
                    subtitle="Órdenes completadas"
                    icon={DollarSign}
                    iconColor="text-emerald-400"
                  />
                  <MetricCard
                    title="Total de Pedidos"
                    value={formatNumber(metrics.totalOrders)}
                    subtitle="Registros históricos"
                    icon={ShoppingCart}
                    iconColor="text-indigo-400"
                  />
                  <MetricCard
                    title="Clientes Registrados"
                    value={formatNumber(metrics.totalCustomers)}
                    subtitle="Directorio activo"
                    icon={Users}
                    iconColor="text-cyan-400"
                  />
                  <MetricCard
                    title="Pedidos Pendientes"
                    value={formatNumber(metrics.pendingOrders)}
                    subtitle="En espera de entrega"
                    icon={Clock}
                    iconColor="text-amber-400"
                  />
                </div>

                {/* Revenue + Orders charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <RevenueChart data={metrics.monthlySales} />
                  <OrdersChart data={metrics.monthlySales} />
                </div>

                {/* Category + Status charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <CategoryChart data={metrics.salesByCategory} />
                  <OrderStatusChart data={metrics.ordersByStatus} />
                </div>

                {/* Top Products table */}
                <TopProductsTable data={metrics.topProducts} />
              </>
            )}
          </div>
        )}

        {activeTab === 'products' && <ProductsView />}
        {activeTab === 'orders' && <OrdersView />}
        {activeTab === 'customers' && <CustomersView />}
      </main>
    </div>
  );
};
