import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Lock, User, Mail, UserCheck, Phone, Calendar } from 'lucide-react';

import { AppDispatch, RootState } from '@/store/store';
import { registerUser, resetError } from '@/store/features/authSlice';

// Schema giữ nguyên
const registerSchema = z.object({
  fullName: z.string().min(1, 'Vui lòng nhập họ tên'),
  username: z.string().min(3, 'Username tối thiểu 3 ký tự').max(50, 'Username tối đa 50 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().regex(/^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/, "SĐT không hợp lệ"),
  birthDate: z.string().refine((val) => val !== '', "Vui lòng chọn ngày sinh"),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Mật khẩu nhập lại không khớp",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => { return () => { dispatch(resetError()); }; }, [dispatch]);

  // --- XỬ LÝ SUBMIT ---
  const onSubmit = async (data: RegisterFormValues) => {
    const payload = {
      username: data.username,
      email: data.email,
      fullName: data.fullName,
      // QUAN TRỌNG: Đổi key thành passwordHash
      passwordHash: data.password, 
      phone: data.phone,
      birthDate: `${data.birthDate}T00:00:00Z`, 
      role: 'ADMIN'
    };

    try {
      await dispatch(registerUser(payload as any)).unwrap();
      alert("Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.");
      navigate('/login');
    } catch (err) {
      console.error("Đăng ký thất bại:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 relative overflow-hidden">
        {/* ... (Phần UI nền và trang trí giữ nguyên như cũ để tiết kiệm dòng) ... */}
        
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl w-full max-w-2xl shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500 to-orange-400 shadow-lg shadow-pink-500/30 mb-3">
            <UserCheck className="text-white w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Đăng Ký Quản Trị Viên</h1>
          <p className="text-slate-300 text-xs">Điền đầy đủ thông tin để tạo tài khoản Admin mới</p>
        </div>

        {error && (
          <div className="mb-5 p-3 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-2 text-red-200 text-xs animate-in slide-in-from-top-2">
            <span className="bg-red-500 w-1.5 h-1.5 rounded-full shrink-0"></span>{error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-300 uppercase ml-1">Họ và tên</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-4 w-4 text-slate-400" /></div>
                <input {...register('fullName')} placeholder="Nguyễn Văn A" className={`w-full pl-9 pr-3 py-3 bg-black/20 border ${errors.fullName ? 'border-red-500/50' : 'border-white/10'} rounded-xl text-white text-sm outline-none transition-all`} />
              </div>
              {errors.fullName && <p className="text-red-400 text-[10px] ml-1">{errors.fullName.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-300 uppercase ml-1">Tên đăng nhập</label>
               <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><UserCheck className="h-4 w-4 text-slate-400" /></div>
                <input {...register('username')} placeholder="username123" className={`w-full pl-9 pr-3 py-3 bg-black/20 border ${errors.username ? 'border-red-500/50' : 'border-white/10'} rounded-xl text-white text-sm outline-none transition-all`} />
              </div>
              {errors.username && <p className="text-red-400 text-[10px] ml-1">{errors.username.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
               <label className="text-[10px] font-bold text-slate-300 uppercase ml-1">Số điện thoại</label>
               <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Phone className="h-4 w-4 text-slate-400" /></div>
                  <input {...register('phone')} placeholder="09xxxxxxx" className={`w-full pl-9 pr-3 py-3 bg-black/20 border ${errors.phone ? 'border-red-500/50' : 'border-white/10'} rounded-xl text-white text-sm outline-none transition-all`} />
                </div>
                {errors.phone && <p className="text-red-400 text-[10px] ml-1">{errors.phone.message}</p>}
            </div>
            <div className="space-y-1">
               <label className="text-[10px] font-bold text-slate-300 uppercase ml-1">Ngày sinh</label>
               <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Calendar className="h-4 w-4 text-slate-400" /></div>
                  <input type="date" {...register('birthDate')} className={`w-full pl-9 pr-3 py-3 bg-black/20 border ${errors.birthDate ? 'border-red-500/50' : 'border-white/10'} rounded-xl text-white text-sm outline-none transition-all [color-scheme:dark]`} />
                </div>
                {errors.birthDate && <p className="text-red-400 text-[10px] ml-1">{errors.birthDate.message}</p>}
            </div>
          </div>

          <div className="space-y-1">
             <label className="text-[10px] font-bold text-slate-300 uppercase ml-1">Email</label>
             <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-4 w-4 text-slate-400" /></div>
                <input {...register('email')} placeholder="example@email.com" className={`w-full pl-9 pr-3 py-3 bg-black/20 border ${errors.email ? 'border-red-500/50' : 'border-white/10'} rounded-xl text-white text-sm outline-none transition-all`} />
              </div>
              {errors.email && <p className="text-red-400 text-[10px] ml-1">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-300 uppercase ml-1">Mật khẩu</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-4 w-4 text-slate-400" /></div>
                  <input type={showPassword ? "text" : "password"} {...register('password')} placeholder="••••••••" className={`w-full pl-9 pr-8 py-3 bg-black/20 border ${errors.password ? 'border-red-500/50' : 'border-white/10'} rounded-xl text-white text-sm outline-none transition-all`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-white">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
                {errors.password && <p className="text-red-400 text-[10px] ml-1">{errors.password.message}</p>}
             </div>
             <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-300 uppercase ml-1">Nhập lại mật khẩu</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-4 w-4 text-slate-400" /></div>
                  <input type={showConfirmPassword ? "text" : "password"} {...register('confirmPassword')} placeholder="••••••••" className={`w-full pl-9 pr-8 py-3 bg-black/20 border ${errors.confirmPassword ? 'border-red-500/50' : 'border-white/10'} rounded-xl text-white text-sm outline-none transition-all`} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-white">{showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
                {errors.confirmPassword && <p className="text-red-400 text-[10px] ml-1">{errors.confirmPassword.message}</p>}
             </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3.5 mt-2 bg-gradient-to-r from-pink-600 to-orange-500 hover:from-pink-500 hover:to-orange-400 text-white font-bold rounded-xl shadow-lg shadow-pink-600/30 transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="animate-spin" size={18} /> Đang xử lý...</> : 'Đăng Ký Tài Khoản'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-slate-400 text-xs">Đã có tài khoản? <Link to="/login" className="font-bold text-white hover:text-pink-400 transition-colors">Đăng nhập ngay</Link></p>
        </div>
      </div>
    </div>
  );
}