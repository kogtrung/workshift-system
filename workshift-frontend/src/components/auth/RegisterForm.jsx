import { Link } from 'react-router-dom'

export function RegisterForm({
  fullName, setFullName,
  username, setUsername,
  email, setEmail,
  phone, setPhone,
  password, setPassword,
  confirmPassword, setConfirmPassword,
  canSubmit, isSubmitting,
  onSubmit,
}) {
  return (
    <form className="space-y-6 relative z-10" onSubmit={onSubmit}>
      <div className="group">
        <label className="block text-[11px] font-medium text-on-surface-variant uppercase tracking-wider mb-1.5 ml-1">Họ và tên</label>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">person</span>
          <input className="w-full pl-10 pr-4 py-3 bg-surface-container-low border-b border-outline/20 rounded-xl focus:outline-none focus:border-primary transition-all duration-300 placeholder:text-outline/50 text-on-surface" placeholder="Nguyễn Văn A" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" />
        </div>
      </div>

      <div className="group">
        <label className="block text-[11px] font-medium text-on-surface-variant uppercase tracking-wider mb-1.5 ml-1">Tên đăng nhập</label>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">badge</span>
          <input className="w-full pl-10 pr-4 py-3 bg-surface-container-low border-b border-outline/20 rounded-xl focus:outline-none focus:border-primary transition-all duration-300 placeholder:text-outline/50 text-on-surface" placeholder="ten.dang.nhap" type="text" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
        </div>
      </div>

      <div className="group">
        <label className="block text-[11px] font-medium text-on-surface-variant uppercase tracking-wider mb-1.5 ml-1">Email</label>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">mail</span>
          <input className="w-full pl-10 pr-4 py-3 bg-surface-container-low border-b border-outline/20 rounded-xl focus:outline-none focus:border-primary transition-all duration-300 placeholder:text-outline/50 text-on-surface" placeholder="name@domain.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </div>
      </div>

      <div className="group">
        <label className="block text-[11px] font-medium text-on-surface-variant uppercase tracking-wider mb-1.5 ml-1">Số điện thoại (tuỳ chọn)</label>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">call</span>
          <input className="w-full pl-10 pr-4 py-3 bg-surface-container-low border-b border-outline/20 rounded-xl focus:outline-none focus:border-primary transition-all duration-300 placeholder:text-outline/50 text-on-surface" placeholder="0123456789" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
        </div>
      </div>

      <div className="group">
        <label className="block text-[11px] font-medium text-on-surface-variant uppercase tracking-wider mb-1.5 ml-1">Mật khẩu</label>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">lock</span>
          <input className="w-full pl-10 pr-4 py-3 bg-surface-container-low border-b border-outline/20 rounded-xl focus:outline-none focus:border-primary transition-all duration-300 placeholder:text-outline/50 text-on-surface" placeholder="••••••••" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
        </div>
      </div>

      <div className="group">
        <label className="block text-[11px] font-medium text-on-surface-variant uppercase tracking-wider mb-1.5 ml-1">Nhập lại mật khẩu</label>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">verified_user</span>
          <input className="w-full pl-10 pr-4 py-3 bg-surface-container-low border-b border-outline/20 rounded-xl focus:outline-none focus:border-primary transition-all duration-300 placeholder:text-outline/50 text-on-surface" placeholder="••••••••" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />
        </div>
      </div>

      <div className="pt-4">
        <button className="w-full py-4 bg-gradient-to-r from-primary to-primary-dim text-on-primary font-bold rounded-xl shadow-[0_8px_16px_rgba(0,83,219,0.2)] hover:shadow-[0_12px_24px_rgba(0,83,219,0.3)] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed" type="submit" disabled={!canSubmit}>
          {isSubmitting ? 'Đang tạo...' : 'Tạo tài khoản'}
        </button>
      </div>

      <div className="text-center pt-2">
        <p className="text-on-surface-variant text-sm">
          Bạn đã có tài khoản?
          <Link className="text-primary font-semibold hover:underline decoration-2 underline-offset-4 ml-1" to="/auth/login">Đăng nhập</Link>
        </p>
      </div>
    </form>
  )
}
