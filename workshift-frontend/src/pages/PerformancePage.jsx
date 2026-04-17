import { useEffect, useMemo, useState } from 'react'
import { useParams, useOutletContext } from 'react-router-dom'
import { getPerformance } from '../services/performance/performanceApi'
import { PerformanceFilters } from '../components/performance/PerformanceFilters'
import { PerformanceStats } from '../components/performance/PerformanceStats'
import { PerformanceTopChart } from '../components/performance/PerformanceTopChart'
import { PerformanceTable } from '../components/performance/PerformanceTable'

function toDateInputValue(d) {
  if (!d || !(d instanceof Date)) return ''
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function getWeekRange(base = new Date()) {
  // Monday -> Sunday
  const d = new Date(base)
  const day = d.getDay() // 0(Sun) .. 6(Sat)
  const diffToMonday = day === 0 ? -6 : (1 - day)
  const start = new Date(d)
  start.setDate(d.getDate() + diffToMonday)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return { start, end }
}

function getMonthRange(base = new Date()) {
  const start = new Date(base.getFullYear(), base.getMonth(), 1)
  const end = new Date(base.getFullYear(), base.getMonth() + 1, 0)
  return { start, end }
}

function normalizePerformanceResponse(res) {
  const raw = res?.data ?? res

  const entriesCandidate =
    raw?.byUser ??
    raw?.entries ??
    raw?.results ??
    raw?.members ??
    raw?.data ??
    raw

  if (Array.isArray(entriesCandidate)) return { entries: entriesCandidate }

  if (Array.isArray(raw?.byUser)) return { entries: raw.byUser }
  if (Array.isArray(raw?.members)) return { entries: raw.members }
  if (Array.isArray(raw?.entries)) return { entries: raw.entries }

  return { entries: [] }
}

export function PerformancePage() {
  const { groupId } = useParams()
  const { isManager } = useOutletContext() || {}

  const now = useMemo(() => new Date(), [])

  const [range, setRange] = useState('week') // 'week' | 'month'
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [report, setReport] = useState(null)

  useEffect(() => {
    const { start, end } = range === 'week' ? getWeekRange(now) : getMonthRange(now)
    setFrom(toDateInputValue(start))
    setTo(toDateInputValue(end))
  }, [range, now])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await getPerformance(groupId, { range, from, to })
      setReport(res)
    } catch (err) {
      setError(err?.message || 'Không thể tải báo cáo hiệu suất')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!groupId) return
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, range, from, to])

  const { entries } = useMemo(() => normalizePerformanceResponse(report), [report])

  const totals = useMemo(() => {
    const totalShifts = entries.reduce((s, e) => s + Number(e.shiftsWorked ?? e.totalShifts ?? e.totalShiftCount ?? e.shifts ?? 0), 0)
    const totalHours = entries.reduce((s, e) => s + Number(e.totalHours ?? e.totalHoursWorked ?? e.hours ?? 0), 0)
    return { totalShifts, totalHours }
  }, [entries])

  const topByHours = useMemo(() => {
    const list = [...entries]
    list.sort((a, b) => Number(b.totalHours ?? b.totalHoursWorked ?? b.hours ?? 0) - Number(a.totalHours ?? a.totalHoursWorked ?? a.hours ?? 0))
    return list.slice(0, 5)
  }, [entries])

  const maxHours = useMemo(() => {
    const m = topByHours.reduce((mx, e) => Math.max(mx, Number(e.totalHours ?? e.totalHoursWorked ?? e.hours ?? 0)), 0)
    return m > 0 ? m : 0
  }, [topByHours])

  if (!isManager) {
    return (
      <div className="w-full text-center py-20">
        <span className="material-symbols-outlined text-5xl text-on-surface-variant opacity-20 mb-4">lock</span>
        <h3 className="text-xl font-bold text-on-surface mb-2">Không có quyền truy cập</h3>
        <p className="text-on-surface-variant">Chỉ quản lý mới có thể xem báo cáo hoạt động.</p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-1">
        <p className="text-xs font-bold tracking-[0.05em] uppercase text-on-surface-variant opacity-70">Quản lý</p>
        <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">Báo cáo hoạt động</h2>
        <p className="text-on-surface-variant font-medium">So sánh số ca và tổng giờ làm theo giai đoạn</p>
      </div>

      <PerformanceFilters
        range={range}
        from={from}
        to={to}
        loading={loading}
        onChangeRange={setRange}
        onChangeFrom={setFrom}
        onChangeTo={setTo}
        onReload={load}
      />

      {error && <div className="bg-error-container/20 text-on-error-container rounded-xl p-4 text-center">{error}</div>}
      {loading && <div className="text-center py-12"><p className="text-on-surface-variant animate-pulse">Đang tải...</p></div>}

      {!loading && !error && (
        <>
          <PerformanceStats entries={entries} totals={totals} />
          <PerformanceTopChart topByHours={topByHours} maxHours={maxHours} />
          <PerformanceTable entries={entries} range={range} />
        </>
      )}
    </div>
  )
}

