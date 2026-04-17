import { useEffect, useState, useMemo } from 'react'
import { useParams, useOutletContext } from 'react-router-dom'
import { unwrapApiResponse, unwrapApiArray } from '../api/apiClient'
import { getMyCalendar } from '../services/calendar/calendarApi'
import { cancelRegistration } from '../services/registrations/registrationApi'
import { getShifts } from '../services/shifts/shiftApi'
import { getMyPositions } from '../services/memberPosition/memberPositionApi'
import { getMyAvailability } from '../services/availability/availabilityApi'
import { ShiftChangeRequestModal } from '../components/shiftChange/ShiftChangeRequestModal'
import { useWeekRange } from '../hooks/common/useWeekRange'
import { WeekNavigator } from '../components/common/WeekNavigator'
import { MyScheduleHeader } from '../components/mySchedule/MyScheduleHeader'
import { MyScheduleStats } from '../components/mySchedule/MyScheduleStats'
import { CancelRegistrationModal } from '../components/mySchedule/CancelRegistrationModal'
import { MyScheduleWeekGrid } from '../components/mySchedule/MyScheduleWeekGrid'
import { MyScheduleToast } from '../components/mySchedule/MyScheduleToast'

/* ───── helpers ───── */
const MONTH_NAMES = ['Th01', 'Th02', 'Th03', 'Th04', 'Th05', 'Th06', 'Th07', 'Th08', 'Th09', 'Th10', 'Th11', 'Th12']

export function MySchedulePage() {
  const { groupId } = useParams()

  const { weekStart, weekEnd, weekDays, setWeekStart, goPrevWeek, goNextWeek, goCurrentWeek, toISO } = useWeekRange(new Date())

  // Calendar data (B19)
  const [calendarItems, setCalendarItems] = useState([])
  const [loadingCal, setLoadingCal] = useState(true)

  /* Ca trong tuần — chỉ tải khi mở modal đổi ca */
  const [shifts, setShifts] = useState([])
  const [myPositions, setMyPositions] = useState([])

  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)

  // Cancel modal (B13)
  const [cancelItem, setCancelItem] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelling, setCancelling] = useState(false)

  // Shift change request modal (B21/B22)
  const [changeFromItem, setChangeFromItem] = useState(null)
  const [preparingChange, setPreparingChange] = useState(false)
  const [availabilitySlots, setAvailabilitySlots] = useState([])

  /* ───── Load my calendar (B19) ───── */
  async function loadCalendar() {
    setLoadingCal(true); setError(null)
    try {
      const res = await getMyCalendar({ from: toISO(weekStart), to: toISO(weekEnd) })
      const unwrapped = unwrapApiResponse(res)
      const rawItems = Array.isArray(unwrapped) ? unwrapped : (unwrapped?.items ?? [])
      const list = (Array.isArray(rawItems) ? rawItems : []).map((item) => ({
        ...item,
        registrationStatus: item.registrationStatus ?? item.status ?? 'PENDING',
        shiftName: item.shiftName ?? item.name ?? null,
      }))
      setCalendarItems(list)
    } catch (err) {
      setError(err?.message || 'Không thể tải lịch cá nhân')
    } finally { setLoadingCal(false) }
  }

  async function loadShiftsForChangeModal() {
    const [sRes, mpRes] = await Promise.all([
      getShifts(groupId, toISO(weekStart), toISO(weekEnd)),
      getMyPositions(groupId).catch(() => null),
    ])
    setShifts(unwrapApiArray(sRes))
    setMyPositions(mpRes ? unwrapApiArray(mpRes) : [])
  }

  useEffect(() => {
    loadCalendar()
  }, [groupId, weekStart])

  /* ───── Calendar by date ───── */
  const calByDate = useMemo(() => {
    const items = Array.isArray(calendarItems) ? calendarItems : []
    const map = {}
    weekDays.forEach(d => { map[toISO(d)] = [] })
    items.forEach(item => {
      const key = item.date
      if (map[key]) map[key].push(item)
      else map[key] = [item]
    })
    return map
  }, [calendarItems, weekDays])

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  /* ───── Cancel registration (B13) ───── */
  async function handleCancel(e) {
    e.preventDefault()
    setCancelling(true); setError(null)
    try {
      await cancelRegistration(cancelItem.registrationId, cancelReason.trim() || null)
      showToast('Đã hủy đăng ký thành công.')
      setCancelItem(null); setCancelReason('')
      await loadCalendar()
    } catch (err) {
      setError(err?.message || 'Không thể hủy đăng ký')
    } finally { setCancelling(false) }
  }

  /* ───── Shift change request (B21) ───── */
  async function handleOpenShiftChange(item) {
    setError(null)
    setPreparingChange(true)
    try {
      await Promise.all([
        loadShiftsForChangeModal(),
        getMyAvailability()
          .then((res) => setAvailabilitySlots(unwrapApiArray(res)))
          .catch(() => setAvailabilitySlots([])),
      ])
      setChangeFromItem(item)
    } catch (err) {
      setError(err?.message || 'Không thể chuẩn bị dữ liệu đổi ca')
    } finally {
      setPreparingChange(false)
    }
  }

  async function handleShiftChangeCreated() {
    setChangeFromItem(null)
    showToast('Đã gửi yêu cầu đổi ca thành công! Chờ duyệt.')
    await loadCalendar()
  }

  const loading = loadingCal

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <MyScheduleHeader />

      {/* Week navigation */}
      <WeekNavigator
        label={`${MONTH_NAMES[weekStart.getMonth()]} ${weekStart.getDate()} — ${MONTH_NAMES[weekEnd.getMonth()]} ${weekEnd.getDate()}, ${weekEnd.getFullYear()}`}
        onPrev={goPrevWeek}
        onNext={goNextWeek}
        onToday={goCurrentWeek}
      />

      {error && <div className="bg-error-container/20 text-on-error-container rounded-xl p-4 text-center">{error}</div>}
      {loading && <div className="text-center py-12"><p className="text-on-surface-variant animate-pulse">Đang tải...</p></div>}

      {/* ═══ My Calendar (B19) ═══ */}
      {!loading && (
        <>
          <MyScheduleStats calendarItems={calendarItems} />

          <MyScheduleWeekGrid
            weekDays={weekDays}
            toISO={toISO}
            calByDate={calByDate}
            preparingChange={preparingChange}
            onOpenCancel={(item) => { setCancelItem(item); setCancelReason('') }}
            onOpenShiftChange={handleOpenShiftChange}
          />

          {calendarItems.length === 0 && (
            <div className="text-center py-12 bg-surface-container-lowest rounded-2xl border border-outline/10 border-dashed">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant opacity-20 mb-4">event_busy</span>
              <h3 className="text-xl font-bold text-on-surface mb-2">Chưa có lịch</h3>
              <p className="text-on-surface-variant font-medium">Vào <strong>Lịch ca</strong> trên menu để xem ca đang mở và đăng ký.</p>
            </div>
          )}
        </>
      )}

      <CancelRegistrationModal
        open={!!cancelItem}
        cancelItem={cancelItem}
        cancelReason={cancelReason}
        setCancelReason={setCancelReason}
        cancelling={cancelling}
        onClose={() => setCancelItem(null)}
        onSubmit={handleCancel}
      />

      {/* ═══ Shift Change Request Modal (B21/B22) ═══ */}
      {changeFromItem && (
        <ShiftChangeRequestModal
          open={!!changeFromItem}
          onClose={() => setChangeFromItem(null)}
          groupId={groupId}
          fromItem={changeFromItem}
          availableShifts={shifts}
          availabilitySlots={availabilitySlots}
          myPositions={myPositions}
          onCreated={handleShiftChangeCreated}
        />
      )}

      <MyScheduleToast toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}
