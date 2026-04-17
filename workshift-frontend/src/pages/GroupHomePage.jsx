import { useState, useEffect, useMemo } from 'react'
import { useParams, useOutletContext } from 'react-router-dom'
import { useAuth } from '../states/auth/AuthContext'
import { getShifts } from '../services/shifts/shiftApi'
import { getSalaryConfigs } from '../services/salary/salaryApi'
import { getPayroll } from '../services/payroll/payrollApi'
import { getPositions } from '../services/positions/positionApi'
import { getUnderstaffedAlerts } from '../services/alerts/alertApi'
import { unwrapApiArray } from '../api/apiClient'
import { useWeekRange } from '../hooks/common/useWeekRange'
import { OverviewHeader } from '../components/groupHome/OverviewHeader'
import { WeekNavigator } from '../components/common/WeekNavigator'
import { GroupHomeMetricCards } from '../components/groupHome/GroupHomeMetricCards'
import { GroupHomeWeekGrid } from '../components/groupHome/GroupHomeWeekGrid'

/* ───── date helpers ───── */
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r }
function parseDateOnly(d) {
  // Backend LocalDate -> "YYYY-MM-DD"
  if (!d) return null
  if (d instanceof Date) return d
  const parts = String(d).split('-').map(Number)
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null
  const [y, m, day] = parts
  return new Date(y, m - 1, day)
}

function parseTime(t) {
  if (!t) return 0
  const [h, m] = t.split(':').map(Number)
  return h + m / 60
}
function getDuration(s, e) {
  return Math.max(0, parseTime(e) - parseTime(s))
}

function getHourlyRateForMember({ salaries, userId, positionId }) {
  const uId = userId == null ? null : Number(userId)
  const pId = positionId == null ? null : Number(positionId)
  if (!Array.isArray(salaries) || salaries.length === 0) return null

  const byUser = uId != null
    ? salaries.find(c => c.userId != null && Number(c.userId) === uId && c.hourlyRate != null)
    : null
  if (byUser?.hourlyRate != null) return Number(byUser.hourlyRate)

  const byPos = pId != null
    ? salaries.find(c => c.positionId != null && Number(c.positionId) === pId && c.hourlyRate != null)
    : null
  if (byPos?.hourlyRate != null) return Number(byPos.hourlyRate)

  return null
}

export function GroupHomePage() {
  const { groupId } = useParams()
  const { groupInfo, isManager } = useOutletContext() || {}
  const { user } = useAuth()
  const [metricRange, setMetricRange] = useState('week') // 'week' | 'month'
  const [monthlyPayroll, setMonthlyPayroll] = useState(null)

  // Calendar State
  const { weekStart, weekEnd, weekDays, setWeekStart, goPrevWeek, goNextWeek, toISO } = useWeekRange(new Date())
  const [shifts, setShifts] = useState([])
  const [salaries, setSalaries] = useState([])
  const [positions, setPositions] = useState([])
  const [understaffAlerts, setUnderstaffAlerts] = useState([])
  const [loadingShifts, setLoadingShifts] = useState(false)

  useEffect(() => {
    if (!groupId) return
    async function fetchData() {
      setLoadingShifts(true)
      try {
        const from = toISO(weekStart)
        const to = toISO(weekEnd)
        
        const [shiftRes, posRes] = await Promise.all([
          getShifts(groupId, from, to),
          getPositions(groupId)
        ])
        setShifts(unwrapApiArray(shiftRes))
        setPositions(unwrapApiArray(posRes))
        
        try {
          const salRes = await getSalaryConfigs(groupId)
          setSalaries(Array.isArray(salRes) ? salRes : (salRes?.data ?? []))
        } catch (e) {
          // Staff có thể không có quyền đọc salary config.
          setSalaries([])
        }

        try {
          const now = new Date()
          const pr = await getPayroll(groupId, now.getMonth() + 1, now.getFullYear())
          setMonthlyPayroll(pr?.data ?? pr ?? null)
        } catch {
          setMonthlyPayroll(null)
        }

        if (isManager) {
          try {
            const alertRes = await getUnderstaffedAlerts(groupId)
            setUnderstaffAlerts(Array.isArray(alertRes) ? alertRes : (alertRes?.data ?? []))
          } catch (e) {
            setUnderstaffAlerts([])
          }
        } else {
          setUnderstaffAlerts([])
        }
      } catch (err) {
        console.error('Failed to load overview data', err)
      } finally {
        setLoadingShifts(false)
      }
    }
    fetchData()
  }, [groupId, isManager, weekStart])

  const shiftsByDate = useMemo(() => {
    const map = {}
    shifts.forEach(s => {
      if (!map[s.date]) map[s.date] = []
      map[s.date].push(s)
    })
    return map
  }, [shifts])

  const weekStartDate = useMemo(() => {
    return new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate())
  }, [weekStart])

  const weekEndDate = useMemo(() => {
    return addDays(weekStartDate, 6)
  }, [weekStartDate])

  // shiftId -> shortage (totalRequired - totalApproved) chỉ trong phạm vi 1 tuần hiển thị
  const shortageByShiftId = useMemo(() => {
    const map = {}
    if (!Array.isArray(understaffAlerts) || understaffAlerts.length === 0) return map

    understaffAlerts.forEach((a) => {
      const d = parseDateOnly(a.date)
      if (!d) return
      if (d < weekStartDate || d > weekEndDate) return
      const shiftId = a.shiftId == null ? null : String(a.shiftId)
      if (!shiftId) return
      const shortage = Math.max(0, (a.totalRequired || 0) - (a.totalApproved || 0))
      if (shortage > 0) map[shiftId] = shortage
    })

    return map
  }, [understaffAlerts, weekStartDate, weekEndDate])

  const displayPositions = useMemo(() => {
    if (isManager) return positions

    const myPosIds = new Set()
    shifts.forEach(s => {
      ;(s.assignedMembers || []).forEach(am => {
        if (String(am.userId) === String(user?.id) && am.positionId != null) {
          myPosIds.add(am.positionId)
        }
      })
    })

    if (myPosIds.size === 0) return []
    return positions.filter(p => myPosIds.has(p.id))
  }, [positions, shifts, isManager, user])

  const weekMetrics = useMemo(() => {
    let totalHours = 0
    let totalSalary = 0
    let hasSalaryRate = false
    const shiftIds = new Set()

    shifts.forEach(s => {
      const dur = getDuration(s.startTime, s.endTime)
      const assigned = s.assignedMembers || []

      if (isManager) {
        shiftIds.add(s.id)
        assigned.forEach(am => {
          totalHours += dur
          // Một số API có thể không trả về `positionId` trong `assignedMembers`,
          // khi đó suy ra `positionId` từ `positionName` dựa trên danh sách `positions`.
          const resolvedPositionId =
            am?.positionId ??
            am?.position?.id ??
            (am?.positionName
              ? positions.find(p => String(p.name) === String(am.positionName))?.id
              : null)

          const rate = getHourlyRateForMember({
            salaries,
            userId: am.userId,
            positionId: resolvedPositionId,
          })
          if (rate != null) {
            hasSalaryRate = true
            totalSalary += dur * rate
          }
        })
      } else {
        // Staff: chỉ tính theo ca của chính mình
        const myAssigned = assigned.filter(am => String(am.userId) === String(user?.id))
        if (myAssigned.length > 0) {
          shiftIds.add(s.id)
          totalHours += dur
          const my = myAssigned[0]
          const resolvedPositionId =
            my?.positionId ??
            my?.position?.id ??
            (my?.positionName
              ? positions.find(p => String(p.name) === String(my.positionName))?.id
              : null)

          const rate = getHourlyRateForMember({
            salaries,
            userId: my.userId,
            positionId: resolvedPositionId,
          })
          if (rate != null) {
            hasSalaryRate = true
            totalSalary += dur * rate
          }
        }
      }
    })

    return {
      totalShifts: shiftIds.size,
      totalHours: totalHours.toFixed(1),
      totalSalary: hasSalaryRate ? totalSalary : null,
    }
  }, [shifts, salaries, isManager, user, positions])

  const monthlyMetrics = useMemo(() => {
    const items = Array.isArray(monthlyPayroll?.items) ? monthlyPayroll.items : []
    if (isManager) {
      return {
        totalShifts: items.reduce((s, it) => s + Number(it.shiftsWorked ?? 0), 0),
        totalHours: items.reduce((s, it) => s + Number(it.totalHours ?? 0), 0).toFixed(1),
        totalSalary: items.reduce((s, it) => s + Number(it.estimatedPay ?? 0), 0),
      }
    }
    const mine = items.find((it) => String(it.userId) === String(user?.id))
    return {
      totalShifts: Number(mine?.shiftsWorked ?? 0),
      totalHours: Number(mine?.totalHours ?? 0).toFixed(1),
      totalSalary: Number(mine?.estimatedPay ?? 0),
    }
  }, [monthlyPayroll, isManager, user])

  const metrics = metricRange === 'month' ? monthlyMetrics : weekMetrics

  // Staff chỉ xem lịch cá nhân của mình; Manager xem toàn bộ ca của nhóm.
  return (
    <div className="w-full space-y-6">
      {/* Page Header */}
      <OverviewHeader isManager={isManager} metricRange={metricRange} onChangeMetricRange={setMetricRange} />

      <GroupHomeMetricCards isManager={isManager} metrics={metrics} />

      {/* ═══ Weekly Overview Calendar ═══ */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-extrabold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">calendar_view_week</span>
            Làm việc trong tuần
          </h3>
          <WeekNavigator label={`${toISO(weekStart)} – ${toISO(weekEnd)}`} onPrev={goPrevWeek} onNext={goNextWeek} />
        </div>

        <GroupHomeWeekGrid
          weekDays={weekDays}
          toISO={toISO}
          shiftsByDate={shiftsByDate}
          isManager={isManager}
          user={user}
          shortageByShiftId={shortageByShiftId}
          loadingShifts={loadingShifts}
          displayPositions={displayPositions}
        />
      </div>
    </div>
  )
}
