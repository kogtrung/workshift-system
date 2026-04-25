import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { unwrapApiResponse } from '../api/apiClient'
import { login } from '../services/auth/authApi'
import { useAuth } from '../states/auth/AuthContext'
import { LoginForm } from '../components/auth/LoginForm'

export function LoginPage() {
  const navigate = useNavigate()
  const { setTokens } = useAuth()

  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const canSubmit = useMemo(() => {
    return usernameOrEmail.trim().length > 0 && password.length > 0 && !isSubmitting
  }, [usernameOrEmail, password, isSubmitting])

  async function onSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return

    setError('')
    setIsSubmitting(true)
    try {
      const payload = await login({ usernameOrEmail: usernameOrEmail.trim(), password })
      const data = unwrapApiResponse(payload)
      setTokens({ accessToken: data.token, refreshToken: data.refreshToken, remember })
      navigate('/app/groups', { replace: true })
    } catch (err) {
      setError(err?.message || 'Đăng nhập thất bại')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-surface font-body text-on-surface min-h-[calc(100vh-32px)] flex items-center justify-center p-6 selection:bg-primary-container selection:text-on-primary-container">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary-container/20 blur-[120px]" />
        <div className="absolute bottom-[5%] right-[0%] w-[30%] h-[30%] rounded-full bg-tertiary-container/30 blur-[100px]" />
      </div>

      <main className="relative z-10 w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-12 h-12 mb-4 rounded-xl primary-gradient flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-2xl">coffee</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-on-surface">WorkShift</h1>
          <p className="text-on-surface-variant text-sm mt-1 font-medium tracking-wide">Quản lý lịch làm việc của bạn.</p>
        </div>

        <div className="glass-panel rounded-xl p-8 shadow-2xl shadow-on-surface/5 border border-white/50">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-on-surface mb-1">Chào mừng bạn trở lại</h2>
            <p className="text-on-surface-variant text-sm">Nhập thông tin để quản lý ca làm việc hôm nay.</p>
          </div>

          {error ? (
            <div className="mb-6 bg-error-container/20 text-on-error-container rounded-xl px-4 py-3 text-sm font-medium">
              {error}
            </div>
          ) : null}

          <LoginForm
            usernameOrEmail={usernameOrEmail}
            setUsernameOrEmail={setUsernameOrEmail}
            password={password}
            setPassword={setPassword}
            remember={remember}
            setRemember={setRemember}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            canSubmit={canSubmit}
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
          />
        </div>

        <div className="mt-10 text-center text-[11px] text-on-surface-variant/60">
          Chưa có tài khoản? <Link className="font-bold text-primary" to="/auth/register">Đăng ký</Link>
        </div>
      </main>
    </div>
  )
}
