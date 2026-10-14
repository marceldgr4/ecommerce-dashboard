import { useState, useEffect, type FormEvent } from 'react';
import { X, Plus, Trash2, Loader2, ShoppingCart } from 'lucide-react';
import { customerService, productService } from '../../services';
import { formatCurrency } from '../../utils';
import type { Customer, Product, OrderRequest } from '../../types';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: OrderRequest) => Promise<boolean>;
}

interface SelectedItem {
  productId: string;
  quantity: number;
}

export const OrderModal = ({ isOpen, onClose, onSave }: OrderModalProps) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [status, setStatus] = useState('COMPLETED');
  const [items, setItems] = useState<SelectedItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setIsLoadingData(true);
      Promise.all([customerService.getAll(), productService.getAll()])
        .then(([custData, prodData]) => {
          setCustomers(custData);
          setProducts(prodData);
          if (custData.length > 0) setCustomerId(custData[0].id);
          if (prodData.length > 0) {
            setItems([{ productId: prodData[0].id, quantity: 1 }]);
          }
        })
        .catch(() => {
          setError('Error al cargar clientes y productos para el pedido');
        })
        .finally(() => setIsLoadingData(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    if (products.length === 0) return;
    setItems((prev) => [...prev, { productId: products[0].id, quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof SelectedItem, value: any) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  // Compute total in real-time
  const totalAmount = items.reduce((acc, item) => {
    const prod = products.find((p) => p.id === item.productId);
    return acc + (prod ? prod.price * item.quantity : 0);
  }, 0);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerId) {
      setError('Debes seleccionar un cliente');
      return;
    }
    if (items.length === 0) {
      setError('Debes agregar al menos un producto al pedido');
      return;
    }

    for (const item of items) {
      const prod = products.find((p) => p.id === item.productId);
      if (!prod) {
        setError('Producto no válido');
        return;
      }
      if (item.quantity <= 0) {
        setError(`La cantidad de "${prod.name}" debe ser mayor a 0`);
        return;
      }
      if (item.quantity > prod.stock) {
        setError(
          `Stock insuficiente para "${prod.name}". Disponible: ${prod.stock}, Solicitado: ${item.quantity}`
        );
        return;
      }
    }

    setIsSubmitting(true);
    const orderPayload: OrderRequest = {
      customerId,
      status,
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    };

    const success = await onSave(orderPayload);
    setIsSubmitting(false);

    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-white">Crear Nuevo Pedido</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          {isLoadingData ? (
            <div className="py-12 text-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
              Cargando catálogo y clientes...
            </div>
          ) : (
            <>
              {/* Customer and Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Cliente
                  </label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.fullName} ({c.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Estado del Pedido
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="COMPLETED">COMPLETED (Completado - Suma a ingresos)</option>
                    <option value="PENDING">PENDING (Pendiente)</option>
                  </select>
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Artículos a Comprar
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Agregar Producto
                  </button>
                </div>

                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {items.map((item, idx) => {
                    const prod = products.find((p) => p.id === item.productId);
                    const subtotal = prod ? prod.price * item.quantity : 0;

                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-3 bg-slate-750/70 p-3 rounded-xl border border-slate-700"
                      >
                        <div className="flex-1">
                          <select
                            value={item.productId}
                            onChange={(e) =>
                              handleItemChange(idx, 'productId', e.target.value)
                            }
                            className="w-full px-2.5 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            {products.map((p) => (
                              <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                                {p.name} - {formatCurrency(p.price)} (Stock: {p.stock})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="w-20">
                          <input
                            type="number"
                            min="1"
                            max={prod?.stock || 9999}
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(
                                idx,
                                'quantity',
                                parseInt(e.target.value, 10) || 1
                              )
                            }
                            className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-white text-xs text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>

                        <div className="w-24 text-right font-medium text-emerald-400 text-xs">
                          {formatCurrency(subtotal)}
                        </div>

                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 text-slate-400 hover:text-rose-400 transition"
                            title="Quitar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total Summary */}
              <div className="bg-slate-750 p-4 rounded-xl border border-slate-700 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">Total a Pagar:</span>
                <span className="text-xl font-bold text-emerald-400">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoadingData || items.length === 0}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg transition flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                'Confirmar Pedido'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
