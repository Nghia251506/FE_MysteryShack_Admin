import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

interface PrivateRouteProps {
  children?: React.ReactNode;
  requiredRole?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  // 1. Chưa đăng nhập -> Đá về Login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Check Role (CHỈ CHECK NẾU CÓ TRUYỀN requiredRole)
  // Nếu bên App.tsx không truyền requiredRole thì đoạn này sẽ được bỏ qua -> Cho phép tất cả
  if (requiredRole && user?.role !== requiredRole) {
    alert("Bạn không có quyền truy cập!");
    return <Navigate to="/login" replace />;
  }

  // 3. Hợp lệ -> Cho vào
  return children ? <>{children}</> : <Outlet />;
};

export default PrivateRoute;