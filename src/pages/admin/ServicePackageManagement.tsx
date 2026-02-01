import React, { useState } from 'react';
import { 
  Plus, Edit, Trash2, Package, CheckCircle, 
  ShoppingCart, DollarSign, X, AlertCircle, 
  Power, RefreshCcw, PauseCircle, PlayCircle
} from 'lucide-react';

// --- 1. INTERFACES ---
interface ServicePackage {
  id: string;
  name: string;
  turns: number | 'Unlimited'; // Số lượt
  price: number; // Giá gốc (chưa VAT)
  duration: number; // Thời hạn (ngày)
  soldCount: number;
  description: string;
  status: 'Active' | 'Inactive';
}

// --- 2. MOCK DATA (Cập nhật theo yêu cầu: Chỉ 1 gói 500k/10 lượt) ---
const INITIAL_PACKAGES: ServicePackage[] = [
  {
    id: 'PKG001', 
    name: 'Gói 10 lượt', 
    turns: 10, 
    price: 500000, 
    duration: 30, 
    soldCount: 15, 
    status: 'Active',
    description: 'Gói tiêu chuẩn: 500k/10 lượt (+VAT)'
  }
];

// --- 3. COMPONENTS ---

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

// --- 4. MAIN PAGE ---
export default function ServicePackageManagement() {
  const [packages, setPackages] = useState<ServicePackage[]>(INITIAL_PACKAGES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<ServicePackage | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '', turns: '', price: '', duration: '', description: ''
  });

  // Format Currency
  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  // Handlers
  const handleOpenModal = (pkg?: ServicePackage) => {
    if (pkg) {
      setEditingPkg(pkg);
      setFormData({
        name: pkg.name,
        turns: pkg.turns.toString(),
        price: pkg.price.toString(),
        duration: pkg.duration.toString(),
        description: pkg.description
      });
    } else {
      setEditingPkg(null);
      setFormData({ name: '', turns: '', price: '', duration: '30', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.price) return alert("Vui lòng nhập đủ thông tin!");

    const newPkg: ServicePackage = {
      id: editingPkg ? editingPkg.id : `PKG00${packages.length + 1}`,
      name: formData.name,
      turns: formData.turns === 'Unlimited' ? 'Unlimited' : Number(formData.turns),
      price: Number(formData.price),
      duration: Number(formData.duration),
      soldCount: editingPkg ? editingPkg.soldCount : 0,
      status: editingPkg ? editingPkg.status : 'Active',
      description: formData.description
    };

    if (editingPkg) {
      setPackages(packages.map(p => p.id === editingPkg.id ? newPkg : p));
    } else {
      setPackages([...packages, newPkg]);
    }
    setIsModalOpen(false);
  };

  const toggleStatus = (id: string) => {
    setPackages(packages.map(p => p.id === id ? { ...p, status: p.status === 'Active' ? 'Inactive' : 'Active' } : p));
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa gói này?")) {
      setPackages(packages.filter(p => p.id !== id));
    }
  };

  // Tính tổng doanh thu ước tính (Giá thực thu bao gồm VAT nếu cần, ở đây tính giá gốc)
  const totalRevenue = packages.reduce((acc, curr) => acc + (curr.price * curr.soldCount), 0);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 animate-fade-in-up font-sans text-slate-800 p-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-indigo-600">
            Quản lý gói dịch vụ
          </h1>
          <p className="text-sm text-gray-500 mt-1">Quản lý các gói nạp lượt xem cho khách hàng</p>
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
        <StatCard icon={Package} label="Tổng số gói" value={packages.length} color="bg-emerald-50 text-emerald-600" />
        <StatCard icon={CheckCircle} label="Đang bán" value={packages.filter(p => p.status === 'Active').length} color="bg-blue-50 text-blue-600" />
        <StatCard icon={ShoppingCart} label="Đã bán (Lượt)" value={packages.reduce((acc, p) => acc + p.soldCount, 0)} color="bg-purple-50 text-purple-600" />
        <StatCard icon={DollarSign} label="Doanh thu (Gốc)" value={formatCurrency(totalRevenue)} color="bg-amber-50 text-amber-600" />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs font-bold text-gray-500 uppercase border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Tên gói</th>
                <th className="px-6 py-4">Số lượt</th>
                <th className="px-6 py-4">Giá gốc</th>
                <th className="px-6 py-4">Giá (+VAT 10%)</th>
                <th className="px-6 py-4">Thời hạn</th>
                <th className="px-6 py-4">Đã bán</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {packages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 text-xs font-mono text-gray-500">{pkg.id}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">{pkg.name}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[200px]">{pkg.description}</p>
                  </td>
                  <td className="px-6 py-4 font-bold text-purple-600">
                    {pkg.turns === 'Unlimited' ? 'Không giới hạn' : `${pkg.turns} lượt`}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-600">{formatCurrency(pkg.price)}</td>
                  {/* Logic VAT: Giá gốc * 1.1 */}
                  <td className="px-6 py-4 font-bold text-emerald-600 bg-emerald-50/30">{formatCurrency(pkg.price * 1.1)}</td>
                  <td className="px-6 py-4 text-sm">{pkg.duration} ngày</td>
                  <td className="px-6 py-4 text-sm font-bold">{pkg.soldCount}</td>
                  <td className="px-6 py-4"><StatusBadge status={pkg.status} /></td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenModal(pkg)} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"><Edit size={16}/></button>
                      <button onClick={() => toggleStatus(pkg.id)} className={`p-2 rounded-lg transition-colors ${pkg.status === 'Active' ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'}`}>
                         {pkg.status === 'Active' ? <PauseCircle size={16}/> : <PlayCircle size={16}/>}
                      </button>
                      <button onClick={() => handleDelete(pkg.id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL ADD/EDIT --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <h3 className="text-xl font-bold text-slate-800">{editingPkg ? 'Chỉnh sửa gói' : 'Thêm gói mới'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-gray-200 p-2 rounded-full transition-colors"><X size={20}/></button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Tên gói <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="VD: Gói 10 lượt"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Số lượt</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    placeholder="10"
                    value={formData.turns}
                    onChange={e => setFormData({...formData, turns: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Giá gốc (VNĐ) <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-700 transition-all"
                    placeholder="500000"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                  />
                </div>
              </div>

              {/* VAT CALCULATION PREVIEW */}
              {formData.price && (
                  <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                      <div className="bg-purple-100 p-2 rounded-lg"><AlertCircle size={20} className="text-purple-600"/></div>
                      <div className="flex-1">
                          <p className="text-xs text-purple-600 font-bold uppercase mb-1">Thông tin thanh toán</p>
                          <div className="flex justify-between text-sm text-slate-600 mb-1">
                              <span>Giá gốc:</span>
                              <b>{formatCurrency(Number(formData.price))}</b>
                          </div>
                          <div className="flex justify-between text-sm text-slate-600">
                              <span>VAT (10%):</span>
                              <b>{formatCurrency(Number(formData.price) * 0.1)}</b>
                          </div>
                          <div className="mt-2 pt-2 border-t border-purple-200 flex justify-between items-center">
                              <span className="text-sm font-medium text-purple-800">Tổng khách trả:</span>
                              <span className="text-lg font-black text-purple-700">{formatCurrency(Number(formData.price) * 1.1)}</span>
                          </div>
                      </div>
                  </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Thời hạn (ngày)</label>
                    <input 
                      type="number" 
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                      value={formData.duration}
                      onChange={e => setFormData({...formData, duration: e.target.value})}
                    />
                  </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Mô tả ngắn</label>
                <textarea 
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none h-24 transition-all"
                  placeholder="Mô tả lợi ích của gói..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-500 font-bold hover:bg-gray-200 rounded-xl transition-colors">Hủy</button>
              <button onClick={handleSave} className="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-colors">
                {editingPkg ? 'Cập nhật gói' : 'Thêm gói ngay'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}