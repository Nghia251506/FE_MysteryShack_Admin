import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// --- 1. Components & Layout ---
import AdminLayout from './components/AdminLayout'; 
import PrivateRoute from './components/common/PrivateRoute'; 

// --- 2. Auth Pages ---
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// --- 3. CÁC TRANG ADMIN SYSTEM (MỚI) ---
import Dashboard from './pages/admin/Dashboard'; 
import UserManagement from './pages/admin/UserManagement'; 
import ReaderManagement from './pages/admin/ReaderManagement';
import SessionMonitoring from './pages/admin/SessionMonitoring';
import ServicePackageManagement from './pages/admin/ServicePackageManagement';
import RevenueReport from './pages/admin/RevenueReport';
import ContentManagement from './pages/admin/ContentManagement';
import NotificationCenter from './pages/admin/NotificationCenter'; 
import SystemSettings from './pages/admin/SystemSettings'; 
import SystemConfig from './pages/admin/SystemConfig';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- A. PUBLIC ROUTES --- */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Redirect trang chủ về Dashboard */}
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

        {/* --- B. PROTECTED ROUTES (ADMIN ONLY) --- */}
        <Route 
          path="/admin" 
          element={
            <PrivateRoute requiredRole="ADMIN">
              <AdminLayout />
            </PrivateRoute>
          }
        >
          {/* Route mặc định vào dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} /> 
          
          {/* Module Quản trị Hệ Thống */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="readers" element={<ReaderManagement />} />
          <Route path="sessions" element={<SessionMonitoring />} />
          <Route path="packages" element={<ServicePackageManagement />} />
          <Route path="revenue" element={<RevenueReport />} />
          <Route path="content" element={<ContentManagement />} />
          <Route path="notifications" element={<NotificationCenter />} />
          <Route path="settings" element={<SystemSettings />} />
          <Route path="config" element={<SystemConfig />} /> 
          
        </Route>
        
        {/* Route 404 */}
        <Route path="*" element={
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-slate-600">
            <h1 className="text-6xl font-bold mb-4">404</h1>
            <p className="text-xl">Trang bạn tìm kiếm không tồn tại.</p>
            <a href="/" className="mt-4 text-purple-600 hover:underline">Về trang chủ</a>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;