import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { unwrapApiResponse } from '../api/apiClient'
import { register } from '../services/auth/authApi'
import { RegisterForm } from '../components/auth/RegisterForm'

export function RegisterPage() {
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const canSubmit = useMemo(() => {
    return (
      fullName.trim().length > 0 &&
      username.trim().length >= 3 &&
      email.trim().length > 0 &&
      password.length >= 6 &&
      confirmPassword.length > 0 &&
      !isSubmitting
    )
  }, [fullName, username, email, password, confirmPassword, isSubmitting])

  async function onSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }

    setError('')
    setSuccess('')
    setIsSubmitting(true)
    try {
      const payload = await register({
        username: username.trim(),
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        phone: phone.trim() || null,
      })
      unwrapApiResponse(payload)
      setSuccess('Tạo tài khoản thành công. Bạn có thể đăng nhập ngay.')
      navigate('/auth/login', { replace: true })
    } catch (err) {
      setError(err?.message || 'Đăng ký thất bại')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-background text-on-background min-h-[calc(100vh-32px)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-3xl p-8 shadow-[0_24px_48px_rgba(0,52,94,0.06)] relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
        <div className="relative z-10 text-center mb-8">
          <span className="inline-block px-3 py-1 bg-tertiary-container text-on-tertiary-container text-[11px] font-bold uppercase tracking-[0.1em] rounded-full mb-4">
            Tham gia đội
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-on-surface">Đăng ký tài khoản nhân viên</h1>
          <p className="text-on-surface-variant mt-2 text-sm">Tạo tài khoản để bắt đầu quản lý ca làm việc.</p>
        </div>

        {error ? (
          <div className="relative z-10 mb-6 bg-error-container/20 text-on-error-container rounded-xl px-4 py-3 text-sm font-medium">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="relative z-10 mb-6 bg-primary-container/60 text-on-primary-container rounded-xl px-4 py-3 text-sm font-medium">
            {success}
          </div>
        ) : null}

        <RegisterForm
          fullName={fullName}
          setFullName={setFullName}
          username={username}
          setUsername={setUsername}
          email={email}
          setEmail={setEmail}
          phone={phone}
          setPhone={setPhone}
          password={password}
          setPassword={setPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          canSubmit={canSubmit}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  )
}
