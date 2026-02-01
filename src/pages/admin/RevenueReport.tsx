import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, Calendar, RefreshCcw, 
  Download, DollarSign, CreditCard, 
  ArrowUp, TrendingUp, ArrowRight
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

// --- 1. MOCK DATA (Dữ liệu giả lập cho biểu đồ đường) ---

// Theo Giờ (Ngày)
const DATA_DAY = Array.from({ length: 24 }, (_, i) => ({ 
  name: `${i}:00`, 
  revenue: Math.floor(Math.random() * 500000) + 100000 
}));

// Theo Thứ (Tuần)
const DATA_WEEK = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => ({ 
  name: d, 
  revenue: Math.floor(Math.random() * 3000000) + 500000 
}));

// Theo Ngày (Tháng)
const DATA_MONTH = Array.from({ length: 30 }, (_, i) => ({ 
  name: `${i+1}`, 
  revenue: Math.floor(Math.random() * 2000000) + 200000 
}));

// Theo Tháng (Năm)
const DATA_YEAR = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'].map(d => ({ 
  name: d, 
  revenue: Math.floor(Math.random() * 50000000) + 10000000 
}));

// Dữ liệu Giao dịch
const TRANSACTIONS = [
  { id: 'TX001', readerId: 'R001', readerName: 'Nguyễn Minh Anh', package: 'VIP Monthly', amount: 500000, date: '2024-02-01 10:30', status: 'Completed' },
  { id: 'TX002', readerId: 'R005', readerName: 'Madame Rose', package: 'Gói 10 lượt', amount: 100000, date: '2024-02-01 11:15', status: 'Completed' },
  { id: 'TX003', readerId: 'R002', readerName: 'Lê Thị Hương', package: 'Gói 50 lượt', amount: 400000, date: '2024-02-01 14:20', status: 'Pending' },
  { id: 'TX004', readerId: 'R001', readerName: 'Nguyễn Minh Anh', package: 'Gói 20 lượt', amount: 180000, date: '2024-01-31 09:00', status: 'Completed' },
  { id: 'TX005', readerId: 'R008', readerName: 'Mystic John', package: 'VIP Monthly', amount: 500000, date: '2024-01-31 16:45', status: 'Failed' },
  { id: 'TX006', readerId: 'R003', readerName: 'Võ Thị Mai', package: 'Gói 10 lượt', amount: 100000, date: '2024-01-30 08:30', status: 'Completed' },
];

// --- 2. COMPONENTS ---

const StatCard = ({ icon: Icon, label, value, subValue, color }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-all">
    <div className={`p-4 rounded-2xl ${color} bg-opacity-10 text-white shadow-sm`}>
      <Icon size={28} className={color.replace('bg-', 'text-')} />
    </div>
    <div>
      <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">{label}</p>
      <h3 className="text-3xl font-black text-slate-800 mt-1">{value}</h3>
      {subValue && <p className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-1"><ArrowUp size={12}/> {subValue}</p>}
    </div>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  if (status === 'Completed') return <span className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg text-[10px] font-bold border border-emerald-100 uppercase">Thành công</span>;
  if (status === 'Pending') return <span className="text-amber-600 bg-amber-50 px-3 py-1 rounded-lg text-[10px] font-bold border border-amber-100 uppercase">Đang xử lý</span>;
  return <span className="text-red-600 bg-red-50 px-3 py-1 rounded-lg text-[10px] font-bold border border-red-100 uppercase">Thất bại</span>;
};

// --- 3. MAIN PAGE ---

export default function RevenueReport() {
  // --- STATES ---
  const [timeView, setTimeView] = useState<'day'|'week'|'month'|'year'>('day');
  
  // Date Range Filter
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Transaction Search
  const [searchTx, setSearchTx] = useState('');
  const [searchReaderName, setSearchReaderName] = useState('');

  // --- LOGIC ---
  const currentChartData = useMemo(() => {
    // Nếu có chọn ngày cụ thể thì ưu tiên logic lọc ngày (ở đây demo switch case theo Tab)
    switch(timeView) {
        case 'week': return DATA_WEEK;
        case 'month': return DATA_MONTH;
        case 'year': return DATA_YEAR;
        default: return DATA_DAY;
    }
  }, [timeView]);

  const filteredTransactions = useMemo(() => {
      return TRANSACTIONS.filter(t => {
          const matchTx = t.id.toLowerCase().includes(searchTx.toLowerCase());
          const matchRName = t.readerName.toLowerCase().includes(searchReaderName.toLowerCase());
          
          // Logic lọc ngày đơn giản (String compare) - Thực tế cần parse Date
          let matchDate = true;
          if (dateFrom && t.date < dateFrom) matchDate = false;
          if (dateTo && t.date > dateTo) matchDate = false;

          return matchTx && matchRName && matchDate;
      });
  }, [searchTx, searchReaderName, dateFrom, dateTo]);

  const totalRevenue = filteredTransactions.filter(t => t.status === 'Completed').reduce((acc, curr) => acc + curr.amount, 0);
  const totalTx = filteredTransactions.length;

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 animate-fade-in-up font-sans text-slate-800 p-6">
      
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-indigo-600">
          Báo Cáo Doanh Thu
        </h1>
        <p className="text-sm text-gray-500 mt-1">Theo dõi dòng tiền và đối soát giao dịch</p>
      </div>

      {/* --- CONTROL BAR (BỘ LỌC CHÍNH) --- */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* 1. Chọn nhanh (Ngày/Tuần/Tháng/Năm) */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
              {['day', 'week', 'month', 'year'].map((t) => (
                  <button 
                      key={t}
                      onClick={() => setTimeView(t as any)}
                      className={`px-4 py-2 text-xs font-bold rounded-lg transition-all capitalize ${
                          timeView === t 
                          ? 'bg-white text-purple-700 shadow-sm' 
                          : 'text-gray-500 hover:text-purple-600'
                      }`}
                  >
                      {t === 'day' ? 'Hôm nay' : t === 'week' ? 'Tuần này' : t === 'month' ? 'Tháng này' : 'Năm nay'}
                  </button>
              ))}
          </div>

          {/* 2. Chọn khoảng ngày (Custom Range) */}
          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-1.5 bg-white">
              <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400">Từ</span>
                  <input type="date" className="text-sm outline-none text-slate-700 font-medium" value={dateFrom} onChange={e => setDateFrom(e.target.value)}/>
              </div>
              <ArrowRight size={14} className="text-gray-300"/>
              <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400">Đến</span>
                  <input type="date" className="text-sm outline-none text-slate-700 font-medium" value={dateTo} onChange={e => setDateTo(e.target.value)}/>
              </div>
          </div>

          {/* 3. Nút xuất báo cáo */}
          <button className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-200 transition-all">
              <Download size={16}/> Xuất Excel
          </button>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StatCard 
            icon={DollarSign} 
            label={`Doanh thu (${timeView === 'day' ? 'Hôm nay' : timeView})`} 
            value={formatCurrency(totalRevenue)} 
            subValue="+12.5% tăng trưởng"
            color="bg-emerald-500" 
        />
        <StatCard 
            icon={CreditCard} 
            label="Tổng giao dịch" 
            value={totalTx} 
            subValue="Đã bao gồm VAT"
            color="bg-purple-500" 
        />
      </div>

      {/* --- CHART SECTION (AREA CHART - BIỂU ĐỒ ĐƯỜNG) --- */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
          <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <TrendingUp size={20} className="text-purple-600"/> Biểu đồ tăng trưởng
              </h3>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#9333ea" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                    dy={10}
                />
                <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                    tickFormatter={(value) => `${value / 1000000}M`}
                />
                <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    cursor={{ stroke: '#9333ea', strokeWidth: 2, strokeDasharray: '5 5' }}
                    // Fix lỗi TS bằng cách ép kiểu value
                    formatter={(value: any) => [formatCurrency(Number(value)), 'Doanh thu']}
                />
                <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#9333ea" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#7e22ce' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
      </div>

      {/* DETAILED TRANSACTION TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          
          <div className="p-5 border-b border-gray-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 text-purple-700 font-bold text-sm uppercase">
                  <Filter size={16}/> Giao dịch gần đây
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:flex-none">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                      <input 
                        type="text" placeholder="Tìm ID giao dịch..." 
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                        value={searchTx} onChange={e => setSearchTx(e.target.value)}
                      />
                  </div>
                  <input 
                    type="text" placeholder="Tên Reader..." 
                    className="flex-1 md:flex-none px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                    value={searchReaderName} onChange={e => setSearchReaderName(e.target.value)}
                  />
              </div>
          </div>

          <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead className="bg-white border-b border-gray-200 text-xs text-gray-500 font-bold uppercase">
                      <tr>
                          <th className="px-6 py-4">ID Giao dịch</th>
                          <th className="px-6 py-4">Reader</th>
                          <th className="px-6 py-4">Gói dịch vụ</th>
                          <th className="px-6 py-4">Số tiền (Gốc)</th>
                          <th className="px-6 py-4">Ngày giờ</th>
                          <th className="px-6 py-4 text-center">Trạng thái</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                      {filteredTransactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-purple-50/10 transition-colors">
                              <td className="px-6 py-4 font-mono text-xs font-bold text-gray-500">{tx.id}</td>
                              <td className="px-6 py-4">
                                  <p className="text-sm font-bold text-slate-700">{tx.readerName}</p>
                                  <p className="text-[10px] font-mono text-gray-400">{tx.readerId}</p>
                              </td>
                              <td className="px-6 py-4">
                                  <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold border border-indigo-100">{tx.package}</span>
                              </td>
                              <td className="px-6 py-4 font-bold text-slate-700">{formatCurrency(tx.amount)}</td>
                              <td className="px-6 py-4 text-sm text-gray-500">{tx.date}</td>
                              <td className="px-6 py-4 text-center">
                                  <StatusBadge status={tx.status} />
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
          {filteredTransactions.length === 0 && <div className="p-8 text-center text-gray-400 italic">Không tìm thấy giao dịch nào.</div>}
      </div>

    </div>
  );
}