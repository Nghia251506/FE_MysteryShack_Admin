import React, { useState, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Search, Lock, Unlock, RefreshCcw,
    X, Crown, Zap, ChevronLeft, ChevronRight
} from 'lucide-react';

import { fetchAllCustomers, toggleUserStatus } from '../../store/features/userSlice';
import { AppDispatch, RootState } from '../../store/store';
import { User } from '../../types/user';

// --- 1. INTERNAL COMPONENTS ---
const StatusBadge = ({ status }: { status: string }) => {
    const s = status ? status.toLowerCase() : 'unknown';
    const styles: Record<string, string> = {
        active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        locked: 'bg-red-100 text-red-700 border-red-200',
        unverified: 'bg-amber-100 text-amber-700 border-amber-200',
        inactive: 'bg-slate-100 text-slate-500 border-slate-200',
    };

    // Map text hiển thị sang tiếng Việt cho thân thiện (tùy ông)
    const labels: Record<string, string> = {
        active: 'Đang hoạt động',
        locked: 'Đã khóa',
        unverified: 'Chưa xác thực',
        inactive: 'Ngoại tuyến'
    };

    return (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${styles[s] || 'bg-gray-50'} uppercase tracking-wider`}>
            {labels[s] || status}
        </span>
    );
};

const PackageBadge = ({ role }: { role: string }) => {
    if (role === 'ADMIN') return <span className="bg-gradient-to-r from-red-400 to-rose-500 text-white px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 shadow-sm w-fit"><Crown size={10} fill="currentColor" /> ADMIN</span>;
    if (role === 'READER') return <span className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 shadow-sm w-fit"><Zap size={10} fill="currentColor" /> READER</span>;
    return <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-[10px] font-bold border border-gray-200 w-fit">CUSTOMER</span>;
};

// --- 2. MAIN COMPONENT ---
export default function UserManagement() {
    const dispatch = useDispatch<AppDispatch>();

    // Lấy data và thông tin phân trang từ Store
    const { users, loading, currentPage, totalPages, totalElements } = useSelector((state: RootState) => state.users);

    // Local state cho bộ lọc
    const [keyword, setKeyword] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [localSelectedUser, setLocalSelectedUser] = useState<User | null>(null);

    // Số lượng item trên 1 trang cố định là 5 theo yêu cầu của ông giáo
    const PAGE_SIZE = 5;

    // --- HÀM LOAD DATA CHUNG ---
    const loadUsers = (page: number, searchKeyword: string = keyword, currentStatus: string = filterStatus) => {
        dispatch(fetchAllCustomers({
            page: page,
            size: PAGE_SIZE,
            keyword: searchKeyword,
            // Truyền status lên BE (Nếu BE nhận param 'status' hoặc 'blocked')
            // Ví dụ: BE nhận blocked=true/false, ông cần convert từ string sang boolean
            status: currentStatus === 'All' ? undefined : currentStatus,
            sortBy: 'id',
            direction: 'desc'
        }));
    };

    // Load lần đầu
    useEffect(() => {
        loadUsers(0);
    }, [dispatch]);

    // --- HANDLERS ---
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        loadUsers(0); // Tìm kiếm thì luôn reset về trang đầu
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 0 && newPage < totalPages) {
            loadUsers(newPage);
        }
    };

    const clearFilters = () => {
        setKeyword('');
        setFilterStatus('All');
        loadUsers(0, '');
    };

    const handleToggleStatus = async (user: User) => {
        // Nếu đang Locked (blocked: true) thì hành động là Mở khóa, ngược lại là Khóa
        const isLocked = user.status === 'Locked';
        const actionText = isLocked ? 'MỞ KHÓA' : 'KHÓA';

        if (window.confirm(`${actionText} tài khoản ${user.fullName}?`)) {
            try {
                // Gửi ID lên BE để toggle cái flag 'blocked'
                await dispatch(toggleUserStatus(Number(user.id))).unwrap();
                loadUsers(currentPage);
            } catch (err: any) {
                alert("Lỗi: " + err);
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20 p-4 font-sans text-slate-800">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-indigo-600">
                        Quản Lý Khách Hàng
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Hệ thống phân trang: {PAGE_SIZE} người dùng / trang</p>
                </div>
                <div className="text-sm font-medium text-gray-400 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                    Tổng số: <span className="text-purple-600 font-bold">{totalElements}</span> người dùng
                </div>
            </div>

            {/* FILTER SECTION */}
            <form onSubmit={handleSearch} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 transition-all hover:shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Tìm theo tên hoặc username..."
                            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                            value={keyword}
                            onChange={e => setKeyword(e.target.value)}
                        />
                    </div>

                    <select
                        className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none bg-white cursor-pointer"
                        value={filterStatus}
                        onChange={e => {
                            const newStatus = e.target.value;
                            setFilterStatus(newStatus);
                            loadUsers(0, keyword, newStatus); // Gọi lại API với status mới và reset về trang 0
                        }}
                    >
                        <option value="All">Tất cả trạng thái</option>
                        <option value="Active">Đang hoạt động</option>
                        <option value="Locked">Đã khóa</option>
                        <option value="Unverified">Chưa xác thực</option>
                    </select>

                    <div className="flex gap-2">
                        <button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm active:scale-95">
                            Tìm kiếm
                        </button>
                        <button type="button" onClick={clearFilters} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-bold transition-colors">
                            <RefreshCcw size={16} />
                        </button>
                    </div>
                </div>
            </form>

            {/* TABLE SECTION */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden relative">
                {loading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
                        <div className="flex items-center gap-2 text-purple-600 font-bold animate-pulse">
                            <RefreshCcw className="animate-spin" size={20} /> Đang tải dữ liệu...
                        </div>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Người dùng</th>
                                <th className="px-6 py-4">Username</th>
                                <th className="px-6 py-4">Vai trò</th>
                                <th className="px-6 py-4">Trạng thái</th>
                                <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.length > 0 ? users.map(user => (
                                <tr key={user.id} className="hover:bg-purple-50/40 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.fullName}`}
                                                className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover"
                                                alt=""
                                            />
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">{user.fullName}</p>
                                                <p className="text-[11px] text-gray-400">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-mono text-gray-600">@{user.username}</td>
                                    <td className="px-6 py-4"><PackageBadge role={user.role} /></td>
                                    <td className="px-6 py-4"><StatusBadge status={user.status} /></td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleToggleStatus(user)}
                                                className={`p-2 rounded-lg ${user.status === 'Locked' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-orange-500 hover:bg-orange-50'}`}
                                                title={user.status === 'Locked' ? 'Mở khóa' : 'Khóa'}
                                            >
                                                {user.status === 'Locked' ? <Unlock size={18} /> : <Lock size={18} />}
                                            </button>
                                            <button onClick={() => setLocalSelectedUser(user)} className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 hover:text-purple-600 hover:border-purple-200 rounded-lg text-xs font-bold transition-all shadow-sm">
                                                Chi tiết
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-gray-400 italic">Không tìm thấy người dùng nào.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* --- THANH PHÂN TRANG (PAGINATION) --- */}
                <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <p className="text-sm text-gray-500 font-medium">
                        Trang <span className="text-gray-800">{currentPage + 1}</span> trên <span className="text-gray-800">{totalPages || 1}</span>
                    </p>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            disabled={currentPage === 0 || loading}
                            onClick={() => handlePageChange(currentPage - 1)}
                            className="p-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 hover:border-purple-300 hover:text-purple-600 transition-all shadow-sm"
                        >
                            <ChevronLeft size={18} />
                        </button>

                        <div className="flex gap-1">
                            {/* Logic hiển thị các con số trang rút gọn */}
                            {Array.from({ length: totalPages }, (_, i) => i)
                                .filter(i => i === 0 || i === totalPages - 1 || (i >= currentPage - 1 && i <= currentPage + 1))
                                .map((page, idx, arr) => (
                                    <React.Fragment key={page}>
                                        {idx > 0 && arr[idx - 1] !== page - 1 && <span className="px-2 text-gray-400">...</span>}
                                        <button
                                            onClick={() => handlePageChange(page)}
                                            className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${currentPage === page
                                                ? 'bg-purple-600 text-white shadow-md'
                                                : 'bg-white border border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-600'
                                                }`}
                                        >
                                            {page + 1}
                                        </button>
                                    </React.Fragment>
                                ))
                            }
                        </div>

                        <button
                            type="button"
                            disabled={currentPage >= totalPages - 1 || loading}
                            onClick={() => handlePageChange(currentPage + 1)}
                            className="p-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 hover:border-purple-300 hover:text-purple-600 transition-all shadow-sm"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* MODAL DETAIL (Giữ nguyên logic Detail của ông giáo) */}
            {localSelectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    {/* Nội dung modal chi tiết ở đây tương tự như code trước của ông giáo */}
                    <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative">
                        <button onClick={() => setLocalSelectedUser(null)} className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition-colors"><X size={24} /></button>
                        <div className="text-center mb-6">
                            <img src={localSelectedUser.profilePicture || `https://ui-avatars.com/api/?name=${localSelectedUser.fullName}`} className="w-24 h-24 rounded-full mx-auto border-4 border-purple-50 mb-4 shadow-sm" />
                            <h3 className="text-2xl font-bold text-gray-800">{localSelectedUser.fullName}</h3>
                            <p className="text-purple-600 font-medium font-mono text-sm">@{localSelectedUser.username}</p>
                        </div>
                        <div className="space-y-4 mb-8 bg-slate-50 p-4 rounded-2xl">
                            <div className="flex justify-between text-sm"><span className="text-gray-500">Email:</span><span className="font-semibold">{localSelectedUser.email}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-gray-500">Trạng thái:</span><StatusBadge status={localSelectedUser.status} /></div>
                            <div className="flex justify-between text-sm"><span className="text-gray-500">Elo Score:</span><span className="font-bold text-indigo-600">{localSelectedUser.eloScore || 0}</span></div>
                        </div>
                        <button
                            onClick={() => { handleToggleStatus(localSelectedUser); setLocalSelectedUser(null); }}
                            className={`w-full py-3 rounded-xl font-extrabold text-white transition-all shadow-lg active:scale-[0.98] ${localSelectedUser.status === 'Locked' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-orange-500 hover:bg-orange-600'}`}
                        >
                            {localSelectedUser.status === 'Locked' ? 'KÍCH HOẠT TÀI KHOẢN' : 'KHÓA TÀI KHOẢN'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}