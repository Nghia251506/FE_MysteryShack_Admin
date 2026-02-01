import React, { useState, useMemo } from 'react';
import { 
  Bell, Send, History, Search, Filter, 
  Save, Eye, Calendar, User, Users, 
  Megaphone, AlertTriangle, CheckCircle, 
  Info, RefreshCcw, X, Smartphone, Globe
} from 'lucide-react';

// --- 1. CONFIG & TYPES ---

const NOTIFICATION_TYPES = [
  { value: 'System', label: 'Hệ thống', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Globe },
  { value: 'Promotion', label: 'Khuyến mãi', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: Megaphone },
  { value: 'Maintenance', label: 'Bảo trì', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: AlertTriangle },
  // Đã sửa dòng này: icon CheckCircle được gọi trực tiếp thay vì dùng arrow function
  { value: 'Achievement', label: 'Thành tích', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: CheckCircle }, 
  { value: 'General', label: 'Thông báo', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Info },
  { value: 'Warning', label: 'Cảnh báo', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle },
  { value: 'Update', label: 'Cập nhật', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: RefreshCcw },
  { value: 'Event', label: 'Sự kiện', color: 'bg-pink-100 text-pink-700 border-pink-200', icon: Calendar },
];

const RECIPIENT_GROUPS = [
  { value: 'All', label: 'Tất cả người dùng' },
  { value: 'AllReaders', label: 'Tất cả Reader' },
  { value: 'AllCustomers', label: 'Tất cả Khách hàng' },
  { value: 'Specific', label: 'Nhập ID cụ thể' },
];

interface HistoryItem {
  id: string;
  title: string;
  recipient: string; // Tên hiển thị nhóm hoặc ID
  type: string;
  status: 'Sent' | 'Draft' | 'Scheduled';
  readCount: number;
  totalCount: number;
  date: string;
  content: string;
}

// --- 2. MOCK DATA ---
const MOCK_HISTORY: HistoryItem[] = [
  { id: 'NOT001', title: 'Cập nhật hệ thống ELO mới', recipient: 'Tất cả Reader', type: 'System', status: 'Sent', readCount: 45, totalCount: 67, date: '2025-01-15 10:30', content: 'Hệ thống tính điểm ELO mới sẽ được áp dụng từ ngày mai...' },
  { id: 'NOT002', title: 'Khuyến mãi gói VIP tháng 1', recipient: 'Tất cả người dùng', type: 'Promotion', status: 'Sent', readCount: 234, totalCount: 512, date: '2025-01-14 09:15', content: 'Giảm giá 50% cho gói VIP Monthly chỉ trong hôm nay.' },
  { id: 'NOT003', title: 'Bảo trì hệ thống định kỳ', recipient: 'Tất cả', type: 'Maintenance', status: 'Scheduled', readCount: 0, totalCount: 600, date: '2025-01-16 02:00', content: 'Hệ thống sẽ bảo trì từ 2h đến 4h sáng.' },
  { id: 'NOT004', title: 'Chúc mừng Reader xuất sắc', recipient: 'Top 10 Reader', type: 'Achievement', status: 'Sent', readCount: 10, totalCount: 10, date: '2025-01-13 14:20', content: 'Chúc mừng bạn đã lọt top 10 Reader xuất sắc nhất tháng.' },
  { id: 'NOT005', title: 'Cảnh báo vi phạm quy tắc', recipient: 'R005', type: 'Warning', status: 'Sent', readCount: 1, totalCount: 1, date: '2025-01-12 08:00', content: 'Bạn đã vi phạm quy tắc ứng xử lần 1. Vui lòng xem lại.' },
];

// --- 3. MAIN COMPONENT ---
export default function NotificationCenter() {
  const [activeTab, setActiveTab] = useState<'send' | 'history'>('send');

  // -- FORM STATE --
  const [formData, setFormData] = useState({
    recipientGroup: 'All',
    specificId: '',
    type: 'System',
    title: '',
    content: '',
    link: '',
    btnText: ''
  });

  // -- HISTORY FILTER STATE --
  const [filterType, setFilterType] = useState('All');
  const [filterDate, setFilterDate] = useState('');
  const [keyword, setKeyword] = useState('');
  const [selectedNoti, setSelectedNoti] = useState<HistoryItem | null>(null);

  // -- LOGIC --
  const getTypeStyle = (typeVal: string) => NOTIFICATION_TYPES.find(t => t.value === typeVal) || NOTIFICATION_TYPES[4];

  const filteredHistory = useMemo(() => {
    return MOCK_HISTORY.filter(item => {
      const matchType = filterType === 'All' ? true : item.type === filterType;
      const matchDate = filterDate ? item.date.includes(filterDate) : true;
      const matchKey = item.title.toLowerCase().includes(keyword.toLowerCase()) || 
                       item.recipient.toLowerCase().includes(keyword.toLowerCase());
      return matchType && matchDate && matchKey;
    });
  }, [filterType, filterDate, keyword]);

  const handleSend = () => {
    if(!formData.title || !formData.content) return alert("Vui lòng nhập tiêu đề và nội dung!");
    alert("Đã gửi thông báo thành công!");
    // Reset form logic here
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 animate-fade-in-up font-sans text-slate-800 p-6">
      
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-indigo-600">
          Trung tâm Thông báo
        </h1>
        <p className="text-sm text-gray-500 mt-1">Gửi thông báo đến Reader và người dùng hệ thống.</p>
      </div>

      {/* TABS */}
      <div className="flex gap-8 border-b border-gray-200 mb-6">
        <button 
          onClick={() => setActiveTab('send')}
          className={`pb-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${activeTab === 'send' ? 'border-purple-600 text-purple-700' : 'border-transparent text-gray-500 hover:text-purple-600'}`}
        >
          <Send size={16}/> Gửi thông báo
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`pb-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${activeTab === 'history' ? 'border-purple-600 text-purple-700' : 'border-transparent text-gray-500 hover:text-purple-600'}`}
        >
          <History size={16}/> Lịch sử gửi
        </button>
      </div>

      {/* === TAB 1: GỬI THÔNG BÁO === */}
      {activeTab === 'send' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT: FORM INPUT */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Người nhận */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Người nhận</label>
                        <select 
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                            value={formData.recipientGroup}
                            onChange={e => setFormData({...formData, recipientGroup: e.target.value})}
                        >
                            {RECIPIENT_GROUPS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                        </select>
                        {/* Nhập ID cụ thể nếu chọn Specific */}
                        {formData.recipientGroup === 'Specific' && (
                            <input 
                                type="text" 
                                placeholder="Nhập ID User hoặc Reader..."
                                className="w-full mt-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500 animate-in slide-in-from-top-1"
                                value={formData.specificId}
                                onChange={e => setFormData({...formData, specificId: e.target.value})}
                            />
                        )}
                    </div>

                    {/* Loại thông báo */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Loại thông báo</label>
                        <select 
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                            value={formData.type}
                            onChange={e => setFormData({...formData, type: e.target.value})}
                        >
                            {NOTIFICATION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Tiêu đề thông báo</label>
                        <input 
                            type="text" placeholder="Nhập tiêu đề..."
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500"
                            value={formData.title}
                            onChange={e => setFormData({...formData, title: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Nội dung</label>
                        <textarea 
                            placeholder="Nhập nội dung thông báo..."
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500 h-32 resize-none"
                            value={formData.content}
                            onChange={e => setFormData({...formData, content: e.target.value})}
                        ></textarea>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Link hành động (tùy chọn)</label>
                            <input 
                                type="text" placeholder="https://..."
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500"
                                value={formData.link}
                                onChange={e => setFormData({...formData, link: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Văn bản nút (tùy chọn)</label>
                            <input 
                                type="text" placeholder="VD: Xem chi tiết"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500"
                                value={formData.btnText}
                                onChange={e => setFormData({...formData, btnText: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6 pt-2">
                         <label className="flex items-center gap-2 cursor-pointer">
                             <input type="checkbox" className="accent-purple-600 w-4 h-4" />
                             <span className="text-sm text-gray-600">Gửi email đồng thời</span>
                         </label>
                         <label className="flex items-center gap-2 cursor-pointer">
                             <input type="checkbox" className="accent-purple-600 w-4 h-4" />
                             <span className="text-sm text-gray-600">Lên lịch gửi</span>
                         </label>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                    <button className="px-5 py-2.5 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors">Lưu nháp</button>
                    <button onClick={handleSend} className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-700 transition-colors flex items-center gap-2">
                        <Send size={18}/> Gửi ngay
                    </button>
                </div>
            </div>

            {/* RIGHT: PREVIEW CARD */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-500 uppercase flex items-center gap-2">
                    <Smartphone size={16}/> Xem trước thông báo
                </h3>
                <div className="bg-slate-100 p-6 rounded-3xl border border-gray-200 min-h-[400px] flex items-center justify-center">
                    {/* Device Screen Mockup */}
                    <div className="bg-white w-full rounded-2xl shadow-xl overflow-hidden border border-gray-100 max-w-[320px]">
                        <div className="bg-purple-600 h-14 flex items-center justify-between px-4 text-white">
                            <span className="font-bold text-sm">Tarot App</span>
                            <Bell size={18}/>
                        </div>
                        <div className="p-4 bg-gray-50 h-[300px]">
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 animate-in slide-in-from-bottom-2 duration-500">
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg shrink-0 ${getTypeStyle(formData.type).color.replace('border-', '').replace('text-', 'bg-').replace('100', '100')}`}>
                                        {/* Dynamic Icon */}
                                        {React.createElement(getTypeStyle(formData.type).icon, { size: 20, className: getTypeStyle(formData.type).color.match(/text-\w+-\d+/)?.[0] || 'text-gray-600' })}
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1 uppercase font-bold">{getTypeStyle(formData.type).label}</p>
                                        <h4 className="font-bold text-slate-800 text-sm mb-1 line-clamp-2">
                                            {formData.title || 'Tiêu đề thông báo của bạn'}
                                        </h4>
                                        <p className="text-xs text-gray-500 line-clamp-3 mb-3">
                                            {formData.content || 'Nội dung thông báo sẽ hiển thị ở đây...'}
                                        </p>
                                        {formData.btnText && (
                                            <button className="w-full py-1.5 bg-purple-50 text-purple-600 text-xs font-bold rounded-lg border border-purple-100">
                                                {formData.btnText}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <p className="text-xs text-center text-gray-400 italic">Mô phỏng hiển thị trên thiết bị người dùng</p>
            </div>
        </div>
      )}

      {/* === TAB 2: LỊCH SỬ GỬI === */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            
            {/* Filter Bar */}
            <div className="p-5 border-b border-gray-100 bg-slate-50/50 grid grid-cols-1 md:grid-cols-4 gap-4">
                 <div className="md:col-span-2 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                    <input 
                      type="text" placeholder="Tìm kiếm thông báo (Tiêu đề, người nhận)..." 
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                      value={keyword} onChange={e => setKeyword(e.target.value)}
                    />
                 </div>
                 <input 
                    type="date" 
                    className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none text-gray-500"
                    value={filterDate} onChange={e => setFilterDate(e.target.value)}
                 />
                 <select 
                    className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                    value={filterType} onChange={e => setFilterType(e.target.value)}
                 >
                    <option value="All">Tất cả loại</option>
                    {NOTIFICATION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                 </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-white border-b border-gray-200 text-xs text-gray-500 font-bold uppercase">
                        <tr>
                            <th className="px-6 py-4">Tiêu đề</th>
                            <th className="px-6 py-4">Người nhận</th>
                            <th className="px-6 py-4">Loại</th>
                            <th className="px-6 py-4">Trạng thái</th>
                            <th className="px-6 py-4">Đã đọc</th>
                            <th className="px-6 py-4">Thời gian</th>
                            <th className="px-6 py-4 text-center">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredHistory.map(item => {
                            const style = getTypeStyle(item.type);
                            return (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-sm text-slate-800 line-clamp-1 max-w-[200px]" title={item.title}>{item.title}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{item.recipient}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${style.color}`}>
                                            {style.label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.status === 'Sent' && <span className="text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded">Đã gửi</span>}
                                        {item.status === 'Scheduled' && <span className="text-blue-600 text-xs font-bold bg-blue-50 px-2 py-1 rounded">Đã lên lịch</span>}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-mono text-gray-500">
                                        {item.readCount}/{item.totalCount}
                                    </td>
                                    <td className="px-6 py-4 text-xs text-gray-500">{item.date}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button onClick={() => setSelectedNoti(item)} className="p-2 hover:bg-purple-50 text-purple-600 rounded-full transition-colors">
                                            <Eye size={18}/>
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filteredHistory.length === 0 && <div className="p-10 text-center text-gray-400 italic">Không tìm thấy lịch sử thông báo.</div>}
            </div>
        </div>
      )}

      {/* MODAL DETAIL */}
      {selectedNoti && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95">
                  <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                      <h3 className="font-bold text-lg text-slate-800">Chi tiết thông báo</h3>
                      <button onClick={() => setSelectedNoti(null)} className="p-1 hover:bg-gray-100 rounded-full"><X size={20}/></button>
                  </div>
                  <div className="p-6 space-y-4">
                      <div className="flex justify-between items-start">
                          <div>
                              <p className="text-xs text-gray-400 font-bold uppercase mb-1">Loại thông báo</p>
                              <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${getTypeStyle(selectedNoti.type).color}`}>
                                  {getTypeStyle(selectedNoti.type).label}
                              </span>
                          </div>
                          <div className="text-right">
                              <p className="text-xs text-gray-400 font-bold uppercase mb-1">Thời gian gửi</p>
                              <p className="text-sm font-medium text-slate-700">{selectedNoti.date}</p>
                          </div>
                      </div>
                      
                      <div>
                          <p className="text-xs text-gray-400 font-bold uppercase mb-1">Tiêu đề</p>
                          <p className="font-bold text-slate-800 text-lg">{selectedNoti.title}</p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                          <p className="text-sm text-gray-700 leading-relaxed">{selectedNoti.content}</p>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                          <div className="flex items-center gap-2">
                              <Users size={16} className="text-gray-400"/>
                              <span className="text-sm text-gray-600 font-medium">Đã gửi: {selectedNoti.recipient}</span>
                          </div>
                          <div className="flex items-center gap-2">
                              <Eye size={16} className="text-gray-400"/>
                              <span className="text-sm text-gray-600 font-medium">Đã đọc: {selectedNoti.readCount}/{selectedNoti.totalCount}</span>
                          </div>
                      </div>
                  </div>
                  <div className="p-5 border-t border-gray-100 bg-gray-50 text-right rounded-b-2xl">
                      <button onClick={() => setSelectedNoti(null)} className="px-5 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50">Đóng</button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}