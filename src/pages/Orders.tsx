import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  MapPin, 
  Phone, 
  Calendar, 
  Clock,
  CheckCircle2,
  Package,
  Truck,
  XCircle,
  MoreVertical,
  Loader2,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  { value: 'processing', label: 'Processing', icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
  { value: 'shipped', label: 'Shipped', icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { value: 'delivered', label: 'Delivered', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { value: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
];

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/allOrder');
      setOrders(response.data.data);
    } catch (err) {
      console.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await axios.patch(`/api/orders/${orderId}/status`, { status: newStatus });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      console.error('Status update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Orders Management</h1>
        <p className="text-slate-500">Track and fulfill customer orders in real-time.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
            placeholder="Search by Order ID, Customer, or City..."
          />
        </div>
        <div className="flex items-center gap-2">
          {STATUS_OPTIONS.map(opt => (
            <button 
              key={opt.value}
              className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg hover:bg-slate-50 transition-all text-slate-600"
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
        </div>
      ) : (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white p-20 rounded-2xl border border-slate-200 text-center text-slate-400">
               <ShoppingCart className="mx-auto mb-3 opacity-20" size={48} />
               <p className="text-lg font-medium text-slate-500">No orders found</p>
            </div>
          ) : (
            orders.map((order) => (
              <motion.div 
                key={order.id}
                layout
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6 border-b border-slate-50 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                      <ShoppingCart size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Order #{order.id}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative group">
                      <div className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
                        STATUS_OPTIONS.find(s => s.value === order.status)?.bg,
                        STATUS_OPTIONS.find(s => s.value === order.status)?.color
                      )}>
                        {updatingId === order.id ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <>
                            {(() => {
                              const S = STATUS_OPTIONS.find(s => s.value === order.status);
                              return S ? <S.icon size={16} /> : null;
                            })()}
                            <span className="capitalize">{order.status}</span>
                            <ChevronDown size={14} className="ml-1" />
                          </>
                        )}
                      </div>
                      <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 py-1">
                        {STATUS_OPTIONS.map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => handleStatusChange(order.id, opt.value)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                          >
                            <opt.icon size={14} />
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg">
                      <MoreVertical size={20} />
                    </button>
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Customer & Shipping */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Customer Details</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 text-xs font-bold">
                          {order.User.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{order.User.name}</p>
                          <p className="text-xs text-slate-500">{order.User.email}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin size={18} className="text-slate-400 mt-0.5 shrink-0" />
                        <p className="text-sm text-slate-600">{order.shippingAddress}, {order.city}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone size={18} className="text-slate-400 shrink-0" />
                        <p className="text-sm text-slate-600">{order.phoneNumber}</p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="md:col-span-2 space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Order Items</h4>
                    <div className="space-y-3">
                      {order.OrderItems.map((item: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 overflow-hidden">
                              <img src={item.Product.images[0]} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{item.productName}</p>
                              <p className="text-xs text-slate-500">Qty: {item.quantity} x Rs. {Math.round(parseFloat(item.price)).toLocaleString()}</p>
                            </div>
                          </div>
                          <p className="text-sm font-bold text-slate-900">Rs. {Math.round(parseFloat(item.total)).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                       <span className="text-sm font-bold text-slate-900">Total Amount</span>
                       <span className="text-xl font-black text-indigo-600">Rs. {Math.round(parseFloat(order.totalAmount)).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
