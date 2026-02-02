import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Lock, User } from 'lucide-react';

import { AppDispatch, RootState } from '@/store/store';
import { loginUser, resetError } from '@/store/features/authSlice';

// Schema Validate Form (Vẫn dùng tên 'password' cho input HTML)
const loginSchema = z.object({
  username: z.string().min(1, 'Vui lòng nhập tên đăng nhập'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
    return () => { dispatch(resetError()); };
  }, [isAuthenticated, navigate, dispatch]);

  // --- XỬ LÝ SUBMIT ---
  const onSubmit = async (data: LoginFormValues) => {
    await dispatch(loginUser({
      username: data.username,
      // QUAN TRỌNG: Map input 'password' -> 'passwordHash'
      passwordHash: data.password 
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>
      </div>

      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl w-full max-w-md shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30 mb-4">
            <Lock className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Chào mừng trở lại</h1>
          <p className="text-slate-300 text-sm">Đăng nhập vào hệ thống quản trị Mystic Tarot</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-200 text-sm animate-in slide-in-from-top-2">
            <span className="bg-red-500 w-1.5 h-1.5 rounded-full shrink-0"></span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase ml-1">Tên đăng nhập</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
              </div>
              <input
                {...register('username')}
                type="text"
                placeholder="Nhập username..."
                className={`w-full pl-11 pr-4 py-3.5 bg-black/20 border ${errors.username ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-purple-500/50'} rounded-xl text-white placeholder-slate-500 outline-none focus:ring-4 focus:ring-purple-500/10 transition-all`}
              />
            </div>
            {errors.username && <p className="text-red-400 text-xs ml-1 font-medium">{errors.username.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase ml-1">Mật khẩu</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-purple-400 transition-colors" />
              </div>
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`w-full pl-11 pr-12 py-3.5 bg-black/20 border ${errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-purple-500/50'} rounded-xl text-white placeholder-slate-500 outline-none focus:ring-4 focus:ring-purple-500/10 transition-all`}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition-colors">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-xs ml-1 font-medium">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg shadow-purple-600/30 transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="animate-spin" size={20} /> Đang xử lý...</> : 'Đăng Nhập'}
          </button>
        </form>
        <div className="mt-8 text-center">
          <p className="text-slate-400 text-sm">
            Chưa có tài khoản? <Link to="/register" className="font-bold text-white hover:text-purple-400 transition-colors">Đăng ký ngay</Link>
          </p>
        </div>
      </div>
    </div>
  );
}