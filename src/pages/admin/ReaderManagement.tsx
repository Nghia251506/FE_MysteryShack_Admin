import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, Eye, X, Check, AlertTriangle, 
  ChevronRight, Calendar, MapPin, Mail, Phone, 
  Trophy, History, RefreshCcw, Lock, MoreHorizontal,
  Star, TrendingUp, Sparkles, UserPlus, CheckCircle2, XCircle,
  ArrowUpRight, ArrowDownRight, BadgeCheck, Edit3, Image as ImageIcon,
  CalendarDays
} from 'lucide-react';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppRedux'; // Hoặc đường dẫn hooks của ông
import { fetchAllReaders } from '../../store/features/userSlice';
import { Loader2 } from 'lucide-react';
// --- 1. INTERFACE ---
interface Reader {
  id: string;
  fullName: string;
  email: string;
  account: string;
  phone: string;
  dob: string;
  joinDate: string;
  address: string;
  specialty: string[];
  experienceImgs: string[];
  experienceText: string;
  feedbackImages: string[];
  bio: string;
  completedSessions: number;
  totalPurchases: number;
  acceptanceRate: number;
  rating: number;
  elo: number;
  status: 'Active' | 'Locked' | 'Pending' | 'Rejected' | 'Busy' | 'Offline';
  avatar: string;
}

interface PendingReader {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  submissionDate: string;
  testScore: number;
  dob: string;
  specialty: string[];
  experienceImgs: string[];
  experienceText: string;
  feedbackImages: string[];
  bio: string;
  status: 'Pending' | 'Rejected';
}

interface EloLog {
  id: number;
  readerId: string;
  readerName: string;
  type: 'Algorithm' | 'Manual';
  oldElo: number;
  newElo: number;
  change: number;
  reason: string;
  adminName?: string;
  timestamp: string;
}

// --- 2. MOCK DATA ---


const MOCK_PENDING: PendingReader[] = [
  {
    id: 'TEMP001', fullName: 'Luna Lovegood', email: 'luna@moon.com', phone: '0988777666',
    submissionDate: '2024-02-01', testScore: 85, dob: '2000-01-01',
    specialty: ['Oracle', 'Healing'], experienceImgs: ['https://placehold.co/100'], 
    experienceText: 'Em đã có 3 năm kinh nghiệm xem bài Oracle cho các bạn sinh viên và khách online.',
    feedbackImages: [
        'https://placehold.co/300x400/fae8ff/9333ea?text=Feedback+1',
        'https://placehold.co/300x400/fae8ff/9333ea?text=Feedback+2'
    ],
    bio: 'Tôi yêu thích việc chữa lành tâm hồn bằng bài Oracle.',
    status: 'Pending'
  },
  {
    id: 'TEMP002', fullName: 'Harry Potter', email: 'harry@hogwarts.com', phone: '0912345678',
    submissionDate: '2024-02-02', testScore: 92, dob: '1980-07-31',
    specialty: ['Tarot'], experienceImgs: [], 
    experienceText: 'Kinh nghiệm thực chiến 10 năm đối đầu với Hắc ám.',
    feedbackImages: [],
    bio: 'The boy who lived.',
    status: 'Pending'
  }
];

const MOCK_LOGS: EloLog[] = [
  { id: 1, readerId: 'RD001', readerName: 'Madame Rose', type: 'Algorithm', oldElo: 2425, newElo: 2450, change: 25, reason: 'Thắng phiên', timestamp: '2024-02-01 10:30' },
];

// Fallback StatusBadge
const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
        Active: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        Locked: 'bg-red-50 text-red-600 border-red-100',
        Pending: 'bg-amber-50 text-amber-600 border-amber-100',
        Rejected: 'bg-gray-100 text-gray-500 border-gray-200',
        Busy: 'bg-purple-50 text-purple-600 border-purple-100',
        Offline: 'bg-slate-100 text-slate-500 border-slate-200',
    };
    return (
        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${styles[status] || 'bg-gray-50 text-gray-500'}`}>
            {status}
        </span>
    );
};

// --- 3. MAIN COMPONENT ---
export default function ReaderManagement() {
  const [activeTab, setActiveTab] = useState<'list' | 'pending' | 'ranking' | 'logs'>('list');
  
  // Data
  const { users, loading, error } = useAppSelector((state) => state.users);
  const [pendingReaders, setPendingReaders] = useState<PendingReader[]>(MOCK_PENDING);
  const [eloLogs, setEloLogs] = useState<EloLog[]>(MOCK_LOGS);
  const dispatch = useAppDispatch();
  // --- FILTER STATES ---
  const [filterName, setFilterName] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterEloMin, setFilterEloMin] = useState('');
  const [filterEloMax, setFilterEloMax] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Action States
  const [selectedReader, setSelectedReader] = useState<Reader | null>(null);
  const [selectedPending, setSelectedPending] = useState<PendingReader | null>(null);
  const [adjustEloReader, setAdjustEloReader] = useState<Reader | null>(null);
  const [eloAdjustment, setEloAdjustment] = useState({ change: 0, reason: '' });
  const [lockDuration, setLockDuration] = useState('7');

  useEffect(() => {
    dispatch(fetchAllReaders());
  }, [dispatch]);
  // --- LOGIC: FILTER ---
  const filteredReaders = useMemo(() => {
    return (users || []).filter(r => {
      const matchName = r.fullName?.toLowerCase().includes(filterName.toLowerCase());
      const matchStatus = filterStatus === 'All' ? true : r.status === filterStatus;

      // 3. Elo Range
      const minElo = filterEloMin ? parseInt(filterEloMin) : 0;
      const maxElo = filterEloMax ? parseInt(filterEloMax) : 99999;
      const matchElo = r.elo >= minElo && r.elo <= maxElo;

      // 4. Date Range (Join Date)
      let matchDate = true;
      if (filterDateFrom || filterDateTo) {
          const joinDate = new Date(r.joinDate);
          const from = filterDateFrom ? new Date(filterDateFrom) : new Date('1900-01-01');
          const to = filterDateTo ? new Date(filterDateTo) : new Date('2100-01-01');
          matchDate = joinDate >= from && joinDate <= to;
      }

      return matchName && matchStatus && matchElo && matchDate;
    });
  }, [users, filterName, filterStatus, filterEloMin, filterEloMax, filterDateFrom, filterDateTo]);

  const handleCheckAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedIds(new Set(filteredReaders.map(r => r.id)));
    else setSelectedIds(new Set());
  };

  const handleCheckOne = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
    setSelectedIds(newSet);
  };

  const clearFilters = () => {
    setFilterName('');
    setFilterStatus('All');
    setFilterEloMin('');
    setFilterEloMax('');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  const handleRejectPending = (reader: PendingReader) => {
    if (!window.confirm("Xác nhận TỪ CHỐI hồ sơ này?")) return;
    setPendingReaders(pendingReaders.filter(p => p.id !== reader.id));
    setSelectedPending(null);
  };

  const handleApprovePending = (reader: PendingReader) => {
    if (!window.confirm("Xác nhận DUYỆT hồ sơ này?")) return;
    const newReader: Reader = {
      id: `RD${Math.floor(Math.random() * 9000) + 1000}`,
      fullName: reader.fullName, email: reader.email, account: reader.email.split('@')[0],
      phone: reader.phone, dob: reader.dob, joinDate: new Date().toISOString().split('T')[0],
      address: 'Chưa cập nhật', specialty: reader.specialty, experienceImgs: reader.experienceImgs,
      experienceText: reader.experienceText, feedbackImages: reader.feedbackImages,
      bio: reader.bio, completedSessions: 0, totalPurchases: 0, acceptanceRate: 100,
      rating: 5.0, elo: 1200, status: 'Active', avatar: `https://ui-avatars.com/api/?name=${reader.fullName}&background=random`
    };
    // setReaders([...readers, newReader]);
    setPendingReaders(pendingReaders.filter(p => p.id !== reader.id));
    setSelectedPending(null);
  };

  const confirmEloAdjustment = () => {
    if (!adjustEloReader) return;
    const newElo = adjustEloReader.elo + eloAdjustment.change;
    setReaders(readers.map(r => r.id === adjustEloReader.id ? { ...r, elo: newElo } : r));
    const newLog: EloLog = {
      id: Date.now(), readerId: adjustEloReader.id, readerName: adjustEloReader.fullName,
      type: 'Manual', oldElo: adjustEloReader.elo, newElo: newElo, change: eloAdjustment.change,
      reason: eloAdjustment.reason, adminName: 'Admin', timestamp: new Date().toLocaleString()
    };
    setEloLogs([newLog, ...eloLogs]);
    setAdjustEloReader(null);
    setEloAdjustment({ change: 0, reason: '' });
  };

  const handleLockAccount = () => {
    if(!selectedReader) return;
    if(window.confirm(`Xác nhận khóa tài khoản ${lockDuration} ngày?`)) {
      setReaders(readers.map(r => r.id === selectedReader.id ? { ...r, status: 'Locked' } : r));
      setSelectedReader(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 animate-fade-in-up font-sans text-slate-800 p-2">
      
      {/* HEADER */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-indigo-600">
             Quản Lý Reader & ELO
           </h1>
           <p className="text-gray-500 text-sm mt-1">Giám sát hiệu suất và xếp hạng Reader chuyên nghiệp.</p>
        </div>
        <div className="flex gap-3">
             <button onClick={clearFilters} className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2">
                 <RefreshCcw size={16}/> Refresh
             </button>
             <button className="bg-slate-900 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all flex items-center gap-2">
                 <UserPlus size={16}/> Thêm Reader
             </button>
        </div>
      </div>

      {/* TABS */}
      <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 inline-flex mb-8 overflow-x-auto max-w-full">
        {[
          { id: 'list', label: 'Danh sách Reader', icon: Eye },
          { id: 'pending', label: 'Hồ sơ chờ duyệt', icon: BadgeCheck, count: pendingReaders.filter(r => r.status === 'Pending').length },
          { id: 'ranking', label: 'Xếp hạng ELO', icon: Trophy },
          { id: 'logs', label: 'Nhật ký hệ thống', icon: History },
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-300 whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-200 scale-105' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1 animate-pulse">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* LIST TAB */}
      {activeTab === 'list' && (
        <div className="space-y-6">
          {/* FILTER */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Filter size={18} className="text-purple-600"/> Bộ lọc tìm kiếm
              </h3>
              {filteredReaders.length > 0 && <span className="text-xs font-semibold bg-purple-50 text-purple-700 px-3 py-1 rounded-full border border-purple-100">Tìm thấy {filteredReaders.length} kết quả</span>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Tìm tên */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                    <input type="text" placeholder="Tìm tên Reader..." value={filterName} onChange={e => setFilterName(e.target.value)} 
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium" />
                </div>

                {/* 2. Trạng thái */}
                <select 
                    value={filterStatus} 
                    onChange={e => setFilterStatus(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium"
                >
                    <option value="All">Tất cả trạng thái</option>
                    <option value="Active">Active (Hoạt động)</option>
                    <option value="Locked">Locked (Đã khóa)</option>
                    <option value="Busy">Busy (Bận)</option>
                    <option value="Offline">Offline</option>
                </select>

                {/* 3. Khoảng ELO */}
                <div className="flex items-center gap-2">
                    <input type="number" placeholder="Elo Min" value={filterEloMin} onChange={e => setFilterEloMin(e.target.value)} 
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium" />
                    <span className="text-gray-400">-</span>
                    <input type="number" placeholder="Max" value={filterEloMax} onChange={e => setFilterEloMax(e.target.value)} 
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium" />
                </div>

                {/* 4. Ngày tham gia */}
                <div className="flex items-center gap-2">
                    <input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} 
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium text-gray-500" />
                    <span className="text-gray-400"><CalendarDays size={16}/></span>
                    <input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} 
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium text-gray-500" />
                </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-center w-14"><input type="checkbox" onChange={handleCheckAll} checked={filteredReaders.length > 0 && selectedIds.size === filteredReaders.length} className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"/></th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Thông tin Reader</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Thống kê</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">ELO & Rating</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Trạng thái</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredReaders.map(reader => (
                    <tr key={reader.id} className="hover:bg-purple-50/30 transition-all duration-200 group">
                      <td className="px-6 py-5 text-center"><input type="checkbox" checked={selectedIds.has(reader.id)} onChange={() => handleCheckOne(reader.id)} className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"/></td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <img src={reader.avatar} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                            {reader.elo >= 2000 && <div className="absolute -top-1 -right-1 bg-amber-500 p-0.5 rounded-full border border-white"><Trophy size={10} className="text-white" fill="currentColor"/></div>}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm group-hover:text-purple-700 transition-colors">{reader.fullName}</p>
                            <p className="font-mono text-[10px] text-gray-400 mt-0.5">{reader.id}</p>
                            <p className="text-[10px] text-gray-400">Tham gia: {reader.joinDate}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5"><div className="space-y-1"><div className="flex items-center gap-2 text-xs font-medium text-gray-600"><CheckCircle2 size={12} className="text-green-500"/> {reader.completedSessions} phiên</div><div className="flex items-center gap-2 text-xs font-medium text-gray-600"><TrendingUp size={12} className="text-blue-500"/> {reader.totalPurchases} lượt mua</div></div></td>
                      <td className="px-6 py-5"><div className="flex flex-col gap-1"><span className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">{reader.elo}</span><div className="flex items-center gap-1 text-xs font-bold text-amber-500">{reader.rating} <Star size={10} fill="currentColor"/></div></div></td>
                      <td className="px-6 py-5"><StatusBadge status={reader.status} /></td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                           <button onClick={() => setAdjustEloReader(reader)} className="bg-purple-50 text-purple-600 p-2 rounded-lg hover:bg-purple-100" title="Điều chỉnh ELO"><RefreshCcw size={16}/></button>
                           <button onClick={() => setSelectedReader(reader)} className="bg-white border border-gray-200 text-gray-500 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">Chi tiết</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredReaders.length === 0 && <div className="p-10 text-center"><p className="text-gray-500 font-medium">Không tìm thấy kết quả phù hợp.</p></div>}
          </div>
        </div>
      )}

      {/* PENDING TAB */}
      {activeTab === 'pending' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {pendingReaders.map(p => (
               <div key={p.id} className={`bg-white rounded-3xl p-6 shadow-lg border transition-all ${p.status === 'Rejected' ? 'border-red-100 opacity-60' : 'border-orange-100'}`}>
                  <div className="flex justify-between items-start mb-4">
                     <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-xl font-bold text-orange-600">{p.fullName.charAt(0)}</div>
                     <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${p.status === 'Rejected' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>{p.status}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{p.fullName}</h3>
                  <p className="text-xs text-gray-500 mb-4">{p.email}</p>
                  <div className="bg-slate-50 rounded-xl p-3 mb-4 space-y-2 border border-slate-100">
                     <div className="flex justify-between text-xs"><span className="text-gray-500">Điểm Test</span><span className="font-bold text-purple-600">{p.testScore}/100</span></div>
                     <div className="w-full bg-gray-200 rounded-full h-1.5"><div className="bg-purple-600 h-1.5 rounded-full" style={{width: `${p.testScore}%`}}></div></div>
                  </div>
                  <button onClick={() => setSelectedPending(p)} className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 flex items-center justify-center gap-2">Xem hồ sơ <ChevronRight size={16}/></button>
               </div>
           ))}
        </div>
      )}

      {/* RANKING TAB */}
      {activeTab === 'ranking' && (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-6 bg-slate-900 text-white"><h2 className="text-xl font-bold flex items-center gap-2"><Trophy className="text-yellow-400" /> Bảng Xếp Hạng ELO</h2></div>
            <table className="w-full text-left">
                <thead className="text-xs font-bold text-gray-400 uppercase border-b border-gray-100"><tr><th className="px-6 py-4">Rank</th><th className="px-6 py-4">Reader</th><th className="px-6 py-4">ID</th><th className="px-6 py-4">ELO</th><th className="px-6 py-4 text-right">Điều chỉnh</th></tr></thead>
                <tbody className="divide-y divide-gray-50">{[...readers].sort((a,b) => b.elo - a.elo).map((r, i) => (
                    <tr key={r.id} className="hover:bg-purple-50/20"><td className="px-6 py-5"><div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${i < 3 ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-100'}`}>{i+1}</div></td><td className="px-6 py-5 font-bold flex items-center gap-3"><img src={r.avatar} className="w-8 h-8 rounded-full" alt=""/>{r.fullName}</td><td className="px-6 py-5 text-xs text-gray-400 font-mono">{r.id}</td><td className="px-6 py-5 text-lg font-black text-purple-700">{r.elo}</td><td className="px-6 py-5 text-right"><button onClick={() => setAdjustEloReader(r)} className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-purple-100">Điều chỉnh</button></td></tr>
                ))}</tbody>
            </table>
        </div>
      )}

      {/* LOGS TAB */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><History className="text-purple-600"/> Nhật ký hệ thống</h3>
            <table className="w-full text-left"><thead className="bg-gray-50 rounded-lg text-xs font-bold text-gray-500 uppercase"><tr><th className="px-4 py-3">Reader</th><th className="px-4 py-3">Loại</th><th className="px-4 py-3">Thay đổi</th><th className="px-4 py-3">ELO Mới</th><th className="px-4 py-3">Lý do</th><th className="px-4 py-3">Thời gian</th></tr></thead><tbody className="divide-y divide-gray-50">{eloLogs.map(log => (<tr key={log.id}><td className="px-4 py-4 font-medium text-sm">{log.readerName}</td><td className="px-4 py-4"><span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${log.type === 'Algorithm' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>{log.type}</span></td><td className={`px-4 py-4 font-bold ${log.change > 0 ? 'text-green-600' : 'text-red-600'}`}>{log.change > 0 ? '+' : ''}{log.change}</td><td className="px-4 py-4 font-mono text-sm">{log.newElo}</td><td className="px-4 py-4 text-sm text-gray-600">{log.reason}</td><td className="px-4 py-4 text-xs text-gray-400">{log.timestamp}</td></tr>))}</tbody></table>
        </div>
      )}

      {/* ================= MODAL: DETAIL (ĐÃ SỬA: NỀN TRẮNG, CHỮ ĐEN) ================= */}
      {selectedReader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 flex flex-col">
                
                {/* HEADER: Nút đóng + Avatar + Tên (Nền trắng, text đen) */}
                <div className="p-8 pb-0 relative">
                    <button onClick={() => setSelectedReader(null)} className="absolute top-6 right-6 p-2 text-gray-400 hover:bg-gray-100 hover:text-red-500 rounded-full transition-colors">
                        <X size={24}/>
                    </button>
                    
                    <div className="flex items-center gap-6">
                        <img src={selectedReader.avatar} className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover" alt=""/>
                        <div>
                            {/* Chữ đen đậm cho tên Reader */}
                            <h2 className="text-2xl font-bold text-slate-800">{selectedReader.fullName}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="bg-gray-100 text-slate-500 px-2 py-0.5 rounded text-xs font-bold border border-gray-200">{selectedReader.id}</span>
                                <StatusBadge status={selectedReader.status}/>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BODY */}
                <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 text-sm">
                    <div className="space-y-3 lg:col-span-1">
                        <p className="flex justify-between text-gray-600"><span className="text-gray-400">Account:</span> {selectedReader.account}</p>
                        <p className="flex justify-between text-gray-600"><span className="text-gray-400">Email:</span> {selectedReader.email}</p>
                        <p className="flex justify-between text-gray-600"><span className="text-gray-400">SĐT:</span> {selectedReader.phone}</p>
                        <p className="flex justify-between text-gray-600"><span className="text-gray-400">Địa chỉ:</span> {selectedReader.address}</p>
                        <p className="flex justify-between text-gray-600"><span className="text-gray-400">Ngày tham gia:</span> {selectedReader.joinDate}</p>
                    </div>
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="bg-slate-50 p-4 rounded-xl"><p className="text-xs text-gray-500">Phiên</p><p className="text-2xl font-black">{selectedReader.completedSessions}</p></div>
                            <div className="bg-purple-50 p-4 rounded-xl"><p className="text-xs text-purple-500">ELO</p><p className="text-2xl font-black text-purple-700">{selectedReader.elo}</p></div>
                            <div className="bg-amber-50 p-4 rounded-xl"><p className="text-xs text-amber-500">Rating</p><p className="text-2xl font-black text-amber-500">{selectedReader.rating}⭐</p></div>
                        </div>
                        <div>
                             <h4 className="font-bold text-gray-800 mb-2">Giới thiệu</h4>
                             <p className="bg-gray-50 p-4 rounded-2xl text-gray-600 text-sm italic">"{selectedReader.bio}"</p>
                        </div>
                        
                        {/* Hiển thị kinh nghiệm trong Detail */}
                        {selectedReader.experienceText && (
                            <div>
                                <h4 className="font-bold text-gray-800 mb-2">Kinh nghiệm & Feedback</h4>
                                <p className="bg-gray-50 p-4 rounded-2xl text-gray-600 text-sm mb-3">{selectedReader.experienceText}</p>
                                {selectedReader.feedbackImages && selectedReader.feedbackImages.length > 0 && (
                                    <div className="grid grid-cols-4 gap-2">
                                        {selectedReader.feedbackImages.map((img, idx) => (
                                            <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                                                <img src={img} className="w-full h-full object-cover" alt="Feedback"/>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="bg-red-50 rounded-2xl p-4 border border-red-100 flex justify-between items-center">
                            <div><h4 className="font-bold text-red-800">Khóa tài khoản</h4><p className="text-xs text-red-600">Hành động này sẽ ngăn Reader truy cập.</p></div>
                            <div className="flex gap-2">
                                <select className="bg-white border border-red-200 text-red-800 text-sm rounded px-2" value={lockDuration} onChange={(e) => setLockDuration(e.target.value)}><option value="7">7 ngày</option><option value="30">30 ngày</option><option value="9999">Vĩnh viễn</option></select>
                                <button onClick={handleLockAccount} className="bg-red-600 text-white px-4 py-2 rounded text-sm font-bold shadow hover:bg-red-700">Khóa</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* MODAL: PENDING */}
      {selectedPending && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-8">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2"><BadgeCheck size={24} className="text-orange-500"/> Hồ sơ chờ duyệt</h3>
                    <button onClick={() => setSelectedPending(null)}><X className="text-gray-400 hover:text-red-500"/></button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm mb-6">
                    {/* Cột 1: Thông tin cơ bản */}
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <span className="text-xs text-gray-400 uppercase font-bold block mb-1">Ứng viên</span>
                            <p className="font-bold text-lg text-slate-800">{selectedPending.fullName}</p>
                            <p className="text-gray-500">{selectedPending.email}</p>
                            <p className="text-gray-500">{selectedPending.phone}</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                            <span className="text-xs text-purple-400 uppercase font-bold block mb-1">Kết quả Test</span>
                            <p className="font-black text-3xl text-purple-600">{selectedPending.testScore}<span className="text-sm font-normal text-purple-400">/100</span></p>
                        </div>
                        <div>
                            <span className="text-xs text-gray-400 uppercase font-bold block mb-1">Giới thiệu bản thân</span>
                            <p className="bg-white border border-gray-200 p-3 rounded-xl italic text-gray-600">"{selectedPending.bio}"</p>
                        </div>
                    </div>

                    {/* Cột 2: Kinh nghiệm & Feedback (QUAN TRỌNG) */}
                    <div className="space-y-4">
                        <div>
                            <span className="text-xs text-gray-400 uppercase font-bold block mb-1">Kinh nghiệm thực tế (Mô tả)</span>
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-slate-700 leading-relaxed">
                                {selectedPending.experienceText}
                            </div>
                        </div>

                        <div>
                            <span className="text-xs text-gray-400 uppercase font-bold mb-2 flex items-center gap-1">
                                <ImageIcon size={14}/> Ảnh Feedback / Bằng chứng
                            </span>
                            {selectedPending.feedbackImages && selectedPending.feedbackImages.length > 0 ? (
                                <div className="grid grid-cols-2 gap-3">
                                    {selectedPending.feedbackImages.map((img, idx) => (
                                        <div key={idx} className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-gray-200 shadow-sm cursor-pointer">
                                            <img src={img} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="Feedback"/>
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"/>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center text-gray-400 text-xs">
                                    Không có ảnh feedback đính kèm.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button onClick={() => handleRejectPending(selectedPending)} className="flex-1 py-3 border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 transition-colors">Từ chối</button>
                    <button onClick={() => handleApprovePending(selectedPending)} className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-lg transition-colors">Duyệt hồ sơ</button>
                </div>
            </div>
         </div>
      )}

      {/* MODAL: ADJUST ELO */}
      {adjustEloReader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="bg-slate-50 p-6 border-b border-slate-100 text-center">
                    <h3 className="text-xl font-bold text-slate-800">Điều chỉnh ELO</h3>
                    <p className="text-sm text-slate-500 mt-1">Cập nhật điểm thủ công</p>
                </div>
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
                       <div>
                          <p className="text-lg font-bold text-slate-800">{adjustEloReader.fullName}</p>
                          <p className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded inline-block mt-1">{adjustEloReader.id}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-xs text-slate-400 uppercase font-bold">Hiện tại</p>
                          <p className="text-3xl font-black text-purple-600">{adjustEloReader.elo}</p>
                       </div>
                    </div>
                    <div>
                       <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Mức thay đổi</label>
                       <div className="flex items-center gap-3">
                          <button onClick={() => setEloAdjustment({...eloAdjustment, change: eloAdjustment.change - 10})} className="w-12 h-12 rounded-xl border-2 border-slate-100 hover:border-red-200 hover:bg-red-50 hover:text-red-600 font-bold text-xl transition-all flex-shrink-0">-</button>
                          <div className="flex-1 relative">
                            <input type="number" value={eloAdjustment.change} onChange={(e) => setEloAdjustment({...eloAdjustment, change: parseInt(e.target.value) || 0})} className={`w-full h-12 text-center font-bold text-xl rounded-xl border-2 outline-none focus:ring-2 focus:ring-purple-500/20 transition-all ${eloAdjustment.change > 0 ? 'border-green-200 text-green-600 bg-green-50/30' : eloAdjustment.change < 0 ? 'border-red-200 text-red-600 bg-red-50/30' : 'border-slate-100 text-slate-600'}`}/>
                          </div>
                          <button onClick={() => setEloAdjustment({...eloAdjustment, change: eloAdjustment.change + 10})} className="w-12 h-12 rounded-xl border-2 border-slate-100 hover:border-green-200 hover:bg-green-50 hover:text-green-600 font-bold text-xl transition-all flex-shrink-0">+</button>
                       </div>
                       <div className="flex justify-between items-center mt-3 px-1">
                          <span className="text-xs font-medium text-slate-400">ELO Mới dự kiến:</span>
                          <span className={`font-black text-lg ${(adjustEloReader.elo + eloAdjustment.change) > adjustEloReader.elo ? 'text-green-600' : (adjustEloReader.elo + eloAdjustment.change) < adjustEloReader.elo ? 'text-red-600' : 'text-slate-600'}`}>{adjustEloReader.elo + eloAdjustment.change}</span>
                       </div>
                    </div>
                    <div>
                       <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Lý do điều chỉnh <span className="text-red-500">*</span></label>
                       <textarea value={eloAdjustment.reason} onChange={(e) => setEloAdjustment({...eloAdjustment, reason: e.target.value})} placeholder="Nhập lý do cụ thể..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all resize-none h-24"></textarea>
                    </div>
                    <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                       <div className="flex items-center gap-2 mb-2"><AlertTriangle size={16} className="text-amber-600" /><span className="text-sm font-bold text-amber-800">Lưu ý quan trọng</span></div>
                       <ul className="list-disc pl-5 space-y-1">
                          <li className="text-xs text-amber-700/80">Điều chỉnh ELO sẽ ảnh hưởng trực tiếp đến thứ hạng.</li>
                          <li className="text-xs text-amber-700/80">Mọi thay đổi sẽ được ghi lại trong nhật ký hệ thống.</li>
                          <li className="text-xs text-amber-700/80">ELO là chỉ số ẩn, chỉ Admin có thể xem.</li>
                       </ul>
                    </div>
                    <div className="flex gap-3 pt-2">
                       <button onClick={() => setAdjustEloReader(null)} className="flex-1 py-3.5 text-slate-500 font-bold bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Hủy bỏ</button>
                       <button onClick={confirmEloAdjustment} disabled={!eloAdjustment.reason || eloAdjustment.change === 0} className="flex-1 py-3.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 shadow-lg shadow-purple-200 disabled:opacity-50 disabled:shadow-none transition-all">Xác nhận điều chỉnh</button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}