import React from 'react';
import { 
  Users, BookOpen, Calendar, Activity, 
  ArrowUp, Star, MoreHorizontal, TrendingUp, Clock, 
  Search
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

// --- MOCK DATA ---

// 1. Dữ liệu biểu đồ 24h
const HOURLY_DATA = Array.from({ length: 24 }, (_, i) => ({
  time: `${i.toString().padStart(2, '0')}:00`,
  sessions: Math.floor(Math.random() * 40) + 5 
}));

// 2. Top Reader
const TOP_READERS = [
  { id: 1, name: 'Võ Thị Mai', elo: 1623, rating: 4.9, sessions: 12, avatar: 'https://i.pravatar.cc/150?img=5' },
  { id: 2, name: 'Lê Thị Hương', elo: 1512, rating: 4.8, sessions: 9, avatar: 'https://i.pravatar.cc/150?img=9' },
  { id: 3, name: 'Nguyễn Minh Anh', elo: 1456, rating: 4.7, sessions: 8, avatar: 'https://i.pravatar.cc/150?img=32' },
];

// 3. Phiên gần đây (Mở rộng lên 10 phiên)
const RECENT_SESSIONS = [
  { id: 'SS099', cName: 'Nguyễn Văn A', cId: 'C001', rName: 'Nguyễn Minh Anh', rId: 'R001', topic: 'Tình yêu', question: 'Người yêu cũ có quay lại không?', status: 'In Progress', time: 'Vừa xong' },
  { id: 'SS098', cName: 'Trần Thị B', cId: 'C002', rName: 'Lê Thị Hương', rId: 'R002', topic: 'Sự nghiệp', question: 'Có nên nhảy việc lúc này?', status: 'In Progress', time: '5 phút trước' },
  { id: 'SS097', cName: 'Hoàng Văn C', cId: 'C003', rName: 'Võ Thị Mai', rId: 'R003', topic: 'Tài chính', question: 'Đầu tư đất có lãi không?', status: 'Completed', time: '15 phút trước' },
  { id: 'SS096', cName: 'Phạm Thu D', cId: 'C004', rName: 'Mystic John', rId: 'R004', topic: 'Tổng quan', question: 'Vận hạn tháng này thế nào?', status: 'Cancelled', time: '30 phút trước' },
  { id: 'SS095', cName: 'Lê Hoàng E', cId: 'C005', rName: 'Madame Rose', rId: 'R005', topic: 'Tình yêu', question: 'Khi nào tôi kết hôn?', status: 'Completed', time: '45 phút trước' },
  { id: 'SS094', cName: 'Đỗ Văn F', cId: 'C006', rName: 'Tarot Master', rId: 'R006', topic: 'Học tập', question: 'Kết quả thi đại học sắp tới?', status: 'Completed', time: '1 giờ trước' },
  { id: 'SS093', cName: 'Ngô Thị G', cId: 'C007', rName: 'Healing Soul', rId: 'R007', topic: 'Sức khỏe', question: 'Tình hình sức khỏe của mẹ tôi?', status: 'Completed', time: '1 giờ 20 phút trước' },
  { id: 'SS092', cName: 'Bùi Văn H', cId: 'C008', rName: 'Star Reader', rId: 'R008', topic: 'Công việc', question: 'Sếp có định thăng chức cho tôi không?', status: 'In Progress', time: '1 giờ 45 phút trước' },
  { id: 'SS091', cName: 'Vũ Thị I', cId: 'C009', rName: 'Moon Child', rId: 'R009', topic: 'Tình yêu', question: 'Crush có thích tôi không?', status: 'Completed', time: '2 giờ trước' },
  { id: 'SS090', cName: 'Đinh Văn K', cId: 'C010', rName: 'Sun Light', rId: 'R010', topic: 'Tài chính', question: 'Năm nay có mua được nhà không?', status: 'Completed', time: '2 giờ 15 phút trước' },
];

// --- COMPONENTS ---

const StatCard = ({ icon: Icon, label, value, growth, color }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={24} />
      </div>
      <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
        <ArrowUp size={12} /> +{growth}%
      </div>
    </div>
    <div>
      <p className="text-gray-500 text-sm font-medium mb-1">{label}</p>
      <h3 className="text-3xl font-black text-slate-800">{value}</h3>
    </div>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  if (status === 'In Progress') return <span className="text-purple-600 bg-purple-50 px-3 py-1 rounded-full text-[10px] font-bold border border-purple-100 uppercase tracking-wider animate-pulse">Đang diễn ra</span>;
  if (status === 'Completed') return <span className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-[10px] font-bold border border-emerald-100 uppercase tracking-wider">Hoàn thành</span>;
  return <span className="text-red-500 bg-red-50 px-3 py-1 rounded-full text-[10px] font-bold border border-red-100 uppercase tracking-wider">Đã hủy</span>;
};

// --- MAIN PAGE ---

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 animate-fade-in-up font-sans text-slate-800 p-6">
      
      {/* HEADER */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-indigo-600">
            Tổng quan hôm nay
          </h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
            <Clock size={14}/> Cập nhật theo thời gian thực (24h)
          </p>
        </div>
        <div className="text-right hidden md:block">
            <p className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-lg">
                {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
        </div>
      </div>

      {/* 1. STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={Calendar} label="Tổng phiên hôm nay" value="142" growth="15.2" color="bg-purple-50 text-purple-600" />
        <StatCard icon={Activity} label="Đang diễn ra" value="8" growth="5.3" color="bg-blue-50 text-blue-600" />
        <StatCard icon={BookOpen} label="Reader Online" value="45" growth="8.3" color="bg-indigo-50 text-indigo-600" />
        <StatCard icon={Users} label="Khách hàng mới" value="12" growth="2.1" color="bg-emerald-50 text-emerald-600" />
      </div>

      {/* 2. CHART & TOP READERS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* LEFT: 24H ACTIVITY CHART */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp size={20} className="text-purple-600"/> Biểu đồ phiên (24 giờ)
              </h3>
            </div>
          </div>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={HOURLY_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#9333ea" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 11 }} 
                  interval={3} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 11 }} 
                />
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  cursor={{ stroke: '#9333ea', strokeWidth: 2, strokeDasharray: '5 5' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sessions" 
                  stroke="#9333ea" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorSessions)" 
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#7e22ce' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT: TOP READERS */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800">Top Reader Hôm Nay</h3>
            <p className="text-xs text-gray-500">Xếp hạng theo số phiên hoàn thành</p>
          </div>
          <div className="space-y-6">
            {TOP_READERS.map((reader, index) => (
              <div key={reader.id} className="flex items-center gap-4 group cursor-pointer border-b border-gray-50 last:border-0 pb-4 last:pb-0">
                <div className={`w-8 h-8 flex items-center justify-center rounded-lg font-black text-xs shadow-sm transition-all ${
                    index === 0 ? 'bg-yellow-400 text-yellow-900' : 
                    index === 1 ? 'bg-gray-200 text-gray-700' : 
                    index === 2 ? 'bg-orange-200 text-orange-800' : 'bg-slate-100 text-slate-500'
                }`}>
                  #{index + 1}
                </div>
                <img src={reader.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-800 group-hover:text-purple-600 transition-colors">{reader.name}</h4>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400">
                     <Star size={10} className="text-amber-400 fill-amber-400"/> {reader.rating}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-purple-600">{reader.sessions}</span>
                  <p className="text-[10px] text-gray-400">phiên</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. RECENT SESSIONS (Danh sách dài 10 phiên) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Phiên vừa cập nhật</h3>
            <p className="text-sm text-gray-500">Giám sát các hoạt động giải bài gần nhất</p>
          </div>
          <div className="flex gap-2">
             <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input type="text" placeholder="Tìm ID phiên..." className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-purple-500 transition-colors"/>
             </div>
             <button className="text-purple-600 hover:bg-purple-50 p-2 rounded-lg transition-colors">
                <MoreHorizontal size={20}/>
             </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs font-bold text-gray-500 uppercase border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Mã phiên</th>
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4">Reader</th>
                <th className="px-6 py-4 w-1/3">Chủ đề & Câu hỏi</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-right">Cập nhật</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {RECENT_SESSIONS.map((session) => (
                <tr key={session.id} className="hover:bg-purple-50/20 transition-colors">
                  <td className="px-6 py-4 text-xs font-bold font-mono text-slate-500">{session.id}</td>
                  
                  {/* Khách hàng */}
                  <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-700">{session.cName}</p>
                      <p className="text-[10px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded w-fit mt-0.5">{session.cId}</p>
                  </td>

                  {/* Reader */}
                  <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-600">{session.rName}</p>
                      <p className="text-[10px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded w-fit mt-0.5">{session.rId}</p>
                  </td>

                  {/* Chủ đề & Câu hỏi */}
                  <td className="px-6 py-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-50 text-indigo-600 mb-1 border border-indigo-100">
                          {session.topic}
                      </span>
                      <p className="text-sm text-slate-700 italic truncate max-w-xs" title={session.question}>"{session.question}"</p>
                  </td>

                  <td className="px-6 py-4 text-center"><StatusBadge status={session.status} /></td>
                  <td className="px-6 py-4 text-right text-xs font-medium text-gray-400">{session.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Fake */}
        <div className="p-4 border-t border-slate-100 flex justify-center">
            <button className="text-xs font-bold text-purple-600 hover:underline">Xem tất cả lịch sử phiên</button>
        </div>
      </div>

    </div>
  );
}