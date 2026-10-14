import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Eye, Trash2, ShoppingBag, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { orderService } from '../../services';
import { OrderModal } from './OrderModal';
import { OrderDetailModal } from './OrderDetailModal';
import { formatCurrency } from '../../utils';
import type { Order, OrderRequest } from '../../types';

export const OrdersView = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<Order | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await orderService.getAll();
      setOrders(data);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.response?.data?.detail || 'Error al cargar los pedidos desde PostgreSQL',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCreateOrder = async (payload: OrderRequest): Promise<boolean> => {
    try {
      const created = await orderService.create(payload);
      setOrders((prev) => [created, ...prev]);
      setFeedback({
        type: 'success',
        message: `Pedido #${created.id.slice(0, 8)} creado exitosamente por ${formatCurrency(created.totalAmount)}`,
      });
      return true;
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Error al registrar el pedido';
      setFeedback({ type: 'error', message: msg });
      return false;
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const updated = await orderService.updateStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (selectedOrderDetail && selectedOrderDetail.id === orderId) {
        setSelectedOrderDetail(updated);
      }
      setFeedback({
        type: 'success',
        message: `Estado del pedido #${orderId.slice(0, 8)} actualizado a ${newStatus}`,
      });
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Error al actualizar el estado del pedido';
      setFeedback({ type: 'error', message: msg });
    }
  };

  const handleDeleteOrder = async (order: Order) => {
    if (!window.confirm(`¿Estás seguro de eliminar el pedido #${order.id.slice(0, 8)}?`)) {
      return;
    }
    try {
      await orderService.delete(order.id);
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
      if (selectedOrderDetail?.id === order.id) {
        setSelectedOrderDetail(null);
      }
      setFeedback({
        type: 'success',
        message: `Pedido #${order.id.slice(0, 8)} eliminado correctamente`,
      });
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Error al eliminar el pedido';
      setFeedback({ type: 'error', message: msg });
    }
  };

  const handleViewDetails = async (order: Order) => {
    try {
      // Fetch full details with items
      const fullOrder = await orderService.getById(order.id);
      setSelectedOrderDetail(fullOrder);
    } catch {
      setSelectedOrderDetail(order);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.customerName.toLowerCase().includes(search.toLowerCase()) ||
        (o.customerEmail && o.customerEmail.toLowerCase().includes(search.toLowerCase()));
      const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`flex items-center justify-between p-4 rounded-xl border ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400" />
            )}
            {feedback.message}
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs uppercase tracking-wider opacity-70 hover:opacity-100"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600/20 text-indigo-400 rounded-xl flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Gestión de Pedidos</h2>
            <p className="text-xs text-slate-400">
              {filteredOrders.length} de {orders.length} pedidos registrados
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
            title="Recargar pedidos"
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-xl transition shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            Nuevo Pedido
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-800/60 p-3 rounded-2xl border border-slate-700/80">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cliente, correo o ID de pedido..."
            className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Estado:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Todos los estados</option>
            <option value="COMPLETED">COMPLETED (Completado)</option>
            <option value="PENDING">PENDING (Pendiente)</option>
            <option value="CANCELLED">CANCELLED (Cancelado)</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800/90 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-700">
              <tr>
                <th className="px-6 py-4">ID Pedido / Fecha</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4 text-center">Estado</th>
                <th className="px-6 py-4 text-right">Monto Total</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 text-slate-300">
              {isLoading && orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
                    Cargando pedidos desde PostgreSQL...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No se encontraron pedidos coincidentes.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-750/50 transition">
                    <td className="px-6 py-4">
                      <div className="font-mono text-indigo-400 font-semibold text-xs">
                        #{o.id.slice(0, 8)}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {new Date(o.createdAt).toLocaleDateString('es-ES', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{o.customerName}</div>
                      <div className="text-xs text-slate-400">{o.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold border cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                          o.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : o.status === 'PENDING'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        <option value="COMPLETED" className="bg-slate-800 text-emerald-400">
                          COMPLETED
                        </option>
                        <option value="PENDING" className="bg-slate-800 text-amber-400">
                          PENDING
                        </option>
                        <option value="CANCELLED" className="bg-slate-800 text-rose-400">
                          CANCELLED
                        </option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-emerald-400 text-sm">
                      {formatCurrency(o.totalAmount)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetails(o)}
                          className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-700 rounded-lg transition"
                          title="Ver detalle del pedido"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(o)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700 rounded-lg transition"
                          title="Eliminar pedido"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <OrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateOrder}
      />

      <OrderDetailModal
        isOpen={!!selectedOrderDetail}
        onClose={() => setSelectedOrderDetail(null)}
        order={selectedOrderDetail}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};
