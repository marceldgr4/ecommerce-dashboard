import { X, Calendar, User, Globe, Mail, ShoppingCart } from 'lucide-react';
import { formatCurrency } from '../../utils';
import type { Order } from '../../types';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onStatusChange: (id: string, newStatus: string) => Promise<void>;
}

export const OrderDetailModal = ({
  isOpen,
  onClose,
  order,
  onStatusChange,
}: OrderDetailModalProps) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono tracking-wider text-indigo-400">
                Pedido #{order.id.slice(0, 8)}
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                  order.status === 'COMPLETED'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : order.status === 'PENDING'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {order.status}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">Detalle del Pedido</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Customer & Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-750/60 p-4 rounded-xl border border-slate-700/80">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                Cliente
              </div>
              <div className="font-semibold text-white text-sm">{order.customerName}</div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {order.customerEmail || 'Sin correo'}
              </div>
              {order.customerCountry && (
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  {order.customerCountry}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                Fecha de Creación
              </div>
              <div className="font-semibold text-white text-sm">
                {new Date(order.createdAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>

              <div className="pt-2">
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Cambiar Estado:
                </label>
                <select
                  value={order.status}
                  onChange={(e) => onStatusChange(order.id, e.target.value)}
                  className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="COMPLETED">COMPLETED (Completado)</option>
                  <option value="PENDING">PENDING (Pendiente)</option>
                  <option value="CANCELLED">CANCELLED (Cancelado)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-indigo-400" />
              Artículos del Pedido
            </h3>
            <div className="border border-slate-700 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-750 text-slate-400 uppercase tracking-wider border-b border-slate-700">
                  <tr>
                    <th className="px-4 py-2.5">Producto</th>
                    <th className="px-4 py-2.5 text-center">Cant.</th>
                    <th className="px-4 py-2.5 text-right">Precio Unit.</th>
                    <th className="px-4 py-2.5 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700 text-slate-300">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td className="px-4 py-2.5">
                          <div className="font-medium text-white">{item.productName}</div>
                          <div className="text-[10px] text-slate-400">{item.productCategory}</div>
                        </td>
                        <td className="px-4 py-2.5 text-center font-medium">{item.quantity}</td>
                        <td className="px-4 py-2.5 text-right">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-4 py-2.5 text-right font-semibold text-emerald-400">
                          {formatCurrency(item.subtotal)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                        No hay información detallada de artículos para este pedido histórico.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-slate-750/80 border-t border-slate-700 font-semibold text-white">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-right">
                      Total del Pedido:
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-400 text-sm">
                      {formatCurrency(order.totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-700 bg-slate-800/80">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
