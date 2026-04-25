import { Link } from 'react-router-dom'

export function LoginForm({
  usernameOrEmail, setUsernameOrEmail,
  password, setPassword,
  remember, setRemember,
  showPassword, setShowPassword,
  canSubmit, isSubmitting,
  onSubmit,
}) {
  return (
    <>
      <form className="space-y-6" onSubmit={onSubmit}>
        <div className="space-y-1.5 group">
          <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-0.5" htmlFor="usernameOrEmail">Email / Tên đăng nhập</label>
          <div className="soft-inset bg-surface-container-low flex items-center px-1">
            <span className="material-symbols-outlined text-on-surface-variant/60 px-2 text-xl">alternate_email</span>
            <input className="w-full bg-transparent border-none focus:ring-0 py-3 text-on-surface placeholder:text-on-surface-variant/40 font-medium" id="usernameOrEmail" placeholder="name@domain.com" type="text" value={usernameOrEmail} onChange={(e) => setUsernameOrEmail(e.target.value)} autoComplete="username" />
          </div>
        </div>

        <div className="space-y-1.5 group">
          <div className="flex justify-between items-end">
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-0.5" htmlFor="password">Mật khẩu</label>
            <button className="text-xs font-bold text-primary hover:text-primary-dim transition-colors" type="button">Quên mật khẩu?</button>
          </div>
          <div className="soft-inset bg-surface-container-low flex items-center px-1">
            <span className="material-symbols-outlined text-on-surface-variant/60 px-2 text-xl">lock_open</span>
            <input className="w-full bg-transparent border-none focus:ring-0 py-3 text-on-surface placeholder:text-on-surface-variant/40 font-medium" id="password" placeholder="••••••••" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            <button className="px-2 text-on-surface-variant/60 hover:text-primary transition-colors" type="button" onClick={() => setShowPassword((v) => !v)}>
              <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2 px-0.5">
          <input className="w-4 h-4 rounded text-primary border-outline/30 focus:ring-primary/20 bg-surface" id="remember" type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          <label className="text-sm font-medium text-on-surface-variant cursor-pointer" htmlFor="remember">Duy trì đăng nhập</label>
        </div>

        <button className="w-full primary-gradient text-on-primary py-3.5 rounded-lg font-bold text-sm tracking-wide shadow-md shadow-primary/30 active:scale-[0.98] transition-all hover:shadow-lg hover:shadow-primary/40 flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed" type="submit" disabled={!canSubmit}>
          {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          <span className="material-symbols-outlined text-lg">arrow_forward</span>
        </button>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-outline/10" /></div>
        <div className="relative flex justify-center text-xs uppercase tracking-tighter">
          <span className="bg-surface-container-lowest px-4 text-on-surface-variant font-bold">Hoặc tạo tài khoản mới</span>
        </div>
      </div>

      <Link className="w-full bg-surface-container-low text-on-surface-variant py-3 rounded-lg font-bold text-sm tracking-wide border border-outline/5 hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2" to="/auth/register">
        <span className="material-symbols-outlined text-lg">person_add</span>
        Tạo tài khoản nhân viên
      </Link>
    </>
  )
}
