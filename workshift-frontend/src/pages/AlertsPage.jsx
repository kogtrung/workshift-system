import { useEffect, useMemo, useState } from 'react'
import { useParams, useOutletContext } from 'react-router-dom'
import { getUnderstaffedAlerts } from '../services/alerts/alertApi'
import { unwrapApiArray } from '../api/apiClient'
import { AlertsHeader } from '../components/alerts/AlertsHeader'
import { AlertsStats } from '../components/alerts/AlertsStats'
import { AlertsList } from '../components/alerts/AlertsList'
import { ErrorAlert } from '../components/common/ErrorAlert'
import { LoadingState } from '../components/common/LoadingState'
function parseDateOnly(d) {
  // Backend LocalDate -> "YYYY-MM-DD"
  if (!d) return null
  if (d instanceof Date) return d
  const parts = String(d).split('-').map(Number)
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null
  const [y, m, day] = parts
  return new Date(y, m - 1, day)
}

function parseTimeToMinutes(t) {
  // "HH:mm:ss" | "HH:mm"
  const s = t ? String(t) : ''
  const [hh, mm] = s.split(':')
  const H = Number(hh)
  const M = Number(mm)
  if (Number.isNaN(H) || Number.isNaN(M)) return 0
  return H * 60 + M
}

export function AlertsPage() {
  const { groupId } = useParams()
  const { isManager } = useOutletContext() || {}

  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [weekOffset, setWeekOffset] = useState(0) // 0: tuần này, 1: tuần sau...
  const [expanded, setExpanded] = useState({}) // shiftId -> boolean

  const visibleAlerts = useMemo(() => {
    const list = Array.isArray(alerts) ? alerts : []
    const now = new Date()
    // Tính start-of-week (Thứ 2)
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const day = d.getDay() // 0..6 (Sun..Sat)
    const diffToMonday = day === 0 ? -6 : 1 - day
    const startOfThisWeek = new Date(d)
    startOfThisWeek.setDate(d.getDate() + diffToMonday)
    startOfThisWeek.setHours(0, 0, 0, 0)

    const start = new Date(startOfThisWeek)
    start.setDate(start.getDate() + weekOffset * 7)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    end.setHours(23, 59, 59, 999)

    const sorted = list
      .slice()
      .sort((a, b) => {
        const da = parseDateOnly(a.date) || new Date(0)
        const db = parseDateOnly(b.date) || new Date(0)
        if (da.getTime() !== db.getTime()) return da - db
        return parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime)
      })

    return sorted.filter((a) => {
      const d = parseDateOnly(a.date)
      if (!d) return false
      return d >= start && d <= end
    })
  }, [alerts, weekOffset])

  async function loadAlerts() {
    setLoading(true); setError(null)
    try {
      const res = await getUnderstaffedAlerts(groupId)
      setAlerts(unwrapApiArray(res))
    } catch (err) {
      setError(err?.message || 'Không thể tải cảnh báo')
    } finally { setLoading(false) }
  }

  useEffect(() => { loadAlerts() }, [groupId])
  useEffect(() => { setExpanded({}) }, [weekOffset])

  const totals = useMemo(() => {
    const list = visibleAlerts || []
    const totalShortage = list.reduce((s, a) => s + Math.max(0, (a.totalRequired || 0) - (a.totalApproved || 0)), 0)
    const totalRequired = list.reduce((s, a) => s + (a.totalRequired || 0), 0)
    return { totalShortage, totalRequired }
  }, [visibleAlerts])

  if (!isManager) {
    return (
      <div className="w-full text-center py-20">
        <span className="material-symbols-outlined text-5xl text-on-surface-variant opacity-20 mb-4">lock</span>
        <h3 className="text-xl font-bold text-on-surface mb-2">Không có quyền truy cập</h3>
        <p className="text-on-surface-variant">Chỉ quản lý mới có thể xem cảnh báo.</p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      <AlertsHeader weekOffset={weekOffset} loading={loading} onChangeWeekOffset={setWeekOffset} onRefresh={loadAlerts} />

      <ErrorAlert message={error} />
      {loading && <LoadingState message="Đang tải cảnh báo..." />}

      {!loading && <AlertsStats visibleAlerts={visibleAlerts} totals={totals} />}
      {!loading && <AlertsList groupId={groupId} alerts={visibleAlerts} expanded={expanded} setExpanded={setExpanded} />}
    </div>
  )
}
