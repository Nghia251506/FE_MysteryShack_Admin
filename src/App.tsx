import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// 1. Layout
import AdminLayout from './components/AdminLayout'; 

// --- A. CÁC TRANG ADMIN MỚI (SYSTEM) ---
import Dashboard from './pages/admin/Dashboard'; 
import UserManagement from './pages/admin/UserManagement'; 
import ReaderManagement from './pages/admin/ReaderManagement';
import SessionMonitoring from './pages/admin/SessionMonitoring';
import ServicePackageManagement from './pages/admin/ServicePackageManagement';
import RevenueReport from './pages/admin/RevenueReport';
import ContentManagement from './pages/admin/ContentManagement';
import NotificationCenter from './pages/admin/NotificationCenter'; 
import SystemSettings from './pages/admin/SystemSettings'; // Cài đặt Admin
import SystemConfig from './pages/admin/SystemConfig';     // <-- MỚI: Cấu hình vận hành (Time-out, Tarot...)

// --- B. CÁC TRANG CŨ (SHOP/TAROT) ---
import TarotList from './pages/tarot/TarotList';
import TarotForm from './pages/tarot/TarotForm';
import ProductList from './pages/products/ProductList';
import ProductForm from './pages/products/ProductForm';
import OrderList from './pages/orders/OrderList';
import OrderForm from './pages/orders/OrderForm';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect trang chủ về Dashboard */}
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

        {/* ADMIN ROUTES */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} /> 
          
          {/* 1. Module Hệ Thống (Mới) */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="readers" element={<ReaderManagement />} />
          <Route path="sessions" element={<SessionMonitoring />} />
          <Route path="packages" element={<ServicePackageManagement />} />
          <Route path="revenue" element={<RevenueReport />} />
          <Route path="content" element={<ContentManagement />} />
          <Route path="notifications" element={<NotificationCenter />} />
          <Route path="settings" element={<SystemSettings />} />
          
          {/* --- ROUTE MỚI THÊM --- */}
          <Route path="config" element={<SystemConfig />} /> 
          {/* ----------------------- */}

          {/* 2. Module Cửa Hàng (Cũ) */}
          <Route path="tarot" element={<TarotList />} />
          <Route path="tarot/new" element={<TarotForm />} />
          <Route path="tarot/edit/:id" element={<TarotForm />} />
          
          <Route path="products" element={<ProductList />} />
          <Route path="products/new" element={<ProductForm />} />
          
          <Route path="orders" element={<OrderList />} />
          <Route path="orders/new" element={<OrderForm />} />
          
        </Route>
        
        {/* Route 404 */}
        <Route path="*" element={<div className="p-10 text-center">404 - Trang không tồn tại</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;