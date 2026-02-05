import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Package, CheckCircle, 
  ShoppingCart, DollarSign, X, AlertCircle, 
  PauseCircle, PlayCircle, Loader2
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppRedux'; // Giả định đường dẫn hook của ông
import { 
  fetchAllVipPackages, 
  fetchVipSummary, 
  toggleVipStatus, 
  createVipPackage, 
  deleteVipPackage 
} from '../../store/features/vipPackageSlice';
import { AdminVipPackage } from '@/types/admin';

// --- COMPONENTS ---
const StatCard = ({ icon: Icon, label, value, color }: any) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`p-4 rounded-xl ${color}`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
    </div>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  return status === 'Active' 
    ? <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100 flex items-center gap-1 w-fit"><CheckCircle size={12}/> Đang bán</span>
    : <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-bold border border-gray-200 flex items-center gap-1 w-fit"><PauseCircle size={12}/> Ngừng bán</span>;
};

export default function ServicePackageManagement() {
  const dispatch = useAppDispatch();
  const { packages, summary, loading } = useAppSelector((state) => state.adminVipPackage);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<AdminVipPackage | null>(null);

  // Form State theo DTO
  const [formData, setFormData] = useState({
    name: '',
    maxJobsPerDay: '',
    price: '',
    durationDays: '',
    benefits: ''
  });

  useEffect(() => {
    dispatch(fetchAllVipPackages());
    dispatch(fetchVipSummary());
  }, [dispatch]);

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const handleOpenModal = (pkg?: AdminVipPackage) => {
    if (pkg) {
      setEditingPkg(pkg);
      setFormData({
        name: pkg.name,
        maxJobsPerDay: pkg.maxJobsPerDay.toString(),
        price: pkg.price.toString(),
        durationDays: pkg.durationDays.toString(),
        benefits: pkg.benefits
      });
    } else {
      setEditingPkg(null);
      setFormData({ name: '', maxJobsPerDay: '', price: '', durationDays: '30', benefits: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price) return alert("Vui lòng nhập đủ thông tin!");

    const payload = {
      name: formData.name,
      maxJobsPerDay: Number(formData.maxJobsPerDay),
      price: Number(formData.price),
      durationDays: Number(formData.durationDays),
      benefits: formData.benefits
    };

    if (editingPkg) {
      // Gọi API update ở đây (ông có thể thêm thunk update vào slice tương tự create)
      // Tạm thời tôi để logic thêm mới, ông bổ sung thunk update nhé
      alert("Tính năng cập nhật đang được đồng bộ!");
    } else {
      await dispatch(createVipPackage(payload as any));
    }
    setIsModalOpen(false);
  };

  const handleToggleStatus = (id: number) => {
    dispatch(toggleVipStatus(id));
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa gói này?")) {
      dispatch(deleteVipPackage(id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 p-6 font-sans text-slate-800">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-indigo-600">
            Quản lý gói VIP
          </h1>
          <p className="text-sm text-gray-500 mt-1">Hệ thống quản lý gói dịch vụ nhận phiên trải bài</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center gap-2"
        >
          <Plus size={18} /> Thêm gói mới
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={Package} label="Tổng số gói" value={summary?.totalPackages || 0} color="bg-emerald-50 text-emerald-600" />
        <StatCard icon={CheckCircle} label="Đang bán" value={summary?.activePackages || 0} color="bg-blue-50 text-blue-600" />
        <StatCard icon={ShoppingCart} label="Đã bán (Gói)" value={summary?.totalSoldCount || 0} color="bg-purple-50 text-purple-600" />
        <StatCard icon={DollarSign} label="Doanh thu" value={formatCurrency(summary?.totalRevenue || 0)} color="bg-amber-50 text-amber-600" />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs font-bold text-gray-500 uppercase border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Tên gói</th>
                <th className="px-6 py-4">Phiên/tháng</th>
                <th className="px-6 py-4">Giá gốc</th>
                <th className="px-6 py-4">Giá (+10% VAT)</th>
                <th className="px-6 py-4">Thời hạn</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {packages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 text-xs font-mono text-gray-400">#{pkg.id}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">{pkg.name}</p>
                    <p className="text-xs text-gray-400 truncate max-w-[200px]">{pkg.benefits}</p>
                  </td>
                  <td className="px-6 py-4 font-bold text-purple-600">
                    {pkg.maxJobsPerDay === -1 ? 'Không giới hạn' : `${pkg.maxJobsPerDay} phiên`}
                  </td>
                  <td className="px-6 py-4 font-medium">{formatCurrency(pkg.price)}</td>
                  <td className="px-6 py-4 font-bold text-emerald-600 bg-emerald-50/30">
                    {formatCurrency(Number(pkg.price) * 1.1)}
                  </td>
                  <td className="px-6 py-4 text-sm">{pkg.durationDays} ngày</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleOpenModal(pkg)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg"><Edit size={16}/></button>
                      <button 
                        onClick={() => handleToggleStatus(pkg.id)} 
                        className={`p-2 rounded-lg ${pkg.status === 'Active' ? 'text-amber-600 bg-amber-50' : 'text-emerald-600 bg-emerald-50'}`}
                      >
                         {pkg.status === 'Active' ? <PauseCircle size={16}/> : <PlayCircle size={16}/>}
                      </button>
                      <button onClick={() => handleDelete(pkg.id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <h3 className="text-xl font-bold">{editingPkg ? 'Chỉnh sửa gói' : 'Thêm gói mới'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-gray-200 p-2 rounded-full"><X size={20}/></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Tên gói</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border rounded-xl"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Số phiên/tháng (-1 = Unlim)</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2 border rounded-xl"
                    value={formData.maxJobsPerDay}
                    onChange={e => setFormData({...formData, maxJobsPerDay: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Giá gốc (VNĐ)</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2 border rounded-xl"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                  />
                </div>
              </div>

              {formData.price && (
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Tổng thanh toán (gồm 10% VAT):</span>
                    <span className="font-bold text-purple-700">{formatCurrency(Number(formData.price) * 1.1)}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold mb-1">Thời hạn (ngày)</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-2 border rounded-xl"
                  value={formData.durationDays}
                  onChange={e => setFormData({...formData, durationDays: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Lợi ích/Mô tả</label>
                <textarea 
                  className="w-full px-4 py-2 border rounded-xl h-24"
                  value={formData.benefits}
                  onChange={e => setFormData({...formData, benefits: e.target.value})}
                ></textarea>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-gray-500 font-bold">Hủy</button>
              <button onClick={handleSave} className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl">
                {editingPkg ? 'Cập nhật' : 'Thêm ngay'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}