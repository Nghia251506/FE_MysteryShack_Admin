import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, X, RefreshCcw, 
  PlayCircle, CheckCircle2, AlertOctagon, 
  AlertTriangle, Copy, FileText, Star, 
  Layers, Image as ImageIcon
} from 'lucide-react';

// --- 1. INTERFACES ---

interface CardDetail {
  name: string;
  meaning: string;
  image?: string;
}

interface ReadingForm {
  topic: string;
  question: string;
  cards: CardDetail[];
  conclusion: string;
}

interface DisputeInfo {
  status: 'Pending' | 'Processing' | 'Resolved';
  reason: string;
  complainant: 'Reader' | 'Customer';
}

interface Session {
  id: string;
  readerId: string;
  readerName: string;
  customerId: string;
  customerName: string;
  startTime: string;
  status: 'In Progress' | 'Completed' | 'Disputed';
  
  topic?: string;
  question?: string; 
  rating?: number;   
  readingResult?: ReadingForm; 
  dispute?: DisputeInfo;
}

// --- 2. MOCK DATA ---
const MOCK_SESSIONS: Session[] = [
  // 1. Đang diễn ra
  {
    id: 'SS-LIVE-01', readerId: 'R001', readerName: 'Madame Rose', 
    customerId: 'C005', customerName: 'Nguyễn Văn A', 
    startTime: '2024-02-01 14:30', status: 'In Progress',
    topic: 'Tình yêu', question: 'Người yêu cũ có quay lại không?',
    readingResult: {
      topic: 'Tình yêu',
      question: 'Người yêu cũ có quay lại không?',
      cards: [
        { name: 'Six of Cups', meaning: 'Lá bài này gợi nhớ về quá khứ, kỷ niệm cũ.', image: 'https://placehold.co/400x600/9333ea/ffffff?text=Six+of+Cups' },
        { name: 'The Lovers', meaning: 'Sự kết nối mạnh mẽ vẫn còn đó.', image: 'https://placehold.co/400x600/9333ea/ffffff?text=The+Lovers' }
      ],
      conclusion: '(Reader đang nhập liệu...)'
    }
  },
  
  // 2. Đã hoàn thành
  {
    id: 'SS-DONE-88', readerId: 'R002', readerName: 'Tarot Master', 
    customerId: 'C005', customerName: 'Nguyễn Văn A', 
    startTime: '2024-01-30 09:00', status: 'Completed',
    topic: 'Tài chính', rating: 5,
    readingResult: {
      topic: 'Tài chính', question: 'Năm nay đầu tư đất được không?',
      cards: [
        { name: 'The Sun', meaning: 'Năng lượng tích cực, rực rỡ.', image: 'https://placehold.co/400x600/F59E0B/ffffff?text=The+Sun' },
        { name: 'Ace of Pentacles', meaning: 'Cơ hội tài chính mới vững chắc.', image: 'https://placehold.co/400x600/10B981/ffffff?text=Ace+Pentacles' },
        { name: 'King of Wands', meaning: 'Tầm nhìn xa và quyết đoán.', image: 'https://placehold.co/400x600/EF4444/ffffff?text=King+Wands' }
      ],
      conclusion: 'Tổng kết: Thời vận đang lên, rất thuận lợi cho việc đầu tư bất động sản.'
    }
  },

  // 3. Tranh chấp
  {
    id: 'SS-DIS-01', readerId: 'R005', readerName: 'Newbie Reader', 
    customerId: 'C099', customerName: 'Khách Khó Tính', 
    startTime: '2024-01-25 10:00', status: 'Disputed',
    topic: 'Tình yêu', rating: 1,
    dispute: { 
        status: 'Pending', 
        reason: 'Reader giải bài sai ý nghĩa lá bài và kết luận tiêu cực.', 
        complainant: 'Customer' 
    },
    readingResult: {
      topic: 'Tình yêu', 
      question: 'Khi nào tôi có người yêu mới?',
      cards: [
        { name: 'Death', meaning: 'Chết chóc. Hết hy vọng rồi.', image: 'https://placehold.co/400x600/374151/ffffff?text=Death' },
        { name: 'Three of Swords', meaning: 'Đau khổ tột cùng.', image: 'https://placehold.co/400x600/374151/ffffff?text=3+Swords' }
      ],
      conclusion: 'Số bạn đen lắm, không có người yêu đâu.'
    }
  }
];

// --- 3. COMPONENTS HELPERS ---

const StatusBadge = ({ status, disputeStatus }: { status: string, disputeStatus?: string }) => {
  if (status === 'In Progress') return <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold border border-blue-100 flex items-center gap-1 w-fit"><PlayCircle size={12}/> Đang diễn ra</span>;
  if (status === 'Completed') return <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100 flex items-center gap-1 w-fit"><CheckCircle2 size={12}/> Đã hoàn thành</span>;
  if (status === 'Disputed') {
     const color = disputeStatus === 'Resolved' ? 'bg-gray-100 text-gray-500' : 'bg-red-50 text-red-600 border-red-100 animate-pulse';
     return <span className={`${color} px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 w-fit`}><AlertTriangle size={12}/> {disputeStatus === 'Pending' ? 'Tranh chấp (Chờ xử lý)' : disputeStatus}</span>;
  }
  return null;
};

// --- 4. MAIN PAGE ---

export default function SessionMonitoring() {
  const [activeTab, setActiveTab] = useState<'live' | 'completed' | 'dispute'>('live');
  const [sessions, setSessions] = useState<Session[]>(MOCK_SESSIONS);
  
  // Filter States
  const [filterKeyword, setFilterKeyword] = useState('');
  const [filterTopic, setFilterTopic] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterRating, setFilterRating] = useState('');

  // Modal
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  // --- FILTER LOGIC ---
  const filteredSessions = useMemo(() => {
    let data = sessions;
    if (activeTab === 'live') data = data.filter(s => s.status === 'In Progress');
    if (activeTab === 'completed') data = data.filter(s => s.status === 'Completed');
    if (activeTab === 'dispute') data = data.filter(s => s.status === 'Disputed');

    if (activeTab !== 'live') {
        if (filterKeyword) {
            const kw = filterKeyword.toLowerCase();
            data = data.filter(s => s.id.toLowerCase().includes(kw) || s.readerName.toLowerCase().includes(kw) || s.readerId.toLowerCase().includes(kw) || s.customerName.toLowerCase().includes(kw) || s.customerId.toLowerCase().includes(kw));
        }
        if (filterTopic) data = data.filter(s => s.topic?.toLowerCase().includes(filterTopic.toLowerCase()));
        if (filterDate) data = data.filter(s => s.startTime.includes(filterDate));
        if (filterRating && activeTab === 'completed') data = data.filter(s => s.rating && s.rating >= Number(filterRating));
    }
    return data;
  }, [sessions, activeTab, filterKeyword, filterTopic, filterDate, filterRating]);

  const clearFilters = () => { setFilterKeyword(''); setFilterTopic(''); setFilterDate(''); setFilterRating(''); };
  const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text); alert(`Đã copy ID: ${text}`); };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 animate-fade-in-up font-sans text-slate-800 p-6">
      
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-indigo-600">Giám Sát Phiên</h1>
        <p className="text-sm text-gray-500 mt-1">Theo dõi hoạt động, lịch sử và giải quyết khiếu nại.</p>
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
          {[
              { id: 'live', label: 'Đang diễn ra', icon: PlayCircle },
              { id: 'completed', label: 'Đã hoàn thành', icon: CheckCircle2 },
              { id: 'dispute', label: 'Tranh chấp', icon: AlertOctagon, count: sessions.filter(s => s.status === 'Disputed').length }
          ].map(tab => (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id as any); clearFilters(); }} className={`px-6 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${activeTab === tab.id ? 'border-purple-600 text-purple-700 bg-purple-50/50 rounded-t-lg' : 'border-transparent text-gray-500 hover:text-purple-600'}`}>
                  <tab.icon size={16}/> {tab.label}
                  {tab.count !== undefined && tab.count > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow-sm animate-pulse">{tab.count}</span>}
              </button>
          ))}
      </div>

      {/* FILTER BAR */}
      {activeTab !== 'live' && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                  <input type="text" placeholder="Tìm ID Phiên, Tên/ID Reader hoặc Khách..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all" value={filterKeyword} onChange={e => setFilterKeyword(e.target.value)}/>
              </div>
              <input type="text" placeholder="Chủ đề..." className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all" value={filterTopic} onChange={e => setFilterTopic(e.target.value)}/>
              <input type="date" className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none text-gray-500 transition-all" value={filterDate} onChange={e => setFilterDate(e.target.value)}/>
              {activeTab === 'completed' && (
                  <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-white transition-all" value={filterRating} onChange={e => setFilterRating(e.target.value)}>
                      <option value="">Đánh giá sao</option>
                      <option value="5">5 Sao</option>
                      <option value="4">4 Sao trở lên</option>
                      <option value="1">1 Sao (Cần chú ý)</option>
                  </select>
              )}
              <button onClick={clearFilters} className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm font-bold transition-colors"><RefreshCcw size={14}/> Xóa lọc</button>
          </div>
      )}

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-gray-200 text-xs text-gray-500 font-bold uppercase">
                      <tr>
                          <th className="px-6 py-4">ID Phiên</th>
                          <th className="px-6 py-4">Reader</th>
                          <th className="px-6 py-4">Khách</th>
                          {activeTab !== 'live' && <th className="px-6 py-4">Chủ đề</th>}
                          <th className="px-6 py-4">Bắt đầu lúc</th>
                          {activeTab === 'completed' && <th className="px-6 py-4">Đánh giá</th>}
                          {activeTab === 'dispute' && <th className="px-6 py-4">Trạng thái</th>}
                          <th className="px-6 py-4 text-right">Tác vụ</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                      {filteredSessions.map(session => (
                          <tr key={session.id} className="hover:bg-purple-50/20 transition-colors">
                              <td className="px-6 py-4 font-mono text-xs font-bold text-gray-500">{session.id}</td>
                              <td className="px-6 py-4 text-sm"><p className="font-bold text-slate-700">{session.readerName}</p><p className="text-[10px] text-gray-400 font-mono">{session.readerId}</p></td>
                              <td className="px-6 py-4 text-sm"><p className="font-medium text-slate-700">{session.customerName}</p><p className="text-[10px] text-gray-400 font-mono">{session.customerId}</p></td>
                              {activeTab !== 'live' && <td className="px-6 py-4 text-sm text-gray-600">{session.topic}</td>}
                              <td className="px-6 py-4 text-sm text-gray-600">{session.startTime}</td>
                              {activeTab === 'completed' && <td className="px-6 py-4"><div className="flex items-center gap-1 text-amber-500 font-bold text-sm">{session.rating} <Star size={12} fill="currentColor"/></div></td>}
                              {activeTab === 'dispute' && <td className="px-6 py-4"><StatusBadge status={session.status} disputeStatus={session.dispute?.status}/></td>}
                              <td className="px-6 py-4 text-right">
                                  <button onClick={() => setSelectedSession(session)} className="text-purple-600 hover:bg-purple-50 px-3 py-1.5 rounded-lg text-xs font-bold border border-purple-200 transition-all shadow-sm">
                                      Chi tiết
                                  </button>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
          {filteredSessions.length === 0 && <div className="p-10 text-center text-gray-400 italic">Không có dữ liệu phù hợp.</div>}
      </div>

      {/* --- MODAL DETAIL --- */}
      {selectedSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95">
                  <div className={`p-6 text-white flex justify-between items-center ${activeTab === 'dispute' ? 'bg-red-600' : 'bg-gradient-to-r from-purple-700 to-indigo-700'}`}>
                      <div>
                          <h3 className="text-lg font-bold flex items-center gap-2">
                              {activeTab === 'live' && <PlayCircle size={20}/>}
                              {activeTab === 'completed' && <CheckCircle2 size={20}/>}
                              {activeTab === 'dispute' && <AlertOctagon size={20}/>}
                              Chi tiết phiên: {selectedSession.id}
                          </h3>
                          <p className="text-xs opacity-80 mt-1">Thời gian bắt đầu: {selectedSession.startTime}</p>
                      </div>
                      <button onClick={() => setSelectedSession(null)} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X size={20}/></button>
                  </div>

                  <div className="p-6 space-y-6">
                      
                      {/* Basic Info */}
                      <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <div><p className="text-xs text-gray-400 uppercase font-bold mb-1">Reader</p><p className="font-bold text-slate-800">{selectedSession.readerName}</p><p className="text-xs font-mono text-gray-500">{selectedSession.readerId}</p></div>
                          <div className="text-right"><p className="text-xs text-gray-400 uppercase font-bold mb-1">Khách hàng</p><p className="font-bold text-slate-800">{selectedSession.customerName}</p><p className="text-xs font-mono text-gray-500">{selectedSession.customerId}</p></div>
                      </div>

                      {/* Dispute Info */}
                      {activeTab === 'dispute' && selectedSession.dispute && (
                          <div className="bg-red-50 p-5 rounded-xl border border-red-100 relative overflow-hidden">
                              <div className="absolute top-0 right-0 bg-red-200 text-red-800 text-[10px] font-bold px-2 py-1 rounded-bl-lg">KHIẾU NẠI</div>
                              <h4 className="text-red-700 font-bold flex items-center gap-2 mb-3"><AlertTriangle size={18}/> Thông tin tranh chấp</h4>
                              <div className="space-y-3 text-sm">
                                  <div className="flex justify-between"><span className="text-gray-600">Trạng thái:</span><span className="font-bold text-red-600 bg-white px-2 py-0.5 rounded border border-red-100">{selectedSession.dispute.status === 'Pending' ? 'Chờ xử lý' : selectedSession.dispute.status}</span></div>
                                  <div className="flex justify-between"><span className="text-gray-600">Bên khiếu nại:</span><span className="font-bold">{selectedSession.dispute.complainant === 'Customer' ? 'Khách hàng' : 'Reader'}</span></div>
                                  <div><span className="text-gray-600 block mb-1 font-bold">Lý do:</span><p className="bg-white p-3 rounded-lg border border-red-100 text-gray-700 italic">"{selectedSession.dispute.reason}"</p></div>
                              </div>
                              <div className="mt-4 pt-3 border-t border-red-200"><button onClick={() => copyToClipboard(selectedSession.id)} className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all"><Copy size={16}/> Copy ID & Giải quyết</button></div>
                          </div>
                      )}

                      {/* READING RESULT FORM (Hiển thị chi tiết từng lá bài) */}
                      {selectedSession.readingResult && (
                          <div className="border border-amber-200 bg-amber-50/50 rounded-xl p-5 relative overflow-hidden shadow-sm">
                              <div className="absolute top-0 right-0 bg-amber-200 text-amber-900 text-[10px] font-bold px-2 py-1 rounded-bl-lg">CHI TIẾT LUẬN GIẢI</div>
                              <h4 className="text-amber-800 font-bold mb-4 flex items-center gap-2"><FileText size={18}/> Nội dung phiên</h4>
                              
                              <div className="space-y-5 text-sm">
                                  <div><span className="block text-xs font-bold text-gray-400 uppercase mb-1">Câu hỏi</span><p className="bg-white p-3 rounded-lg border border-amber-100 text-gray-800 font-medium">"{selectedSession.readingResult.question}"</p></div>

                                  <div>
                                      <span className="block text-xs font-bold text-gray-400 uppercase mb-2">Các lá bài & Luận giải chi tiết</span>
                                      <div className="space-y-3">
                                          {selectedSession.readingResult.cards.map((card, idx) => (
                                              <div key={idx} className="bg-white border border-amber-200 rounded-lg p-3 flex gap-3 shadow-sm hover:shadow-md transition-shadow">
                                                  {/* Ảnh lá bài - Sử dụng PLACEHOLD.CO để đảm bảo không lỗi */}
                                                  <div className="w-16 h-24 bg-gray-200 rounded shrink-0 overflow-hidden border border-gray-300">
                                                       {card.image ? <img src={card.image} className="w-full h-full object-cover" alt={card.name}/> : <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon size={20}/></div>}
                                                  </div>
                                                  <div>
                                                      <p className="font-bold text-amber-900 text-sm mb-1">{card.name}</p>
                                                      <p className="text-xs text-gray-600 italic leading-relaxed">{card.meaning}</p>
                                                  </div>
                                              </div>
                                          ))}
                                      </div>
                                  </div>

                                  <div>
                                      <span className="block text-xs font-bold text-gray-400 uppercase mb-1">Tổng kết / Lời khuyên chung</span>
                                      <p className="bg-white p-3 rounded-lg border border-amber-100 text-gray-800 leading-relaxed font-medium">
                                          {selectedSession.readingResult.conclusion}
                                      </p>
                                  </div>
                              </div>
                          </div>
                      )}
                  </div>
                  
                  <div className="p-4 border-t border-gray-100 bg-gray-50 text-right">
                      <button onClick={() => setSelectedSession(null)} className="px-6 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-bold shadow-sm transition-all">Đóng</button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}