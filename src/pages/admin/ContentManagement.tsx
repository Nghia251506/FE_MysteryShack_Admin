import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, Plus, Edit, Trash2, 
  Eye, EyeOff, FileText, Folder, Image as ImageIcon,
  MoreHorizontal, Calendar, ArrowRight, X, Check
} from 'lucide-react';

// --- 1. INTERFACES ---

interface Category {
  id: string;
  name: string;
  articleCount: number;
  description?: string;
}

interface Article {
  id: string;
  title: string;
  image: string;
  categoryId: string;
  categoryName: string;
  status: 'Published' | 'Draft' | 'Hidden';
  views: number;
  date: string; // YYYY-MM-DD
  content: string; // Nội dung bài viết
}

// --- 2. MOCK DATA ---

const MOCK_CATEGORIES: Category[] = [
  { id: 'CAT01', name: 'Ý nghĩa 78 lá bài', articleCount: 78, description: 'Giải nghĩa chi tiết từng lá bài Tarot' },
  { id: 'CAT02', name: 'Kiến thức cung hoàng đạo', articleCount: 24, description: 'Sự kết hợp giữa Tarot và Astrology' },
  { id: 'CAT03', name: 'Tarot cho người mới', articleCount: 15, description: 'Các bài học cơ bản nhập môn' },
  { id: 'CAT04', name: 'Hướng dẫn luận giải', articleCount: 32, description: 'Các phương pháp trải bài (Spread)' },
];

const MOCK_ARTICLES: Article[] = [
  { 
    id: 'ART01', title: 'Ý nghĩa lá bài The Fool - Khởi đầu mới', 
    image: 'https://placehold.co/600x400/9333ea/ffffff?text=The+Fool',
    categoryId: 'CAT01', categoryName: 'Ý nghĩa 78 lá bài', 
    status: 'Published', views: 1248, date: '2025-01-15',
    content: 'The Fool là lá bài số 0 trong bộ Ẩn chính...'
  },
  { 
    id: 'ART02', title: 'Cung Bạch Dương và Tarot', 
    image: 'https://placehold.co/600x400/f59e0b/ffffff?text=Aries',
    categoryId: 'CAT02', categoryName: 'Kiến thức cung hoàng đạo', 
    status: 'Published', views: 892, date: '2025-01-14',
    content: 'Bạch Dương tương ứng với lá bài The Emperor...'
  },
  { 
    id: 'ART03', title: 'Cách xào bài Tarot đúng cách', 
    image: 'https://placehold.co/600x400/10b981/ffffff?text=Shuffle',
    categoryId: 'CAT03', categoryName: 'Tarot cho người mới', 
    status: 'Draft', views: 0, date: '2025-01-13',
    content: 'Có nhiều cách xào bài, nhưng quan trọng nhất là tâm thế...'
  },
  { 
    id: 'ART04', title: 'Spread 3 lá bài cơ bản', 
    image: 'https://placehold.co/600x400/ef4444/ffffff?text=3+Cards',
    categoryId: 'CAT04', categoryName: 'Hướng dẫn luận giải', 
    status: 'Hidden', views: 56, date: '2025-01-16',
    content: 'Trải bài Quá khứ - Hiện tại - Tương lai...'
  },
];

// --- 3. COMPONENT: STATUS BADGE ---
const StatusBadge = ({ status }: { status: string }) => {
  if (status === 'Published') return <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded text-[10px] font-bold border border-emerald-100 uppercase">Đã xuất bản</span>;
  if (status === 'Draft') return <span className="bg-gray-100 text-gray-500 px-2.5 py-1 rounded text-[10px] font-bold border border-gray-200 uppercase">Bản nháp</span>;
  return <span className="bg-red-50 text-red-600 px-2.5 py-1 rounded text-[10px] font-bold border border-red-100 uppercase">Đang ẩn</span>;
};

// --- 4. MAIN PAGE ---
export default function ContentManagement() {
  const [activeTab, setActiveTab] = useState<'articles' | 'categories'>('articles');
  
  // Data States
  const [articles, setArticles] = useState<Article[]>(MOCK_ARTICLES);
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);

  // Filter States
  const [keyword, setKeyword] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Modal States
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  
  // Article Form State
  const [articleForm, setArticleForm] = useState({
    title: '', categoryId: '', date: '', content: '', image: ''
  });
  // Category Form State
  const [catForm, setCatForm] = useState({ name: '', description: '' });

  // --- LOGIC ---

  // Lọc bài viết
  const filteredArticles = useMemo(() => {
    return articles.filter(a => {
      const matchKey = a.title.toLowerCase().includes(keyword.toLowerCase());
      const matchDate = filterDate ? a.date === filterDate : true;
      const matchCat = filterCategory ? a.categoryId === filterCategory : true;
      return matchKey && matchDate && matchCat;
    });
  }, [articles, keyword, filterDate, filterCategory]);

  // Handlers Bài viết
  const handleOpenArticleModal = (article?: Article) => {
    if (article) {
      setSelectedArticle(article);
      setArticleForm({
        title: article.title, categoryId: article.categoryId,
        date: article.date, content: article.content, image: article.image
      });
    } else {
      setSelectedArticle(null);
      setArticleForm({ title: '', categoryId: '', date: new Date().toISOString().split('T')[0], content: '', image: '' });
    }
    setIsArticleModalOpen(true);
  };

  const handleSaveArticle = () => {
    if(!articleForm.title || !articleForm.categoryId) return alert("Vui lòng nhập đủ thông tin!");
    
    const catName = categories.find(c => c.id === articleForm.categoryId)?.name || 'Unknown';
    const newArticle: Article = {
      id: selectedArticle ? selectedArticle.id : `ART${Date.now()}`,
      title: articleForm.title,
      categoryId: articleForm.categoryId,
      categoryName: catName,
      date: articleForm.date,
      content: articleForm.content,
      image: articleForm.image || 'https://placehold.co/600x400/e2e8f0/64748b?text=No+Image',
      status: selectedArticle ? selectedArticle.status : 'Published',
      views: selectedArticle ? selectedArticle.views : 0
    };

    if(selectedArticle) {
      setArticles(articles.map(a => a.id === selectedArticle.id ? newArticle : a));
    } else {
      setArticles([newArticle, ...articles]);
      // Tăng count category
      setCategories(categories.map(c => c.id === newArticle.categoryId ? { ...c, articleCount: c.articleCount + 1 } : c));
    }
    setIsArticleModalOpen(false);
  };

  const toggleHideArticle = (id: string) => {
    setArticles(articles.map(a => a.id === id ? { ...a, status: a.status === 'Hidden' ? 'Published' : 'Hidden' } : a));
  };

  const handleDeleteArticle = (id: string) => {
    if(window.confirm('Xóa bài viết này?')) setArticles(articles.filter(a => a.id !== id));
  };

  // Handlers Danh mục
  const handleSaveCategory = () => {
    if(!catForm.name) return;
    const newCat: Category = {
      id: `CAT${Date.now()}`,
      name: catForm.name,
      description: catForm.description,
      articleCount: 0
    };
    setCategories([...categories, newCat]);
    setIsCategoryModalOpen(false);
    setCatForm({ name: '', description: '' });
  };

  // Chuyển từ Tab Danh mục sang Tab Bài viết để xem chi tiết
  const handleViewCategoryDetail = (catId: string) => {
    setActiveTab('articles');
    setFilterCategory(catId);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 animate-fade-in-up font-sans text-slate-800 p-6">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-indigo-600">
            Quản lý Nội dung
          </h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý bài viết và danh mục</p>
        </div>
        
        {/* Nút tạo mới thay đổi tùy Tab */}
        {activeTab === 'articles' ? (
          <button onClick={() => handleOpenArticleModal()} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all">
            <Plus size={18}/> Tạo bài viết mới
          </button>
        ) : (
          <button onClick={() => setIsCategoryModalOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all">
            <Plus size={18}/> Thêm danh mục
          </button>
        )}
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex gap-8 border-b border-gray-200 mb-6">
        <button 
          onClick={() => setActiveTab('articles')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'articles' ? 'border-emerald-500 text-emerald-700' : 'border-transparent text-gray-500 hover:text-emerald-600'}`}
        >
          Bài viết
        </button>
        <button 
          onClick={() => setActiveTab('categories')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${activeTab === 'categories' ? 'border-purple-500 text-purple-700' : 'border-transparent text-gray-500 hover:text-purple-600'}`}
        >
          Danh mục
        </button>
        {/* Đã bỏ tab Thư viện theo yêu cầu */}
      </div>

      {/* ================= TAB 1: BÀI VIẾT ================= */}
      {activeTab === 'articles' && (
        <>
          {/* Filter Bar */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
             <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                <input 
                  type="text" placeholder="Tìm tiêu đề bài viết..." 
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  value={keyword} onChange={e => setKeyword(e.target.value)}
                />
             </div>
             <input 
                type="date" 
                className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-gray-500"
                value={filterDate} onChange={e => setFilterDate(e.target.value)}
             />
             <select 
                className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
             >
                <option value="">Tất cả danh mục</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
             </select>
          </div>

          {/* Articles Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-gray-200 text-xs text-gray-500 font-bold uppercase">
                <tr>
                  <th className="px-6 py-4">Bài viết</th>
                  <th className="px-6 py-4">Danh mục</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4">Lượt xem</th>
                  <th className="px-6 py-4">Ngày</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredArticles.map(article => (
                  <tr key={article.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={article.image} alt="" className="w-16 h-10 object-cover rounded-lg border border-gray-200"/>
                        <p className="font-bold text-sm text-slate-800 line-clamp-1 max-w-[200px]" title={article.title}>{article.title}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{article.categoryName}</td>
                    <td className="px-6 py-4"><StatusBadge status={article.status}/></td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-500">{article.views.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{article.date}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenArticleModal(article)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" title="Chỉnh sửa"><Edit size={16}/></button>
                        <button onClick={() => toggleHideArticle(article.id)} className={`p-2 rounded-lg transition-colors ${article.status === 'Hidden' ? 'text-emerald-600 bg-emerald-50' : 'text-gray-500 bg-gray-100 hover:bg-gray-200'}`} title={article.status === 'Hidden' ? 'Hiện bài' : 'Ẩn bài'}>
                           {article.status === 'Hidden' ? <Eye size={16}/> : <EyeOff size={16}/>}
                        </button>
                        <button onClick={() => handleDeleteArticle(article.id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" title="Xóa"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredArticles.length === 0 && <div className="p-10 text-center text-gray-400">Không tìm thấy bài viết nào.</div>}
          </div>
        </>
      )}

      {/* ================= TAB 2: DANH MỤC (GRID CARD) ================= */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map(cat => (
            <div key={cat.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-200 transition-all group relative cursor-pointer" onClick={() => handleViewCategoryDetail(cat.id)}>
               <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-4">
                  <Folder size={20}/>
               </div>
               <h3 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-purple-700 transition-colors">{cat.name}</h3>
               <p className="text-sm text-gray-500 mb-4">{cat.articleCount} bài viết</p>
               
               <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <button className="text-xs font-bold text-purple-600 hover:underline">Chỉnh sửa</button>
                  <MoreHorizontal size={16} className="text-gray-400"/>
               </div>
            </div>
          ))}

          {/* Card Thêm danh mục */}
          <button 
            onClick={() => setIsCategoryModalOpen(true)}
            className="border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50/50 transition-all h-[200px]"
          >
             <Plus size={32} className="mb-2"/>
             <span className="font-bold text-sm">Thêm danh mục</span>
          </button>
        </div>
      )}

      {/* ================= MODAL: CREATE/EDIT ARTICLE ================= */}
      {isArticleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
              <h3 className="text-xl font-bold text-slate-800">{selectedArticle ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}</h3>
              <button onClick={() => setIsArticleModalOpen(false)}><X size={20} className="text-gray-500 hover:text-red-500"/></button>
            </div>
            
            <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* Left Column: Editor */}
               <div className="lg:col-span-2 space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-1">Tiêu đề bài viết</label>
                    <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Nhập tiêu đề..."
                      value={articleForm.title} onChange={e => setArticleForm({...articleForm, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-1">Nội dung</label>
                    <textarea className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 h-64 resize-none" placeholder="Viết nội dung ở đây..."
                      value={articleForm.content} onChange={e => setArticleForm({...articleForm, content: e.target.value})}
                    ></textarea>
                  </div>
               </div>

               {/* Right Column: Settings */}
               <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-1">Danh mục</label>
                    <select className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      value={articleForm.categoryId} onChange={e => setArticleForm({...articleForm, categoryId: e.target.value})}
                    >
                      <option value="">Chọn danh mục...</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-1">Ngày đăng</label>
                    <input type="date" className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-gray-600"
                      value={articleForm.date} onChange={e => setArticleForm({...articleForm, date: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-1">Ảnh bìa (URL)</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 cursor-pointer">
                        {articleForm.image ? (
                            <div className="relative group">
                                <img src={articleForm.image} className="w-full h-32 object-cover rounded-lg" alt=""/>
                                <button onClick={() => setArticleForm({...articleForm, image: ''})} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={12}/></button>
                            </div>
                        ) : (
                            <div className="py-4">
                                <ImageIcon className="mx-auto text-gray-400 mb-2"/>
                                <input type="text" className="w-full text-xs border border-gray-200 p-2 rounded" placeholder="Paste link ảnh..."
                                  onChange={e => setArticleForm({...articleForm, image: e.target.value})}
                                />
                            </div>
                        )}
                    </div>
                  </div>
               </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 text-right sticky bottom-0">
                <button onClick={handleSaveArticle} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all">
                    {selectedArticle ? 'Cập nhật bài viết' : 'Xuất bản ngay'}
                </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE CATEGORY ================= */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
           <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                 <h3 className="text-lg font-bold text-slate-800">Thêm danh mục mới</h3>
                 <button onClick={() => setIsCategoryModalOpen(false)}><X size={20}/></button>
              </div>
              <div className="p-6 space-y-4">
                 <div>
                    <label className="block text-sm font-bold text-gray-600 mb-1">Tên danh mục</label>
                    <input type="text" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                      value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})}
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-gray-600 mb-1">Mô tả ngắn</label>
                    <textarea className="w-full px-4 py-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 h-24 resize-none"
                      value={catForm.description} onChange={e => setCatForm({...catForm, description: e.target.value})}
                    ></textarea>
                 </div>
              </div>
              <div className="p-5 border-t border-gray-100 bg-gray-50 text-right rounded-b-2xl">
                 <button onClick={handleSaveCategory} className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md transition-all">Lưu danh mục</button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}