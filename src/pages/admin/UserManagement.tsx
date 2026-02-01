import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, Lock, Unlock, RefreshCcw, 
  Calendar, Mail, Phone, FileText, X, 
  CheckCircle2, Clock, History, Crown, Zap, 
  ArrowRight, User as UserIcon
} from 'lucide-react';

// --- 1. INTERNAL COMPONENTS ---

const StatusBadge = ({ status }: { status: string }) => {
  const s = status ? status.toLowerCase() : 'unknown';
  const styles: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    locked: 'bg-red-50 text-red-700 border-red-200',
    inactive: 'bg-gray-100 text-gray-500 border-gray-200',
    completed: 'bg-blue-50 text-blue-700 border-blue-200',
    cancelled: 'bg-red-50 text-red-600 border-red-100',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${styles[s] || 'bg-gray-50'} uppercase tracking-wider`}>
      {status}
    </span>
  );
};

const PackageBadge = ({ pkg }: { pkg: string }) => {
    if (pkg === 'VIP') return <span className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 shadow-sm w-fit"><Crown size={10} fill="currentColor"/> VIP</span>;
    if (pkg === 'Premium') return <span className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 shadow-sm w-fit"><Zap size={10} fill="currentColor"/> PREMIUM</span>;
    return <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-[10px] font-bold border border-gray-200 w-fit">GÓI CƠ BẢN</span>;
};

// --- 2. INTERFACES ---
interface SessionHistory {
  id: string;
  readerName: string;
  customerName: string;
  topic: string;
  date: string;
  time: string;
  status: 'Completed' | 'Cancelled';
  resultForm: string; // Nội dung luận giải
}

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  joinDate: string; // YYYY-MM-DD
  avatar: string;
  subscriptionPackage: 'Free' | 'Premium' | 'VIP';
  completedSessionsCount: number;
  status: 'Active' | 'Locked' | 'Inactive';
  history: SessionHistory[];
}

// --- 3. MOCK DATA ---
const MOCK_USERS: User[] = [
  {
    id: 'US001', fullName: 'Nguyễn Văn An', email: 'an.nguyen@gmail.com', phone: '0988111222',
    dob: '1999-01-01', joinDate: '2023-05-10', status: 'Active',
    subscriptionPackage: 'VIP', completedSessionsCount: 45,
    avatar: 'https://i.pravatar.cc/150?img=11',
    history: [
      { id: 'SES-101', readerName: 'Madame Rose', customerName: 'Nguyễn Văn An', topic: 'Tình yêu', date: '2023-10-20', time: '10:00', status: 'Completed', resultForm: 'Lá bài The Lovers hiện lên cho thấy bạn sắp gặp ý trung nhân. Lời khuyên là hãy mở lòng hơn...' },
      { id: 'SES-102', readerName: 'Mystic John', customerName: 'Nguyễn Văn An', topic: 'Sự nghiệp', date: '2023-11-15', time: '14:30', status: 'Completed', resultForm: 'Công việc hiện tại đang có chút khó khăn nhưng lá bài Strength cho thấy bạn sẽ vượt qua được.' }
    ]
  },
  {
    id: 'US002', fullName: 'Trần Thị Bích', email: 'bich.tran@yahoo.com', phone: '0912333444',
    dob: '2001-08-15', joinDate: '2024-02-15', status: 'Locked',
    subscriptionPackage: 'Free', completedSessionsCount: 32,
    avatar: 'https://i.pravatar.cc/150?img=5',
    history: []
  },
  {
    id: 'US003', fullName: 'Lê Văn C', email: 'levanc@gmail.com', phone: '0909888777',
    dob: '1995-12-12', joinDate: '2024-03-20', status: 'Active',
    subscriptionPackage: 'Premium', completedSessionsCount: 18,
    avatar: 'https://i.pravatar.cc/150?img=60',
    history: []
  },
];

// --- 4. MAIN COMPONENT ---
export default function UserManagement() {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  
  // -- Filter States --
  const [keyword, setKeyword] = useState(''); 
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sessionFrom, setSessionFrom] = useState('');
  const [sessionTo, setSessionTo] = useState('');
  // --- MỚI: Thêm state cho bộ lọc Gói và Trạng thái ---
  const [filterPackage, setFilterPackage] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // -- Selection & Modals --
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewSessionReport, setViewSessionReport] = useState<SessionHistory | null>(null);

  // --- LOGIC FILTER ---
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      // 1. Keyword
      const kw = keyword.toLowerCase();
      const matchKeyword = u.fullName.toLowerCase().includes(kw) || u.id.toLowerCase().includes(kw);

      // 2. Date Range
      const userDate = new Date(u.joinDate).getTime();
      const matchDateFrom = dateFrom ? userDate >= new Date(dateFrom).getTime() : true;
      const matchDateTo = dateTo ? userDate <= new Date(dateTo).getTime() : true;

      // 3. Session Count
      const matchSessFrom = sessionFrom ? u.completedSessionsCount >= Number(sessionFrom) : true;
      const matchSessTo = sessionTo ? u.completedSessionsCount <= Number(sessionTo) : true;

      // 4. Package (Mới)
      const matchPackage = filterPackage === 'All' ? true : u.subscriptionPackage === filterPackage;

      // 5. Status (Mới)
      const matchStatus = filterStatus === 'All' ? true : u.status === filterStatus;

      return matchKeyword && matchDateFrom && matchDateTo && matchSessFrom && matchSessTo && matchPackage && matchStatus;
    });
  }, [users, keyword, dateFrom, dateTo, sessionFrom, sessionTo, filterPackage, filterStatus]);

  // --- HANDLERS ---
  const handleCheckAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSet = new Set(selectedIds);
    if (e.target.checked) filteredUsers.forEach(u => newSet.add(u.id));
    else filteredUsers.forEach(u => newSet.delete(u.id));
    setSelectedIds(newSet);
  };

  const handleCheckOne = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
    setSelectedIds(newSet);
  };

  const clearFilters = () => {
    setKeyword(''); setDateFrom(''); setDateTo(''); setSessionFrom(''); setSessionTo('');
    setFilterPackage('All'); setFilterStatus('All');
  };

  const handleLockUser = (user: User) => {
    const confirmMsg = user.status === 'Locked' ? 'MỞ KHÓA tài khoản này?' : 'KHÓA tài khoản này?';
    if(window.confirm(confirmMsg)) {
        const newStatus = user.status === 'Locked' ? 'Active' : 'Locked';
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
        if (selectedUser?.id === user.id) setSelectedUser(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 animate-fade-in-up font-sans text-slate-800 p-4">
      
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-indigo-600">
          Quản Lý Người Dùng
        </h1>
        <p className="text-sm text-gray-500 mt-1">Quản lý danh sách khách hàng và lịch sử phiên.</p>
      </div>

      {/* --- FILTER SECTION (Đã cập nhật thêm 2 ô lọc) --- */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 transition-all hover:shadow-md">
        <div className="flex items-center gap-2 mb-4 text-purple-700 font-bold text-sm uppercase">
            <Filter size={16}/> Bộ lọc tìm kiếm
        </div>
        
        {/* Chỉnh Grid thành 5 cột cho màn hình lớn */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* 1. Tìm kiếm Tên/ID */}
            <div className="relative group">
                <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block">Từ khóa</label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={16}/>
                    <input 
                        type="text" 
                        placeholder="Tên hoặc ID..." 
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                        value={keyword}
                        onChange={e => setKeyword(e.target.value)}
                    />
                </div>
            </div>

            {/* 2. Gói dịch vụ (MỚI) */}
            <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block">Gói dịch vụ</label>
                <select 
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-white text-gray-600"
                    value={filterPackage}
                    onChange={e => setFilterPackage(e.target.value)}
                >
                    <option value="All">Tất cả gói</option>
                    <option value="Free">Gói Cơ Bản (Free)</option>
                    <option value="Premium">Premium</option>
                    <option value="VIP">VIP</option>
                </select>
            </div>

            {/* 3. Trạng thái (MỚI) */}
            <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block">Trạng thái</label>
                <select 
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-white text-gray-600"
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                >
                    <option value="All">Tất cả trạng thái</option>
                    <option value="Active">Hoạt động</option>
                    <option value="Locked">Đã khóa</option>
                    <option value="Inactive">Không hoạt động</option>
                </select>
            </div>

            {/* 4. Khoảng thời gian */}
            <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block">Ngày tham gia</label>
                <div className="flex items-center gap-2">
                    <input 
                        type="date" 
                        className="w-full px-2 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500 text-gray-500" 
                        value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                    />
                    <span className="text-gray-400">-</span>
                    <input 
                        type="date" 
                        className="w-full px-2 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500 text-gray-500" 
                        value={dateTo} onChange={e => setDateTo(e.target.value)}
                    />
                </div>
            </div>

            {/* 5. Số phiên */}
            <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-1.5 block">Số phiên (Min-Max)</label>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-purple-500">
                    <input 
                        type="number" placeholder="0"
                        className="w-full px-3 py-2.5 text-sm outline-none text-gray-600 bg-white" 
                        value={sessionFrom} onChange={e => setSessionFrom(e.target.value)}
                    />
                    <div className="bg-gray-100 px-2 py-2.5 border-l border-r border-gray-200 text-gray-400 text-xs">
                        -
                    </div>
                    <input 
                        type="number" placeholder="100"
                        className="w-full px-3 py-2.5 text-sm outline-none text-gray-600 bg-white" 
                        value={sessionTo} onChange={e => setSessionTo(e.target.value)}
                    />
                </div>
            </div>
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-50">
            <button onClick={clearFilters} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors">
                <RefreshCcw size={14}/> Xóa bộ lọc
            </button>
            <span className="text-sm text-gray-500 font-medium bg-purple-50 px-3 py-1 rounded-lg border border-purple-100">
                Tìm thấy <b className="text-purple-600">{filteredUsers.length}</b> người dùng
            </span>
        </div>
      </div>

      {/* --- TABLE SECTION --- */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 font-bold uppercase">
              <tr>
                <th className="px-6 py-4 w-10">
                    <input type="checkbox" onChange={handleCheckAll} checked={filteredUsers.length > 0 && filteredUsers.every(u => selectedIds.has(u.id))} className="accent-purple-600 w-4 h-4 cursor-pointer"/>
                </th>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Người dùng</th>
                <th className="px-6 py-4">Ngày tham gia</th>
                <th className="px-6 py-4">Gói</th>
                <th className="px-6 py-4 text-center">Số phiên</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map(user => (
                <tr key={user.id} className={`hover:bg-purple-50/40 transition-colors ${selectedIds.has(user.id) ? 'bg-purple-50' : ''}`}>
                  <td className="px-6 py-4">
                      <input type="checkbox" checked={selectedIds.has(user.id)} onChange={() => handleCheckOne(user.id)} className="accent-purple-600 w-4 h-4 cursor-pointer"/>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-gray-500">{user.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <img src={user.avatar} className="w-8 h-8 rounded-full object-cover border border-gray-200" alt=""/>
                        <div>
                            <p className="text-sm font-bold text-gray-800">{user.fullName}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.joinDate}</td>
                  <td className="px-6 py-4"><PackageBadge pkg={user.subscriptionPackage}/></td>
                  <td className="px-6 py-4 font-bold text-gray-700 text-center">{user.completedSessionsCount}</td>
                  <td className="px-6 py-4"><StatusBadge status={user.status}/></td>
                  <td className="px-6 py-4 text-right">
                    {/* --- ĐÃ SỬA: Text đồng nhất là "Chi tiết" --- */}
                    <button onClick={() => setSelectedUser(user)} className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 hover:text-purple-600 hover:border-purple-200 rounded-lg text-xs font-bold transition-all shadow-sm">
                        Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && <div className="p-10 text-center text-gray-400 italic">Không tìm thấy kết quả phù hợp.</div>}
      </div>

      {/* --- MODAL DETAIL USER --- */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl w-full max-w-5xl h-[85vh] flex overflow-hidden shadow-2xl">
                {/* LEFT SIDEBAR: User Info */}
                <div className="w-1/3 bg-slate-50 p-6 border-r border-gray-100 overflow-y-auto">
                    <div className="flex flex-col items-center text-center mb-6">
                        <img src={selectedUser.avatar} className="w-24 h-24 rounded-full border-4 border-white shadow mb-3"/>
                        <h2 className="text-xl font-bold text-gray-800">{selectedUser.fullName}</h2>
                        <div className="mt-2 text-xs font-mono text-gray-400 bg-white px-2 py-1 rounded border border-gray-200">{selectedUser.id}</div>
                        <div className="mt-3"><StatusBadge status={selectedUser.status}/></div>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4 mb-4 text-sm">
                        <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                            <span className="text-gray-500 text-xs uppercase font-bold">Gói dịch vụ</span>
                            <PackageBadge pkg={selectedUser.subscriptionPackage}/>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                            <span className="text-gray-500 text-xs uppercase font-bold">Email</span>
                            <span className="font-medium text-gray-800 truncate max-w-[120px]" title={selectedUser.email}>{selectedUser.email}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                            <span className="text-gray-500 text-xs uppercase font-bold">SĐT</span>
                            <span className="font-medium text-gray-800">{selectedUser.phone}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 text-xs uppercase font-bold">Ngày tham gia</span>
                            <span className="font-medium text-gray-800">{selectedUser.joinDate}</span>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-auto">
                        <button onClick={() => handleLockUser(selectedUser)} className={`w-full py-3 rounded-xl text-sm font-bold text-white shadow-sm transition-all flex items-center justify-center gap-2 ${selectedUser.status === 'Locked' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-500 hover:bg-orange-600'}`}>
                            {selectedUser.status === 'Locked' ? <><Unlock size={16}/> Mở khóa tài khoản</> : <><Lock size={16}/> Khóa tài khoản</>}
                        </button>
                        <p className="text-[10px] text-gray-400 text-center mt-3 italic">* Tài khoản bị khóa sẽ không thể đăng nhập.</p>
                    </div>
                </div>

                {/* RIGHT CONTENT: Session History */}
                <div className="w-2/3 p-6 bg-white flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg flex items-center gap-2 text-gray-800"><History size={18} className="text-purple-600"/> Lịch sử phiên xem bói</h3>
                        <button onClick={() => setSelectedUser(null)} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} className="text-gray-400"/></button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                        {selectedUser.history.map(ss => (
                            <div key={ss.id} className="border border-gray-100 rounded-xl p-4 hover:border-purple-200 transition-colors group bg-gray-50/30">
                                <div className="flex justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-white border border-gray-200 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded font-mono">{ss.id}</span>
                                        <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={10}/> {ss.date} • {ss.time}</span>
                                    </div>
                                    <StatusBadge status={ss.status}/>
                                </div>
                                <div className="mb-3">
                                    <p className="font-bold text-sm text-gray-800">Reader: <span className="text-purple-700">{ss.readerName}</span></p>
                                    <p className="text-xs text-gray-500 mt-1">Chủ đề: <span className="font-medium text-gray-700">{ss.topic}</span></p>
                                </div>
                                {ss.status === 'Completed' && (
                                    <button 
                                        onClick={() => setViewSessionReport(ss)} 
                                        className="w-full py-2 bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
                                    >
                                        <FileText size={14}/> Xem chi tiết luận giải
                                    </button>
                                )}
                            </div>
                        ))}
                        {selectedUser.history.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-gray-300">
                                <History size={48} className="mb-2 opacity-20"/>
                                <p className="italic">Chưa có lịch sử phiên nào.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* --- MODAL SESSION REPORT --- */}
      {viewSessionReport && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
                <div className="bg-gradient-to-r from-purple-700 to-indigo-700 p-4 text-white flex justify-between items-center">
                    <h3 className="font-bold text-sm flex items-center gap-2"><FileText size={16}/> Kết quả luận giải: {viewSessionReport.id}</h3>
                    <button onClick={() => setViewSessionReport(null)} className="hover:bg-white/20 p-1 rounded-full"><X size={18}/></button>
                </div>
                <div className="p-6">
                    <div className="mb-4">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">Chủ đề</p>
                        <p className="font-bold text-purple-700 text-lg">{viewSessionReport.topic}</p>
                    </div>
                    
                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Nội dung chi tiết</p>
                    <div className="bg-amber-50 p-5 rounded-xl text-sm text-gray-800 italic border border-amber-100 max-h-80 overflow-y-auto leading-relaxed shadow-inner">
                        "{viewSessionReport.resultForm}"
                    </div>
                </div>
                <div className="p-4 bg-gray-50 text-right border-t border-gray-100">
                    <button onClick={() => setViewSessionReport(null)} className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-100 text-sm transition-colors shadow-sm">Đóng</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}