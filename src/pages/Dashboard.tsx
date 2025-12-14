import { Sparkles, Package, ShoppingCart, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { icon: Sparkles, label: 'Bài Tarot', value: '78', color: 'bg-purple-500' },
    { icon: Package, label: 'Sản phẩm', value: '124', color: 'bg-blue-500' },
    { icon: ShoppingCart, label: 'Đơn hàng', value: '45', color: 'bg-green-500' },
    { icon: TrendingUp, label: 'Doanh thu', value: '₫12.5M', color: 'bg-orange-500' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Đơn hàng gần đây</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-gray-800">Đơn hàng #{1000 + i}</p>
                  <p className="text-sm text-gray-500">Khách hàng {i}</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  Hoàn thành
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Sản phẩm bán chạy</h3>
          <div className="space-y-3">
            {[
              'Bộ Tarot Rider Waite',
              'Bộ Tarot Thoth',
              'Sách Hướng dẫn Tarot',
              'Khăn trải bài Tarot',
              'Hộp đựng bài Tarot',
            ].map((product, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <p className="text-gray-800">{product}</p>
                <span className="text-sm font-medium text-gray-600">{45 - i * 5} đã bán</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
