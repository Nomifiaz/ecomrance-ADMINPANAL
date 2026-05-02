import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  TrendingUp, 
  ArrowUpRight, 
  FileText,
  Loader2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function Reports() {
  const [report, setReport] = useState<any>(null);
  const [range, setRange] = useState('weekly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [range]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/report?range=${range}`);
      setReport(response.data);
    } catch (err) {
      console.error('Report fetch failed');
    } finally {
      setLoading(false);
    }
  };

  const salesData = [
    { day: 'Mon', revenue: 4000, orders: 20 },
    { day: 'Tue', revenue: 3000, orders: 15 },
    { day: 'Wed', revenue: report?.summary?.totalRevenue || 2000, orders: 10 },
    { day: 'Thu', revenue: 2780, orders: 12 },
    { day: 'Fri', revenue: 1890, orders: 8 },
    { day: 'Sat', revenue: 2390, orders: 11 },
    { day: 'Sun', revenue: 3490, orders: 18 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sales Reports</h1>
          <p className="text-slate-500">Analyze your performance and export data.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <Download size={18} />
            Export CSV
          </button>
          <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            {['daily', 'weekly', 'monthly', 'yearly'].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  range === r ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Revenue Performance</h3>
                  <p className="text-slate-500 text-sm">Showing total revenue for the current {range} period</p>
                </div>
                <TrendingUp size={24} className="text-indigo-600" />
              </div>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40} />
                    <Bar dataKey="orders" fill="#94a3b8" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Summary</h4>
                <div className="space-y-6">
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-1">Total Revenue</p>
                    <div className="flex items-end gap-2">
                      <h2 className="text-3xl font-black text-slate-900">${report?.summary?.totalRevenue}</h2>
                      <span className="text-emerald-500 text-xs font-bold mb-1 flex items-center">
                        <ArrowUpRight size={14} /> 12%
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-1">Total Orders</p>
                    <h2 className="text-3xl font-black text-slate-900">{report?.summary?.totalOrders}</h2>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium mb-1">Avg. Order Value</p>
                    <h2 className="text-3xl font-black text-slate-900">${report?.summary?.averageOrderValue}</h2>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 p-6 rounded-2xl shadow-xl shadow-slate-200 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <FileText size={20} className="text-indigo-400" />
                  </div>
                  <h4 className="font-bold">Next Report Due</h4>
                </div>
                <p className="text-slate-400 text-sm mb-6">Your monthly financial summary will be automatically generated in 4 days.</p>
                <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-bold transition-all">
                  Set Reminders
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
