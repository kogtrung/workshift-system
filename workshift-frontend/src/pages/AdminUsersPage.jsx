import { useEffect, useState } from "react"
import { getAdminUsers, toggleAdminUserStatus } from '../services/admin/adminApi'

function StatusBadge({ status }) {
  const active = status === 'ACTIVE'
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
      active
        ? 'bg-emerald-100 text-emerald-700'
        : 'bg-error-container/30 text-error'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-error'}`} />
      {active ? 'Hoạt động' : 'Bị khóa'}
    </span>
  )
}

function RoleBadge({ role }) {
  const isAdmin = role === 'ADMIN'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
      isAdmin ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container text-on-surface-variant'
    }`}>
      {isAdmin ? 'Admin' : 'User'}
    </span>
  )
}

export function AdminUsersPage() {
  const [items, setItems] = useState(null)
  const [page, setPage] = useState(0)
  const [size] = useState(10)
  const [search, setSearch] = useState("")
  const [pendingSearch, setPendingSearch] = useState("")

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [actioningId, setActioningId] = useState(null)

  async function load(s = search) {
    setLoading(true)
    setError("")
    try {
      const res = await getAdminUsers({ page, size, search: s.trim() || null })
      const data = res?.data ?? res
      setItems(data)
    } catch (e) {
      setError(e?.message || "Không thể tải danh sách người dùng")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  function applySearch() {
    setSearch(pendingSearch)
    setPage(0)
    load(pendingSearch)
  }

  const list = items?.content || items?.items || []
  const totalPages = items?.totalPages ?? 0

  async function handleToggle(userId, currentStatus) {
    if (!window.confirm(currentStatus === 'ACTIVE' ? 'Khoá tài khoản này?' : 'Mở khoá tài khoản này?')) return
    setActioningId(userId)
    try {
      await toggleAdminUserStatus(userId)
      await load()
    } catch (e) {
      alert(e?.message || "Không thể cập nhật trạng thái user")
    } finally {
      setActioningId(null)
    }
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-1">
        <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">Quản lý người dùng</h2>
        <p className="text-on-surface-variant font-medium">Danh sách người dùng hệ thống</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-end">
        <div className="flex-1">
          <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
            Tìm kiếm
          </label>
          <input
            value={pendingSearch}
            onChange={(e) => setPendingSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applySearch()}
            placeholder="username / email / họ tên..."
            className="w-full bg-surface-container-lowest rounded-xl border border-outline/20 px-4 py-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button
          className="px-5 py-2.5 bg-primary text-on-primary font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-md disabled:opacity-50"
          type="button"
          onClick={applySearch}
          disabled={loading}
        >
          Tìm kiếm
        </button>
      </div>

      {error ? (
        <div className="bg-error-container/20 text-on-error-container rounded-xl px-4 py-3 text-sm font-medium">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-on-surface-variant animate-pulse">Đang tải...</p>
        </div>
      ) : (
        <div className="bg-surface-container-low rounded-xl overflow-hidden border border-outline/10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high/50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">ID</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Người dùng</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Vai trò</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/5">
              {list.length === 0 ? (
                <tr>
                  <td className="px-6 py-10 text-center text-on-surface-variant" colSpan={5}>
                    Không có dữ liệu.
                  </td>
                </tr>
              ) : (
                list.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="px-6 py-4 text-sm text-on-surface-variant">#{u.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-on-surface">{u.fullName || u.username}</div>
                      <div className="text-xs text-on-surface-variant mt-0.5">{u.username} · {u.email}</div>
                    </td>
                    <td className="px-6 py-4"><RoleBadge role={u.globalRole} /></td>
                    <td className="px-6 py-4"><StatusBadge status={u.status} /></td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggle(u.id, u.status)}
                        disabled={actioningId === u.id}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors disabled:opacity-50 ${
                          u.status === 'ACTIVE'
                            ? 'bg-error-container/30 text-error hover:bg-error-container/50'
                            : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        }`}
                      >
                        {actioningId === u.id ? '...' : u.status === 'ACTIVE' ? 'Khoá' : 'Mở khoá'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="flex items-center justify-between px-6 py-4 border-t border-outline/10">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page <= 0 || loading}
              className="px-4 py-2 rounded-lg border border-outline/10 hover:bg-surface-container-high disabled:opacity-50 text-sm font-medium"
            >
              ← Trước
            </button>
            <div className="text-sm text-on-surface-variant">
              Trang {page + 1} / {totalPages || 1}
            </div>
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages - 1 || loading}
              className="px-4 py-2 rounded-lg border border-outline/10 hover:bg-surface-container-high disabled:opacity-50 text-sm font-medium"
            >
              Sau →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
