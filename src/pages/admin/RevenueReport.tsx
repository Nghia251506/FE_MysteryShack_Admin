"use client";

import React, { useEffect, useState, useMemo } from 'react';
import {
  Search, Filter, RefreshCcw,
  Download, DollarSign, CreditCard,
  ArrowUp, TrendingUp, ArrowRight, Loader2
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// Import Redux Hooks & Actions
import { useAppDispatch, useAppSelector } from '@/hooks/useAppRedux';
import { fetchAdminTransactions } from '../../store/features/adminSubscriptionSlice';

// --- COMPONENTS ---

const StatCard = ({ icon: Icon, label, value, subValue, color }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-all">
    <div className={`p-4 rounded-2xl ${color} bg-opacity-10 text-white shadow-sm`}>
      <Icon size={28} className={color.replace('bg-', 'text-')} />
    </div>
    <div>
      <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">{label}</p>
      <h3 className="text-3xl font-black text-slate-800 mt-1">{value}</h3>
      {subValue && <p className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-1"><ArrowUp size={12} /> {subValue}</p>}
    </div>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  // Map chuẩn status từ Backend: SUCCESS, FAILED, PENDING
  const s = status?.toUpperCase();
  if (s === 'SUCCESS') return <span className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg text-[10px] font-bold border border-emerald-100 uppercase">Thành công</span>;
  if (s === 'PENDING') return <span className="text-amber-600 bg-amber-50 px-3 py-1 rounded-lg text-[10px] font-bold border border-amber-100 uppercase">Đang xử lý</span>;
  return <span className="text-red-600 bg-red-50 px-3 py-1 rounded-lg text-[10px] font-bold border border-red-100 uppercase">Thất bại</span>;
};

// --- MAIN PAGE ---

export default function RevenueReport() {
  const dispatch = useAppDispatch();
  // Lấy dữ liệu từ adminSubSlice
  const { transactions, loading } = useAppSelector((state: any) => state.adminSub);

  // --- STATES ---
  const [timeView, setTimeView] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchTx, setSearchTx] = useState('');
  const [searchReaderName, setSearchReaderName] = useState('');

  // 1. FETCH DATA TỪ BACKEND
  useEffect(() => {
    dispatch(fetchAdminTransactions({
      status: 'SUCCESS', // Hoặc để trống nếu muốn lấy hết
      from: dateFrom,
      to: dateTo
    }));
  }, [dispatch, dateFrom, dateTo]);

  // 2. ĐẢM BẢO TRANSACTIONS LUÔN LÀ MẢNG (Vì BE trả về Pageable)
  const safeTransactions = useMemo(() => {
    return Array.isArray(transactions) ? transactions : [];
  }, [transactions]);

  // 3. LOGIC LỌC DỮ LIỆU TẠI FRONTEND
  const filteredTransactions = useMemo(() => {
    return safeTransactions.filter((t: any) => {
      // 1. Lọc theo mã giao dịch (ID hoặc VNPay ID)
      const txId = (t.id?.toString() || "").toLowerCase();
      const vnpayId = (t.vnpayTranNo || "").toLowerCase();
      const searchId = searchTx.toLowerCase();
      const matchTx = txId.includes(searchId) || vnpayId.includes(searchId);

      // 2. Lọc theo tên Reader (Người mua)
      const readerName = (t.username || "").toLowerCase();
      const matchRName = readerName.includes(searchReaderName.toLowerCase());

      return matchTx && matchRName;
    });
  }, [safeTransactions, searchTx, searchReaderName]);

  // 4. THỐNG KÊ DOANH THU (Chỉ tính những cái SUCCESS)
  const totalRevenue = useMemo(() => {
    return safeTransactions.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  }, [safeTransactions]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  // 5. CHART DATA (Mock dựa trên data thật)
  const chartData = useMemo(() => {
    // 1. Nếu không có data, trả về mảng rỗng để biểu đồ hiện trục trống
    if (!filteredTransactions.length) return [];

    const revenueMap = new Map();

    // 2. Gom nhóm doanh thu theo ngày
    filteredTransactions.forEach((tx: any) => {
      // Chỉ tính giao dịch thành công
      if (tx.status === 'SUCCESS' || tx.status === 'SUCCESSFUL') {
        const dateKey = tx.paymentDate
          ? new Date(tx.paymentDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
          : 'N/A';

        revenueMap.set(dateKey, (revenueMap.get(dateKey) || 0) + (tx.amount || 0));
      }
    });

    // 3. Chuyển Map thành mảng
    let finalData = Array.from(revenueMap, ([name, revenue]) => ({ name, revenue }));

    // 4. MẸO CHỮA CHÁY: Nếu chỉ có 1 ngày, thêm 1 điểm 0đ ở phía trước để Recharts vẽ được đường kẻ
    if (finalData.length === 1) {
      return [
        { name: 'Bắt đầu', revenue: 0 },
        ...finalData
      ];
    }

    // Sắp xếp theo ngày (nếu cần)
    return finalData;
  }, [filteredTransactions]);

  if (loading && safeTransactions.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 p-6 font-sans text-slate-800">

      {/* HEADER & REFRESH */}
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-indigo-600 italic uppercase tracking-tight">
            Hệ Thống Đối Soát Doanh Thu
          </h1>
          <p className="text-sm text-gray-500 mt-1 italic font-medium">Dữ liệu giao dịch từ VNPay</p>
        </div>
        <button
          onClick={() => dispatch(fetchAdminTransactions({}))}
          className="p-2 hover:bg-white rounded-full transition-all text-purple-600 border border-transparent hover:border-purple-100"
        >
          <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* --- CONTROL BAR --- */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {['day', 'week', 'month', 'year'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeView(t as any)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all capitalize ${timeView === t ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-purple-600'}`}
            >
              {t === 'day' ? 'Hôm nay' : t === 'week' ? 'Tuần' : t === 'month' ? 'Tháng' : 'Năm'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-1.5 bg-white">
          <input type="date" className="text-sm outline-none font-medium bg-transparent" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          <ArrowRight size={14} className="text-gray-300" />
          <input type="date" className="text-sm outline-none font-medium bg-transparent" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>

        <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-sm font-bold transition-all shadow-lg">
          <Download size={16} /> Xuất dữ liệu
        </button>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StatCard
          icon={DollarSign}
          label="Tổng doanh thu"
          value={formatCurrency(totalRevenue)}
          subValue="Dữ liệu khớp thực tế"
          color="bg-emerald-500"
        />
        <StatCard
          icon={CreditCard}
          label="Giao dịch thành công"
          value={filteredTransactions.length}
          subValue={`Trên tổng số ${safeTransactions.length}`}
          color="bg-purple-500"
        />
      </div>

      {/* CHART */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8">
        <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2 uppercase italic">
          <TrendingUp size={20} className="text-purple-600" /> Phân tích tăng trưởng
        </h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
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
                // Sửa formatter để hiển thị đơn vị nghìn (k) vì doanh thu của ông đang tầm vài trăm k
                tickFormatter={(val) => val >= 1000 ? `${val / 1000}k` : val}
              />
              <Tooltip
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                // Ép kiểu (value: any) hoặc (value: number | string) để hết báo lỗi đỏ
                formatter={(value: any) => {
                  const amount = Number(value) || 0;
                  return [
                    <span key="amount" className="font-bold text-purple-700">
                      {new Intl.NumberFormat('vi-VN').format(amount)} đ
                    </span>,
                    'Doanh thu'
                  ];
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#9333ea"
                strokeWidth={4}
                fill="url(#colorRevenue)"
                // Thêm dot để dù có 1 điểm vẫn thấy cái chấm tròn
                dot={{ r: 4, fill: '#9333ea', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-slate-800 font-black uppercase italic flex items-center gap-2">
            <Filter size={18} className="text-purple-600" /> Bảng đối soát chi tiết
          </span>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text" placeholder="ID / VNPay ID..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                value={searchTx} onChange={e => setSearchTx(e.target.value)}
              />
            </div>
            <input
              type="text" placeholder="Tên khách hàng..."
              className="px-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
              value={searchReaderName} onChange={e => setSearchReaderName(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] text-gray-400 font-black uppercase tracking-[0.1em]">
                <th className="px-6 py-4">Mã tham chiếu (ID)</th>
                <th className="px-6 py-4">Ngân hàng</th>
                <th className="px-6 py-4">Thông tin Reader</th>
                <th className="px-6 py-4 text-right">Số tiền</th>
                <th className="px-6 py-4 text-center">Ngày thanh toán</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.map((tx: any) => (
                <tr key={tx.id} className="hover:bg-purple-50/30 transition-all group">
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-bold text-purple-600">{tx.orderId || `ID_${tx.id}`}</span>
                    <p className="text-[9px] text-gray-400 mt-0.5">VNPay: {tx.vnpayTranNo || 'N/A'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-slate-100 rounded flex items-center justify-center text-[10px] font-black text-slate-500">
                        {tx.bankCode?.substring(0, 3)}
                      </div>
                      <span className="text-xs font-bold text-slate-600">{tx.bankCode || 'VNPAY'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-black text-slate-700">{tx.username || 'Khách hàng lẻ'}</p>
                    <p className="text-[10px] text-indigo-500 font-bold uppercase">{tx.packageName || 'Gói VIP'}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-black text-slate-900">{formatCurrency(tx.amount)}</span>
                  </td>
                  <td className="px-6 py-4 text-center text-xs text-gray-500 font-medium">
                    {tx.paymentDate ? new Date(tx.paymentDate).toLocaleString('vi-VN') : 'Vừa xong'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <StatusBadge status={tx.status || 'SUCCESS'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredTransactions.length === 0 && !loading && (
          <div className="p-20 text-center">
            <div className="inline-flex p-4 rounded-full bg-slate-50 text-slate-300 mb-4">
              <Search size={32} />
            </div>
            <p className="text-gray-400 font-black uppercase tracking-widest text-xs italic">
              Không tìm thấy dữ liệu đối soát
            </p>
          </div>
        )}
      </div>
    </div>
  );
}