// @ts-nocheck
import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Sparkles, Menu, X, Users, BookOpen, 
  Activity, Layers, BarChart3, FileText, Bell, Settings, Sliders,
  ChevronLeft, ChevronRight // Đã thêm
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Tổng quan', path: '/admin/dashboard' },
  { icon: Users, label: 'Quản lý Người dùng', path: '/admin/users' },
  { icon: BookOpen, label: 'Quản lý Reader', path: '/admin/readers' },
  { icon: Activity, label: 'Giám sát phiên', path: '/admin/sessions' },
  { icon: Layers, label: 'Quản lý Gói dịch vụ', path: '/admin/packages' },
  { icon: BarChart3, label: 'Báo cáo doanh thu', path: '/admin/revenue' },
  { icon: FileText, label: 'Quản lý nội dung', path: '/admin/content' },
  { icon: Bell, label: 'Thông báo', path: '/admin/notifications' },
  { icon: Settings, label: 'Cài đặt hệ thống', path: '/admin/settings' },
  { icon: Sliders, label: 'Cấu hình vận hành', path: '/admin/config' },
];

export default function AdminLayout() {
  const [isExpanded, setIsExpanded] = useState(true); // Biến gây lỗi trắng màn hình đã được fix
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
      <aside 
        className={`hidden md:flex flex-col bg-slate-900 text-white relative z-20 shadow-xl transition-all duration-300 ${
          isExpanded ? 'w-64' : 'w-20'
        }`}
      >
        {/* LOGO SECTION */}
        <div className="h-16 flex items-center px-4 border-b border-slate-800 bg-slate-950 overflow-hidden">
          <Sparkles className="w-8 h-8 text-purple-500 flex-shrink-0" />
          {isExpanded && (
            <span className="ml-3 font-bold text-lg whitespace-nowrap bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Tarot Admin
            </span>
          )}
        </div>

        {/* MENU ITEMS */}
        <nav className="flex-1 py-4 flex flex-col gap-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center h-12 mx-3 rounded-xl transition-all duration-200 group ${
                  active 
                    ? 'bg-purple-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                } ${!isExpanded ? 'justify-center' : 'px-3'}`}
                title={!isExpanded ? item.label : ""}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {isExpanded && (
                  <span className="ml-3 font-medium text-sm whitespace-nowrap overflow-hidden">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        
        {/* NÚT TOGGLE CỐ ĐỊNH */}
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute -right-3 top-20 bg-purple-600 text-white rounded-full p-1 border-2 border-slate-900 hover:bg-purple-500 transition-colors z-50"
        >
          {isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        <div className={`p-4 border-t border-slate-800 flex items-center ${!isExpanded ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 border-2 border-slate-900 flex-shrink-0"></div>
            {isExpanded && (
              <div className="ml-3 overflow-hidden">
                <p className="text-xs font-medium truncate">Admin User</p>
                <p className="text-[10px] text-slate-500 truncate">Super Admin</p>
              </div>
            )}
        </div>
      </aside>

      {/* MAIN CONTENT */}
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
          
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold border border-purple-200">A</div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50/50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}