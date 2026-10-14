import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  ResponsiveContainer,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend,
} from 'recharts';
import type { MonthlySales, CategorySales, OrderStatus, TopProduct } from '../../types';
import { formatCurrency } from '../../utils';

const COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#10b981', '#f43f5e'];

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

const ChartCard = ({ title, children }: ChartCardProps) => (
  <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
    <h3 className="text-white font-semibold mb-5">{title}</h3>
    {children}
  </div>
);

// Monthly Revenue Area Chart
export const RevenueChart = ({ data }: { data: MonthlySales[] }) => (
  <ChartCard title="Monthly Revenue">
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} />
        <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
        <Tooltip
          contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
          labelStyle={{ color: '#f1f5f9' }}
          formatter={(v: number) => [formatCurrency(v), 'Revenue']}
        />
        <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#revenueGradient)" />
      </AreaChart>
    </ResponsiveContainer>
  </ChartCard>
);

// Orders Bar Chart
export const OrdersChart = ({ data }: { data: MonthlySales[] }) => (
  <ChartCard title="Monthly Orders">
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} />
        <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
        <Tooltip
          contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
          labelStyle={{ color: '#f1f5f9' }}
        />
        <Bar dataKey="orders" fill="#22d3ee" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </ChartCard>
);

// Category Pie Chart
export const CategoryChart = ({ data }: { data: CategorySales[] }) => (
  <ChartCard title="Revenue by Category">
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" outerRadius={90} dataKey="revenue" nameKey="category" label={({ category }) => category}>
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
          formatter={(v: number) => [formatCurrency(v), 'Revenue']}
        />
        <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
      </PieChart>
    </ResponsiveContainer>
  </ChartCard>
);

// Order Status Chart
export const OrderStatusChart = ({ data }: { data: OrderStatus[] }) => (
  <ChartCard title="Orders by Status">
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} />
        <YAxis dataKey="status" type="category" tick={{ fill: '#94a3b8', fontSize: 12 }} width={90} />
        <Tooltip
          contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
          labelStyle={{ color: '#f1f5f9' }}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </ChartCard>
);

// Top Products Table
export const TopProductsTable = ({ data }: { data: TopProduct[] }) => (
  <ChartCard title="Top Products">
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-slate-400 border-b border-slate-700">
            <th className="text-left pb-3 font-medium">Product</th>
            <th className="text-left pb-3 font-medium">Category</th>
            <th className="text-right pb-3 font-medium">Units</th>
            <th className="text-right pb-3 font-medium">Revenue</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/50">
          {data.map((product) => (
            <tr key={product.name} className="text-slate-300 hover:bg-slate-700/30 transition">
              <td className="py-3 font-medium text-white">{product.name}</td>
              <td className="py-3">
                <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-0.5 rounded-full">
                  {product.category}
                </span>
              </td>
              <td className="py-3 text-right">{product.unitsSold}</td>
              <td className="py-3 text-right font-medium text-emerald-400">
                {formatCurrency(product.revenue)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </ChartCard>
);
