import React, { useState } from 'react';
import { 
  Clock, Save, Plus, Edit, Trash2, Search, X, ArrowRight
} from 'lucide-react';

// --- 1. MOCK DATA ---

const MOCK_TOPICS = [
  { 
    id: 'TP01', name: 'Tình yêu', questionCount: 12, icon: '❤️',
    questions: ['Người cũ có quay lại không?', 'Khi nào tôi có người yêu?', 'Mối quan hệ hiện tại đi về đâu?'] 
  },
  { 
    id: 'TP02', name: 'Sự nghiệp', questionCount: 15, icon: '💼',
    questions: ['Có nên nhảy việc lúc này?', 'Cơ hội thăng tiến năm nay?', 'Tôi hợp với nghề gì?'] 
  },
  { 
    id: 'TP03', name: 'Tài chính', questionCount: 10, icon: '💰',
    questions: ['Đầu tư đất có lãi không?', 'Tình hình tài chính tháng tới?', 'Vận may tiền bạc năm nay?'] 
  },
  { 
    id: 'TP04', name: 'Gia đình', questionCount: 8, icon: '🏠',
    questions: ['Sức khỏe cha mẹ thế nào?', 'Chuyện con cái?', 'Hòa khí trong gia đình?'] 
  }
];

const MOCK_CARDS = [
  { id: 'C00', name: 'The Fool', type: 'Major Arcana', image: 'https://placehold.co/300x500/fcd34d/ffffff?text=The+Fool' },
  { id: 'C01', name: 'The Magician', type: 'Major Arcana', image: 'https://placehold.co/300x500/fbbf24/ffffff?text=The+Magician' },
  { id: 'C02', name: 'The High Priestess', type: 'Major Arcana', image: 'https://placehold.co/300x500/60a5fa/ffffff?text=High+Priestess' },
  { id: 'C03', name: 'The Empress', type: 'Major Arcana', image: 'https://placehold.co/300x500/f472b6/ffffff?text=The+Empress' },
  { id: 'C04', name: 'Ace of Cups', type: 'Minor Arcana', image: 'https://placehold.co/300x500/34d399/ffffff?text=Ace+Cups' },
  { id: 'C05', name: 'Ten of Swords', type: 'Minor Arcana', image: 'https://placehold.co/300x500/94a3b8/ffffff?text=10+Swords' },
];

// --- 2. MAIN COMPONENT ---

export default function SystemConfig() {
  const [activeTab, setActiveTab] = useState<'timeout' | 'topics' | 'tarot'>('timeout');

  // STATE: CONFIG TIMEOUT
  const [timeoutConfig, setTimeoutConfig] = useState({
    acceptTime: 5,
    readingTime: 20
  });

  // STATE: TOPICS
  const [topics, setTopics] = useState(MOCK_TOPICS);
  const [selectedTopic, setSelectedTopic] = useState<any | null>(null); 
  const [newQuestion, setNewQuestion] = useState('');

  // STATE: CARDS
  const [cards, setCards] = useState(MOCK_CARDS);
  const [searchCard, setSearchCard] = useState('');

  // --- HANDLERS ---
  const handleSaveTimeout = () => {
    alert(`Đã lưu cấu hình:\n- Chờ xác nhận: ${timeoutConfig.acceptTime} phút\n- Luận giải: ${timeoutConfig.readingTime} phút`);
  };

  const handleAddQuestion = () => {
    if (!newQuestion || !selectedTopic) return;
    const updatedTopics = topics.map(t => {
      if (t.id === selectedTopic.id) {
        return { ...t, questions: [...t.questions, newQuestion], questionCount: t.questionCount + 1 };
      }
      return t;
    });
    setTopics(updatedTopics);
    setSelectedTopic({ 
        ...selectedTopic, 
        questions: [...selectedTopic.questions, newQuestion],
        questionCount: selectedTopic.questionCount + 1 
    });
    setNewQuestion('');
  };

  const handleDeleteQuestion = (qIndex: number) => {
    if (!selectedTopic) return;
    const updatedQuestions = selectedTopic.questions.filter((_: any, idx: number) => idx !== qIndex);
    const updatedTopics = topics.map(t => {
        if (t.id === selectedTopic.id) {
          return { ...t, questions: updatedQuestions, questionCount: updatedQuestions.length };
        }
        return t;
    });
    setTopics(updatedTopics);
    setSelectedTopic({ ...selectedTopic, questions: updatedQuestions, questionCount: updatedQuestions.length });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 animate-fade-in-up font-sans text-slate-800 p-6">
      
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-indigo-600">
          Cấu hình vận hành
        </h1>
        <p className="text-sm text-gray-500 mt-1">Quản lý tham số hệ thống, chủ đề và bộ bài Tarot</p>
      </div>

      {/* TABS */}
      <div className="flex gap-8 border-b border-gray-200 mb-8">
        {[
            { id: 'timeout', label: 'Cấu hình Time-out' },
            { id: 'topics', label: 'Chủ đề & Câu hỏi' },
            { id: 'tarot', label: 'Bộ bài Tarot' }
        ].map(tab => (
            <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 text-sm font-bold border-b-2 transition-all ${
                    activeTab === tab.id 
                    ? 'border-purple-600 text-purple-700' 
                    : 'border-transparent text-gray-500 hover:text-purple-600'
                }`}
            >
                {tab.label}
            </button>
        ))}
      </div>

      {/* TAB 1: TIMEOUT */}
      {activeTab === 'timeout' && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-2xl">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Clock size={20} className="text-purple-600"/> Cấu hình Time-out
            </h3>
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Thời gian chờ xác nhận (phút)</label>
                    <input type="number" className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-700"
                        value={timeoutConfig.acceptTime}
                        onChange={e => setTimeoutConfig({...timeoutConfig, acceptTime: Number(e.target.value)})}
                    />
                    <p className="text-xs text-gray-400 mt-1">Reader phải nhận cuốc trong thời gian này.</p>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Thời gian luận giải (phút)</label>
                    <input type="number" className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-700"
                        value={timeoutConfig.readingTime}
                        onChange={e => setTimeoutConfig({...timeoutConfig, readingTime: Number(e.target.value)})}
                    />
                    <p className="text-xs text-gray-400 mt-1">Thời gian tối đa để Reader trả kết quả.</p>
                </div>
                <div className="pt-4">
                    <button onClick={handleSaveTimeout} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2">
                        <Save size={18}/> Lưu cấu hình
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* TAB 2: TOPICS */}
      {activeTab === 'topics' && (
        <div>
            <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-gray-500">Quản lý chủ đề và câu hỏi gợi ý</p>
                <button className="bg-purple-600 text-white px-4 py-2 rounded-xl font-bold shadow-md hover:bg-purple-700 transition-all flex items-center gap-2 text-sm">
                    <Plus size={16}/> Thêm chủ đề
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topics.map(topic => (
                    <div key={topic.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-2xl">{topic.icon}</div>
                            <button className="p-2 text-gray-300 hover:text-purple-600 transition-colors"><Edit size={16}/></button>
                        </div>
                        <h4 className="text-lg font-bold text-slate-800 mb-1">{topic.name}</h4>
                        <p className="text-sm text-gray-500 mb-6">{topic.questionCount} câu hỏi gợi ý</p>
                        <div className="pt-4 border-t border-gray-50">
                            <button onClick={() => setSelectedTopic(topic)} className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                                Quản lý câu hỏi <ArrowRight size={14}/>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* TAB 3: TAROT CARDS */}
      {activeTab === 'tarot' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                <div><h3 className="text-lg font-bold text-slate-800">Bộ bài Tarot chuẩn</h3><p className="text-sm text-gray-500">Quản lý hình ảnh 78 lá bài</p></div>
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                        <input type="text" placeholder="Tìm kiếm lá bài..." className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500 w-full" value={searchCard} onChange={e => setSearchCard(e.target.value)}/>
                    </div>
                    <button className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold shadow-md hover:bg-emerald-700 transition-all text-sm whitespace-nowrap flex items-center gap-2"><Plus size={16}/> Thêm lá bài</button>
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {cards.filter(c => c.name.toLowerCase().includes(searchCard.toLowerCase())).map(card => (
                    <div key={card.id} className="group relative">
                        <div className="aspect-[2/3] rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-100">
                            <img src={card.image} alt={card.name} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"/>
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button className="p-2 bg-white rounded-full text-blue-600 shadow-lg"><Edit size={16}/></button>
                                <button className="p-2 bg-white rounded-full text-red-600 shadow-lg"><Trash2 size={16}/></button>
                            </div>
                        </div>
                        <div className="mt-3 text-center">
                            <h5 className="font-bold text-sm text-slate-800 truncate">{card.name}</h5>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider">{card.type}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* MODAL QUESTIONS */}
      {selectedTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[80vh]">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2"><span className="text-2xl">{selectedTopic.icon}</span> Quản lý câu hỏi: {selectedTopic.name}</h3>
                    <button onClick={() => setSelectedTopic(null)} className="p-1 hover:bg-gray-200 rounded-full transition-colors"><X size={20}/></button>
                </div>
                <div className="p-6 flex-1 overflow-y-auto">
                    <div className="flex gap-2 mb-6">
                        <input type="text" placeholder="Nhập câu hỏi mới..." className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500" value={newQuestion} onChange={e => setNewQuestion(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddQuestion()}/>
                        <button onClick={handleAddQuestion} className="bg-purple-600 text-white px-4 rounded-xl font-bold hover:bg-purple-700 transition-colors"><Plus size={20}/></button>
                    </div>
                    <div className="space-y-3">
                        {selectedTopic.questions.map((q: string, idx: number) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100 group hover:border-purple-200 transition-colors">
                                <span className="text-sm text-gray-700 font-medium">{q}</span>
                                <button onClick={() => handleDeleteQuestion(idx)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-4 border-t border-gray-100 text-right"><button onClick={() => setSelectedTopic(null)} className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-lg text-sm transition-colors">Đóng</button></div>
            </div>
        </div>
      )}
    </div>
  );
}