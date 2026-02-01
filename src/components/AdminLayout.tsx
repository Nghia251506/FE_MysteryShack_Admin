// @ts-nocheck
import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Sparkles, 
  Package, 
  ShoppingCart, 
  Menu, 
  X,
  Users,       // User
  BookOpen,    // Reader
  Activity,    // Session
  Layers,      // Package
  BarChart3,   // Revenue
  FileText,    // Content
  Bell,        // Notification
  Settings,    // System Settings (Admin Account)
  Sliders      // System Config (Timeout/Tarot)
} from 'lucide-react';

const menuItems = [
  // --- A. QUẢN TRỊ HỆ THỐNG (MỚI) ---
  {
    icon: LayoutDashboard,
    label: 'Tổng quan',
    path: '/admin/dashboard',
  },
  {
    icon: Users,
    label: 'Quản lý Người dùng',
    path: '/admin/users',
  },
  {
    icon: BookOpen,
    label: 'Quản lý Reader',
    path: '/admin/readers',
  },
  {
    icon: Activity,
    label: 'Giám sát phiên',
    path: '/admin/sessions',
  },
  {
    icon: Layers,
    label: 'Quản lý Gói dịch vụ',
    path: '/admin/packages',
  },
  {
    icon: BarChart3,
    label: 'Báo cáo doanh thu',
    path: '/admin/revenue',
  },
  {
    icon: FileText,
    label: 'Quản lý nội dung',
    path: '/admin/content',
  },
  {
    icon: Bell,
    label: 'Trung tâm thông báo',
    path: '/admin/notifications',
  },
  {
    icon: Settings,
    label: 'Cài đặt hệ thống', // Quản lý tài khoản Admin & Logs
    path: '/admin/settings',
  },
  {
    icon: Sliders,
    label: 'Cấu hình vận hành', // Cấu hình Time-out, Chủ đề, Bài Tarot
    path: '/admin/config',
  },

  // --- B. QUẢN LÝ CỬA HÀNG (CŨ) ---
  {
    icon: Sparkles,
    label: 'Bài Tarot (Shop)',
    path: '/admin/tarot',
    subItems: [
      { label: 'Danh sách', path: '/admin/tarot' },
      { label: 'Thêm mới', path: '/admin/tarot/new' },
    ],
  },
  {
    icon: Package,
    label: 'Sản phẩm Shop',
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
  const [hoveredItem, setHoveredItem] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/admin/dashboard') {
      return location.pathname === '/admin' || location.pathname === '/admin/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* SIDEBAR */}
      <aside className="hidden md:flex md:w-16 bg-slate-900 text-white flex-col relative z-20 shadow-xl">
        <div className="h-16 flex items-center justify-center border-b border-slate-800 bg-slate-950">
          <Sparkles className="w-8 h-8 text-purple-500 animate-pulse" />
        </div>

        <nav className="flex-1 py-4 flex flex-col gap-2 overflow-y-auto scrollbar-hide">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <div
                key={item.path}
                className="relative group"
                onMouseEnter={() => setHoveredItem(item.label)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Link
                  to={item.path}
                  className={`flex items-center justify-center h-12 mx-2 rounded-xl transition-all duration-200 ${
                    active 
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </Link>

                {hoveredItem === item.label && (
                  <div className="absolute left-14 top-0 ml-4 bg-slate-800 text-white rounded-lg shadow-xl py-2 min-w-[180px] z-50 border border-slate-700 animate-in fade-in slide-in-from-left-2 duration-200">
                    <div className="px-4 py-2 font-medium border-b border-slate-700 text-purple-300">
                      {item.label}
                    </div>
                    {item.subItems && (
                      <div className="py-1">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            className="block px-4 py-2 hover:bg-slate-700 hover:text-purple-300 transition-colors text-sm"
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
        
        <div className="p-4 border-t border-slate-800 flex justify-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 border-2 border-slate-900"></div>
        </div>
      </aside>

      {/* CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-600"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Tarot Admin Panel
          </h1>

          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-700">Admin User</p>
                <p className="text-xs text-gray-500">Super Admin</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold border border-purple-200">A</div>
          </div>
        </header>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200 shadow-lg absolute top-16 left-0 w-full z-20 animate-in slide-in-from-top-2">
            <nav className="py-2 max-h-[calc(100vh-4rem)] overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <div key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center space-x-3 px-6 py-3 border-l-4 transition-colors ${
                          active ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-transparent text-gray-600 hover:bg-gray-50'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                    {item.subItems && (
                      <div className="pl-14 bg-gray-50 border-t border-gray-100">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            className="block px-6 py-3 text-sm text-gray-500 hover:text-purple-600 hover:bg-gray-100"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            • {subItem.label}
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

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50/50 p-6 scroll-smooth">
          <Outlet />
        </main>
      </div>
    </div>
  );
}