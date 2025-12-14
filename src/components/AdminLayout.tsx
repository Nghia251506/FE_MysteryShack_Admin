import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Sparkles, Package, ShoppingCart, Menu, X } from 'lucide-react';

interface SubMenuItem {
  label: string;
  path: string;
}

interface MenuItem {
  icon: typeof LayoutDashboard;
  label: string;
  path: string;
  subItems?: SubMenuItem[];
}

const menuItems: MenuItem[] = [
  {
    icon: LayoutDashboard,
    label: 'Dashboard',
    path: '/admin',
  },
  {
    icon: Sparkles,
    label: 'Bài Tarot',
    path: '/admin/tarot',
    subItems: [
      { label: 'Danh sách', path: '/admin/tarot' },
      { label: 'Thêm mới', path: '/admin/tarot/new' },
    ],
  },
  {
    icon: Package,
    label: 'Sản phẩm',
    path: '/admin/products',
    subItems: [
      { label: 'Danh sách', path: '/admin/products' },
      { label: 'Thêm mới', path: '/admin/products/new' },
    ],
  },
  {
    icon: ShoppingCart,
    label: 'Đơn hàng',
    path: '/admin/orders',
    subItems: [
      { label: 'Danh sách', path: '/admin/orders' },
      { label: 'Thêm mới', path: '/admin/orders/new' },
    ],
  },
];

export default function AdminLayout() {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="hidden md:flex md:w-16 bg-gray-900 text-white flex-col relative z-10">
        <div className="h-16 flex items-center justify-center border-b border-gray-800">
          <Sparkles className="w-8 h-8 text-blue-400" />
        </div>

        <nav className="flex-1 py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <div
                key={item.path}
                className="relative"
                onMouseEnter={() => setHoveredItem(item.label)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Link
                  to={item.path}
                  className={`flex items-center justify-center h-14 hover:bg-gray-800 transition-colors ${
                    active ? 'bg-blue-600 hover:bg-blue-700' : ''
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </Link>

                {hoveredItem === item.label && (
                  <div className="absolute left-16 top-0 bg-gray-800 rounded-r-md shadow-lg py-2 min-w-[180px] animate-fadeIn">
                    <div className="px-4 py-2 font-medium border-b border-gray-700">
                      {item.label}
                    </div>
                    {item.subItems && (
                      <div className="py-1">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            className="block px-4 py-2 hover:bg-gray-700 transition-colors text-sm"
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <h1 className="text-xl font-semibold text-gray-800">Admin Panel</h1>

          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
              A
            </div>
          </div>
        </header>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200 shadow-lg">
            <nav className="py-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.path}>
                    <Link
                      to={item.path}
                      className="flex items-center space-x-3 px-6 py-3 hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                    {item.subItems && (
                      <div className="pl-14 bg-gray-50">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            className="block px-6 py-2 text-sm text-gray-600 hover:text-gray-900"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        )}

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
