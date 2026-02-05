import React, { useEffect, useState } from 'react';
import { 
  Users, BookOpen, Calendar, Activity, 
  ArrowUp, Star, TrendingUp, Clock, Search
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// IMPORT HOOKS CỦA ÔNG GIÁO
import { useAppDispatch, useAppSelector } from '../../hooks/useAppRedux'; // Điều chỉnh path nếu cần
import { fetchDashboardData, updateNewSession, setSessions } from '../../store/features/dashboardSlice';
import { dashboardService } from '@/services/dashboardService';

// --- SUB-COMPONENTS ---
const StatCard = ({ icon: Icon, label, value, growth, color }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color}`}><Icon size={24} /></div>
      <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
        <ArrowUp size={12} /> +{growth || 0}%
      </div>
    </div>
    <div>
      <p className="text-gray-500 text-sm font-medium mb-1">{label}</p>
      <h3 className="text-3xl font-black text-slate-800">{value?.toLocaleString() || 0}</h3>
    </div>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const s = status?.toUpperCase();
  if (s === 'IN_PROGRESS' || s === 'IN PROGRESS') 
    return <span className="text-purple-600 bg-purple-50 px-3 py-1 rounded-full text-[10px] font-bold border border-purple-100 uppercase tracking-wider animate-pulse">Đang diễn ra</span>;
  if (s === 'COMPLETED') 
    return <span className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-[10px] font-bold border border-emerald-100 uppercase tracking-wider">Hoàn thành</span>;
  return <span className="text-red-500 bg-red-50 px-3 py-1 rounded-full text-[10px] font-bold border border-red-100 uppercase tracking-wider">Đã hủy</span>;
};

// --- MAIN PAGE ---
export default function Dashboard() {
  // DÙNG HOOK XỊN ÔNG GIÁO GỬI
  const dispatch = useAppDispatch();
  const { stats, sessions, chartData, topReaders, loading } = useAppSelector((state) => state.dashboard);
  
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // 1. Fetch data ban đầu qua Async Thunk
    dispatch(fetchDashboardData());

    // 2. WebSocket Real-time
    const socket = new SockJS('http://localhost:8080/ws-dashboard');
    const stompClient = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        stompClient.subscribe('/topic/admin/sessions', (msg) => {
          dispatch(updateNewSession(JSON.parse(msg.body)));
        });
      },
      reconnectDelay: 5000,
    });

    stompClient.activate();
    return () => { stompClient.deactivate(); };
  }, [dispatch]);

  // Handle Search
  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    try {
      const res = await dashboardService.getSessions(value);
      dispatch(setSessions(res.data));
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 animate-fade-in font-sans text-slate-800 p-6">
      
      {/* HEADER */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-indigo-600">
            Tổng quan hôm nay
          </h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
            <Clock size={14}/> Cập nhật real-time từ hệ thống
          </p>
        </div>
        <div className="hidden md:block">
            <p className="text-xs font-bold text-purple-600 bg-purple-50 px-4 py-2 rounded-xl shadow-sm border border-purple-100">
                {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={Calendar} label="Tổng phiên" value={stats?.totalSessionsToday} growth={stats?.sessionGrowth} color="bg-purple-50 text-purple-600" />
        <StatCard icon={Activity} label="Đang diễn ra" value={stats?.activeSessions} growth={stats?.activeGrowth} color="bg-blue-50 text-blue-600" />
        <StatCard icon={BookOpen} label="Reader Online" value={stats?.onlineReaders} growth={stats?.readerGrowth} color="bg-indigo-50 text-indigo-600" />
        <StatCard icon={Users} label="Khách hàng mới" value={stats?.newCustomersToday} growth={stats?.customerGrowth} color="bg-emerald-50 text-emerald-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* CHART */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
            <TrendingUp size={20} className="text-purple-600"/> Lưu lượng phiên (24h)
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#9333ea" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="sessions" stroke="#9333ea" strokeWidth={3} fill="url(#colorSessions)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TOP READERS */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Top Readers</h3>
          <div className="space-y-6">
            {topReaders.map((reader, index) => (
              <div key={reader.id} className="flex items-center gap-4 border-b border-gray-50 last:border-0 pb-4 last:pb-0">
                <div className={`w-8 h-8 flex items-center justify-center rounded-lg font-black text-xs ${index === 0 ? 'bg-yellow-400 text-yellow-900' : 'bg-slate-100 text-slate-500'}`}>
                  #{index + 1}
                </div>
                <img src={reader.profilePicture || `https://ui-avatars.com/api/?name=${reader.fullName}`} alt="" className="w-10 h-10 rounded-full object-cover border" />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-800">{reader.fullName}</h4>
                  <p className="text-[10px] text-amber-500 flex items-center gap-0.5"><Star size={10} fill="currentColor"/> {reader.eloScore} Elo</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">Phiên vừa cập nhật</h3>
          <div className="relative w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input 
              type="text" 
              placeholder="Tìm kiếm nhanh..." 
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs font-bold text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-4">Mã phiên</th>
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4">Reader</th>
                <th className="px-6 py-4">Chủ đề</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-right">Cập nhật</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sessions.map((session) => (
                <tr key={session.id} className="hover:bg-purple-50/10 transition-colors">
                  <td className="px-6 py-4 text-xs font-mono font-bold text-slate-400">{session.id}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-700">{session.cName}</div>
                    <div className="text-[10px] text-gray-400">{session.cId}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-600">{session.rName}</div>
                    <div className="text-[10px] text-gray-400">{session.rId}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase">{session.topic}</span>
                    <p className="text-sm text-slate-500 italic mt-1 truncate max-w-[200px]">"{session.question}"</p>
                  </td>
                  <td className="px-6 py-4 text-center"><StatusBadge status={session.status} /></td>
                  <td className="px-6 py-4 text-right text-xs text-gray-400">{session.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}