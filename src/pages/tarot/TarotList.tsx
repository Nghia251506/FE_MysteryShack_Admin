import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search, Loader2, EyeOff } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppRedux';
import { 
  fetchAllCards, 
  softDeleteTarotCard, 
  hardDeleteTarotCard 
} from '../../redux/tarotCardSlice';

export default function TarotList() {
  const dispatch = useAppDispatch();
  const { cards, loading, error, pagination } = useAppSelector(state => state.tarotCard);

  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Load dữ liệu khi mount hoặc thay đổi page/search
  useEffect(() => {
    dispatch(fetchAllCards({ 
      page, 
      size: 10, 
      sort: 'cardNumber,asc' 
    }));
  }, [dispatch, page]);

  // Xử lý tìm kiếm (debounce đơn giản)
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchQuery) {
        // Bạn có thể thêm action search riêng sau
        // tạm thời reload page 0
        setPage(0);
        dispatch(fetchAllCards({ page: 0, size: 10, sort: 'cardNumber,asc' }));
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchQuery, dispatch]);

  // Xử lý xóa mềm
  const handleSoftDelete = (id: number) => {
    if (window.confirm('Bạn có chắc muốn ẩn lá bài này?')) {
      dispatch(softDeleteTarotCard(id));
    }
  };

  // Xử lý xóa cứng
  const handleHardDelete = (id: number) => {
    if (window.confirm('XÓA VĨNH VIỄN lá bài này? Hành động này không thể hoàn tác!')) {
      dispatch(hardDeleteTarotCard(id));
    }
  };

  if (loading && cards.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <span className="ml-3 text-lg">Đang tải danh sách bài Tarot...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-600 text-lg mb-4">Lỗi: {error}</p>
        <button 
          onClick={() => dispatch(fetchAllCards({ page, size: 10 }))}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý Bài Tarot</h2>
        <Link
          to="/admin/tarot/new"
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm mới</span>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm bài tarot..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên bài (EN)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên bài (VI)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Arcana
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Suit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cards.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                    Không có lá bài nào
                  </td>
                </tr>
              ) : (
                cards.map((tarot) => (
                  <tr key={tarot.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {tarot.cardNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tarot.nameEn}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {tarot.nameVi || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        tarot.arcana === 'MAJOR' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {tarot.arcana}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {tarot.suit || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        tarot.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {tarot.active ? 'Hoạt động' : 'Ẩn'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        to={`/admin/tarot/edit/${tarot.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Pencil className="w-4 h-4 inline" />
                      </Link>
                      <button 
                        onClick={() => handleSoftDelete(tarot.id)}
                        className="text-orange-600 hover:text-orange-900 mr-4"
                        title="Ẩn bài"
                      >
                        <EyeOff className="w-4 h-4 inline" />
                      </button>
                      <button 
                        onClick={() => handleHardDelete(tarot.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Xóa vĩnh viễn"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Hiển thị {(page * 10) + 1} đến {Math.min((page + 1) * 10, pagination.totalItems)} của {pagination.totalItems} kết quả
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(prev => Math.max(0, prev - 1))}
                disabled={page === 0 || loading}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              
              {[...Array(pagination.totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`px-3 py-1 rounded-md text-sm ${
                    i === page 
                      ? 'bg-blue-600 text-white' 
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setPage(prev => Math.min(pagination.totalPages - 1, prev + 1))}
                disabled={page === pagination.totalPages - 1 || loading}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}