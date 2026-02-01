import React, { useState } from 'react';
import { 
  Shield, User, Lock, History, Plus, 
  Edit, Trash2, Save, X, CheckCircle, 
  AlertCircle, Search, FileText, Key
} from 'lucide-react';

// --- 1. INTERFACES ---

interface AdminAccount {
  id: string;
  username: string;
  ownerName: string; // Tên thật của người cầm acc (để note)
  role: 'Super Admin' | 'Editor' | 'Viewer';
  status: 'Active' | 'Locked';
  lastActive: string;
}

interface AuditLog {
  id: string;
  actorName: string; // Người thực hiện (Lấy từ ownerName)
  action: string;    // Hành động (VD: Sửa bài viết, Xóa user)
  target: string;    // Đối tượng bị tác động
  timestamp: string;
}

// --- 2. MOCK DATA ---

const INITIAL_ACCOUNTS: AdminAccount[] = [
  { id: 'AD01', username: 'admin_boss', ownerName: 'Nguyễn Văn Quản Lý', role: 'Super Admin', status: 'Active', lastActive: 'Vừa xong' },
  { id: 'AD02', username: 'mod_content', ownerName: 'Trần Thị Nội Dung', role: 'Editor', status: 'Active', lastActive: '15 phút trước' },
  { id: 'AD03', username: 'mod_support', ownerName: 'Lê Văn CSKH', role: 'Viewer', status: 'Locked', lastActive: '2 ngày trước' },
];

const INITIAL_LOGS: AuditLog[] = [
  { id: 'LOG01', actorName: 'Nguyễn Văn Quản Lý', action: 'Tạo tài khoản mới', target: 'mod_support', timestamp: '2025-02-01 10:30' },
  { id: 'LOG02', actorName: 'Trần Thị Nội Dung', action: 'Chỉnh sửa bài viết', target: 'Ý nghĩa lá The Fool', timestamp: '2025-02-01 09:15' },
  { id: 'LOG03', actorName: 'Trần Thị Nội Dung', action: 'Ẩn bài viết', target: 'Spread 3 lá', timestamp: '2025-01-31 16:20' },
  { id: 'LOG04', actorName: 'Nguyễn Văn Quản Lý', action: 'Khóa tài khoản', target: 'mod_support', timestamp: '2025-01-30 08:00' },
];

// --- 3. MAIN COMPONENT ---

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState<'accounts' | 'logs'>('accounts');
  
  // Data States
  const [accounts, setAccounts] = useState<AdminAccount[]>(INITIAL_ACCOUNTS);
  const [logs, setLogs] = useState<AuditLog[]>(INITIAL_LOGS);

  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AdminAccount | null>(null);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '', // Chỉ dùng khi tạo/sửa
    ownerName: '',
    role: 'Editor',
    status: 'Active'
  });

  // --- HANDLERS ---

  const handleOpenModal = (acc?: AdminAccount) => {
    if (acc) {
      setEditingAccount(acc);
      setFormData({
        username: acc.username,
        password: '', // Để trống nếu không muốn đổi pass
        ownerName: acc.ownerName,
        role: acc.role,
        status: acc.status
      });
    } else {
      setEditingAccount(null);
      setFormData({ username: '', password: '', ownerName: '', role: 'Editor', status: 'Active' });
    }
    setIsModalOpen(true);
  };

  const handleSaveAccount = () => {
    if (!formData.username || !formData.ownerName) return alert("Vui lòng nhập đủ thông tin!");

    // Giả lập ghi log hành động
    const newLog: AuditLog = {
      id: `LOG${Date.now()}`,
      actorName: 'Bạn (Super Admin)', // Trong thực tế lấy từ session đăng nhập
      action: editingAccount ? 'Cập nhật thông tin' : 'Tạo tài khoản admin',
      target: formData.ownerName,
      timestamp: new Date().toLocaleString('vi-VN')
    };
    setLogs([newLog, ...logs]);

    if (editingAccount) {
      // Edit
      setAccounts(accounts.map(a => a.id === editingAccount.id ? {
        ...a,
        username: formData.username,
        ownerName: formData.ownerName,
        role: formData.role as any,
        status: formData.status as any
      } : a));
    } else {
      // Create
      const newAcc: AdminAccount = {
        id: `AD${Date.now()}`,
        username: formData.username,
        ownerName: formData.ownerName,
        role: formData.role as any,
        status: formData.status as any,
        lastActive: 'Chưa đăng nhập'
      };
      setAccounts([...accounts, newAcc]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Xóa tài khoản ${name}? Hành động này không thể hoàn tác.`)) {
      setAccounts(accounts.filter(a => a.id !== id));
      // Log delete
      setLogs([{
        id: `LOG${Date.now()}`,
        actorName: 'Bạn (Super Admin)',
        action: 'Xóa tài khoản',
        target: name,
        timestamp: new Date().toLocaleString('vi-VN')
      }, ...logs]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 animate-fade-in-up font-sans text-slate-800 p-6">
      
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-indigo-600">
          Cài đặt hệ thống
        </h1>
        <p className="text-sm text-gray-500 mt-1">Quản lý phân quyền và theo dõi nhật ký hoạt động.</p>
      </div>

      {/* TABS */}
      <div className="flex gap-8 border-b border-gray-200 mb-6">
        <button 
          onClick={() => setActiveTab('accounts')}
          className={`pb-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${activeTab === 'accounts' ? 'border-purple-600 text-purple-700' : 'border-transparent text-gray-500 hover:text-purple-600'}`}
        >
          <Shield size={16}/> Tài khoản Admin
        </button>
        <button 
          onClick={() => setActiveTab('logs')}
          className={`pb-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${activeTab === 'logs' ? 'border-purple-600 text-purple-700' : 'border-transparent text-gray-500 hover:text-purple-600'}`}
        >
          <History size={16}/> Lịch sử quản lý
        </button>
      </div>

      {/* === TAB 1: ACCOUNTS === */}
      {activeTab === 'accounts' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-2 text-purple-700 font-bold text-sm uppercase">
                   <User size={16}/> Danh sách quản trị viên
                </div>
                <button onClick={() => handleOpenModal()} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md flex items-center gap-2 transition-all">
                    <Plus size={16}/> Thêm Admin mới
                </button>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-white border-b border-gray-200 text-xs text-gray-500 font-bold uppercase">
                        <tr>
                            <th className="px-6 py-4">Tài khoản</th>
                            <th className="px-6 py-4">Người sở hữu (Owner)</th>
                            <th className="px-6 py-4">Vai trò</th>
                            <th className="px-6 py-4">Trạng thái</th>
                            <th className="px-6 py-4">Hoạt động cuối</th>
                            <th className="px-6 py-4 text-right">Tác vụ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {accounts.map(acc => (
                            <tr key={acc.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-mono text-sm font-bold text-slate-700">{acc.username}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-[10px] font-bold">
                                            {acc.ownerName.charAt(0)}
                                        </div>
                                        <span className="text-sm font-medium text-slate-800">{acc.ownerName}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-xs font-bold text-gray-500">{acc.role}</td>
                                <td className="px-6 py-4">
                                    {acc.status === 'Active' 
                                        ? <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded text-[10px] font-bold border border-emerald-100">Hoạt động</span>
                                        : <span className="bg-red-50 text-red-600 px-2 py-1 rounded text-[10px] font-bold border border-red-100">Đã khóa</span>
                                    }
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-400 italic">{acc.lastActive}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleOpenModal(acc)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors mr-1" title="Chỉnh sửa"><Edit size={16}/></button>
                                    <button onClick={() => handleDelete(acc.id, acc.ownerName)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Xóa"><Trash2 size={16}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {/* === TAB 2: AUDIT LOGS === */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-2 text-gray-600 font-bold text-sm uppercase">
                   <FileText size={16}/> Nhật ký hệ thống
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14}/>
                    <input type="text" placeholder="Tìm kiếm log..." className="pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-purple-500"/>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-white border-b border-gray-200 text-xs text-gray-500 font-bold uppercase">
                        <tr>
                            <th className="px-6 py-4">Thời gian</th>
                            <th className="px-6 py-4">Người thực hiện</th>
                            <th className="px-6 py-4">Hành động</th>
                            <th className="px-6 py-4">Đối tượng</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {logs.map(log => (
                            <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-xs font-mono text-gray-500">{log.timestamp}</td>
                                <td className="px-6 py-4 text-sm font-bold text-purple-700">{log.actorName}</td>
                                <td className="px-6 py-4 text-sm text-slate-700">{log.action}</td>
                                <td className="px-6 py-4">
                                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium border border-gray-200">
                                        {log.target}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {logs.length === 0 && <div className="p-8 text-center text-gray-400 italic">Chưa có dữ liệu nhật ký.</div>}
            </div>
        </div>
      )}

      {/* === MODAL ADD/EDIT ADMIN === */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-800">{editingAccount ? 'Chỉnh sửa tài khoản' : 'Tạo tài khoản Admin'}</h3>
                    <button onClick={() => setIsModalOpen(false)}><X size={20} className="text-gray-400 hover:text-red-500"/></button>
                </div>
                
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tên đăng nhập (Username)</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                            <input 
                                type="text" 
                                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                placeholder="VD: admin_01"
                                value={formData.username}
                                onChange={e => setFormData({...formData, username: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                             {editingAccount ? 'Mật khẩu mới (Để trống nếu không đổi)' : 'Mật khẩu'}
                        </label>
                        <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                            <input 
                                type="password" 
                                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={e => setFormData({...formData, password: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-purple-600 uppercase mb-1">Tên người sở hữu (Để ghi log)</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-2.5 border border-purple-200 bg-purple-50 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none font-bold text-slate-700"
                            placeholder="VD: Nguyễn Văn A"
                            value={formData.ownerName}
                            onChange={e => setFormData({...formData, ownerName: e.target.value})}
                        />
                        <p className="text-[10px] text-gray-400 mt-1 italic">* Tên này sẽ hiện trong lịch sử chỉnh sửa hệ thống.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Vai trò</label>
                            <select 
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                                value={formData.role}
                                onChange={e => setFormData({...formData, role: e.target.value})}
                            >
                                <option value="Super Admin">Super Admin</option>
                                <option value="Editor">Editor</option>
                                <option value="Viewer">Viewer</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Trạng thái</label>
                            <select 
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                                value={formData.status}
                                onChange={e => setFormData({...formData, status: e.target.value})}
                            >
                                <option value="Active">Hoạt động</option>
                                <option value="Locked">Đã khóa</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="p-5 border-t border-gray-100 bg-gray-50 text-right rounded-b-2xl">
                    <button onClick={handleSaveAccount} className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all">
                        {editingAccount ? 'Cập nhật' : 'Tạo tài khoản'}
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}