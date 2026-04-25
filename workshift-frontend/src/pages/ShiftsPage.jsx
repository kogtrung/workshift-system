import { useEffect, useState, useMemo, useCallback } from 'react'
import { useParams, useOutletContext } from 'react-router-dom'
import { getTemplates } from '../services/shifts/shiftTemplateApi'
import { getShifts, createShift, createShiftsBulk, deleteShift } from '../services/shifts/shiftApi'
import { getPositions } from '../services/positions/positionApi'
import { getRequirements, createRequirement, deleteRequirement } from '../services/shifts/shiftRequirementApi'
import { registerShift, getPendingRegistrations, approveRegistration, rejectRegistration, assignShift } from '../services/registrations/registrationApi'
import { getMyPositions } from '../services/memberPosition/memberPositionApi'
import { getGroupMembers } from '../services/groups/groupApi'
import { ShiftLockModal } from '../components/shifts/ShiftLockModal'
import { ShiftRecommendationsModal } from '../components/shifts/ShiftRecommendationsModal'
import { ShiftRegistrationModal } from '../components/shifts/ShiftRegistrationModal'
import { ShiftsSummaryCards } from '../components/shifts/ShiftsSummaryCards'
import { ShiftsWeekGrid } from '../components/shifts/ShiftsWeekGrid'
import { ShiftCreateModal } from '../components/shifts/ShiftCreateModal'
import { ShiftDetailsPanel } from '../components/shifts/ShiftDetailsPanel'
import { ShiftsRegistrationToast } from '../components/shifts/ShiftsRegistrationToast'
import { unwrapApiArray, unwrapApiResponse } from '../api/apiClient'
import { ErrorAlert } from '../components/common/ErrorAlert'
import { LoadingState } from '../components/common/LoadingState'
import { getMyCalendar } from '../services/calendar/calendarApi'
import { useWeekRange } from '../hooks/common/useWeekRange'
import { WeekNavigator } from '../components/common/WeekNavigator'
import { ShiftsHeader } from '../components/shifts/ShiftsHeader'

/* ───── date helpers ───── */
function fmtTime(t) { return t ? String(t).substring(0, 5) : '—' }
const MONTH_NAMES = ['Th01', 'Th02', 'Th03', 'Th04', 'Th05', 'Th06', 'Th07', 'Th08', 'Th09', 'Th10', 'Th11', 'Th12']

export function ShiftsPage() {
  const { groupId } = useParams()
  const { isManager } = useOutletContext() || {}

  const { weekStart, weekEnd, weekDays, goPrevWeek, goNextWeek, goCurrentWeek, toISO } = useWeekRange(new Date())
  const [shifts, setShifts] = useState([])
  const [templates, setTemplates] = useState([])
  const [positions, setPositions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Manager: pending count per shift (B14 - Chờ duyệt)
  const [pendingCountsByShiftId, setPendingCountsByShiftId] = useState({})

  // create form
  const [showCreate, setShowCreate] = useState(false)
  const [createDate, setCreateDate] = useState('')
  const [formName, setFormName] = useState('')
  const [formStart, setFormStart] = useState('')
  const [formEnd, setFormEnd] = useState('')
  const [formTpl, setFormTpl] = useState('')
  const [formNote, setFormNote] = useState('')
  const [creating, setCreating] = useState(false)
  const [createErr, setCreateErr] = useState(null)

  // requirement panel
  const [selShift, setSelShift] = useState(null)
  const [reqs, setReqs] = useState([])
  const [loadingReqs, setLoadingReqs] = useState(false)
  const [reqPos, setReqPos] = useState('')
  const [reqQty, setReqQty] = useState(1)
  const [addingReq, setAddingReq] = useState(false)
  const [reqErr, setReqErr] = useState(null)

  // B14/B15: pending registrations
  const [pendingRegs, setPendingRegs] = useState([])
  const [loadingPending, setLoadingPending] = useState(false)
  const [actioningId, setActioningId] = useState(null)

  // B16: assign shift
  const [members, setMembers] = useState([])
  const [assignUserId, setAssignUserId] = useState('')
  const [assignPosId, setAssignPosId] = useState('')
  const [assignNote, setAssignNote] = useState('')
  const [assigning, setAssigning] = useState(false)
  const [assignErr, setAssignErr] = useState(null)

  // Panel Tabs
  const [activeTab, setActiveTab] = useState('requirements') // 'requirements', 'pending', 'assign'

  // B20: Khóa ca (OPEN -> LOCKED)
  const [lockShiftModalShift, setLockShiftModalShift] = useState(null)

  // B18: Gợi ý nhân viên
  const [recommendModalState, setRecommendModalState] = useState(null)

  // registration modal
  const [regShift, setRegShift] = useState(null)
  const [regPosId, setRegPosId] = useState('')
  const [regNote, setRegNote] = useState('')
  const [registering, setRegistering] = useState(false)
  const [regErr, setRegErr] = useState(null)
  const [myPositions, setMyPositions] = useState([])
  const [loadingMyPos, setLoadingMyPos] = useState(false)
  const [regToast, setRegToast] = useState(null)
  /** shiftId → PENDING | APPROVED — đăng ký của user trong tuần (staff) */
  const [myRegStatusByShiftId, setMyRegStatusByShiftId] = useState({})

  function showRegToast(msg) { setRegToast(msg); setTimeout(() => setRegToast(null), 3500) }

  async function handleRegisterClick(e, shift) {
    e.stopPropagation()
    setRegShift(shift)
    setRegPosId(''); setRegNote(''); setRegErr(null)
    setLoadingMyPos(true)
    try {
      const res = await getMyPositions(groupId)
      setMyPositions(unwrapApiArray(res))
    } catch { setMyPositions([]) }
    finally { setLoadingMyPos(false) }
  }


  const refreshMyRegStatus = useCallback(async () => {
    if (isManager) {
      setMyRegStatusByShiftId({})
      return
    }
    const from = toISO(weekStart)
    const to = toISO(weekEnd)
    try {
      const res = await getMyCalendar({ from, to })
      const u = unwrapApiResponse(res)
      const raw = Array.isArray(u) ? u : (u?.items ?? [])
      const map = {}
      for (const it of raw || []) {
        const sid = it.shiftId
        if (sid == null) continue
        const st = it.registrationStatus ?? it.status
        if (st === 'PENDING' || st === 'APPROVED') map[sid] = st
      }
      setMyRegStatusByShiftId(map)
    } catch {
      setMyRegStatusByShiftId({})
    }
  }, [isManager, weekStart, weekEnd])

  async function handleRegisterSubmit(e) {
    e.preventDefault()
    if (!regPosId) { setRegErr('Chọn vị trí đăng ký'); return }
    setRegistering(true); setRegErr(null)
    try {
      await registerShift(regShift.id, Number(regPosId), regNote.trim() || null)
      showRegToast('Đăng ký ca thành công! Chờ quản lý duyệt.')
      setRegShift(null)
      await refreshMyRegStatus()
    } catch (err) {
      setRegErr(err?.message || 'Không thể đăng ký ca')
    } finally { setRegistering(false) }
  }

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const from = toISO(weekStart)
      const to = toISO(weekEnd)
      const [sRes, tRes, pRes] = await Promise.all([
        getShifts(groupId, from, to),
        getTemplates(groupId),
        getPositions(groupId),
      ])
      const shiftList = unwrapApiArray(sRes)
      setShifts(shiftList)
      setTemplates(unwrapApiArray(tRes))
      setPositions(unwrapApiArray(pRes))

      // B14: Load pending registration count per shift for manager cards
      if (isManager) {
        try {
          const counts = {}
          const openShifts = (shiftList || []).filter((s) => s && s.id && s.status === 'OPEN')
          await Promise.all(
            openShifts.map(async (s) => {
              try {
                const pending = await getPendingRegistrations(s.id)
                const list = unwrapApiArray(pending)
                counts[s.id] = list.length
              } catch {
                counts[s.id] = 0
              }
            })
          )
          setPendingCountsByShiftId(counts)
        } catch {
          setPendingCountsByShiftId({})
        }
      } else {
        setPendingCountsByShiftId({})
      }
    } catch (err) {
      setError(err?.message || 'Không thể tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [groupId, weekStart, isManager])

  useEffect(() => {
    refreshMyRegStatus()
  }, [refreshMyRegStatus])

  const shiftsByDate = useMemo(() => {
    const map = {}
    weekDays.forEach(d => { map[toISO(d)] = [] })
    shifts.forEach(s => {
      const key = s.date
      if (map[key]) map[key].push(s)
      else map[key] = [s]
    })
    return map
  }, [shifts, weekDays])

  /* ───── create shift ───── */
  function openCreateForDate(dateStr) {
    setCreateDate(dateStr || '')
    setSelectMultiDays(false)
    setSelectedDays([])
    setFormName(''); setFormStart(''); setFormEnd(''); setFormTpl(''); setFormNote('')
    setCreateErr(null)
    setShowCreate(true)
  }

  // bulk create state
  const [selectMultiDays, setSelectMultiDays] = useState(false)
  const [selectedDays, setSelectedDays] = useState([])

  function toggleDaySelection(dayStr) {
    setSelectedDays(prev => prev.includes(dayStr) ? prev.filter(d => d !== dayStr) : [...prev, dayStr])
  }

  function handleTplChange(v) {
    setFormTpl(v)
    if (v) {
      const t = templates.find(t => String(t.id) === v)
      if (t) { setFormName(t.name || ''); setFormStart(fmtTime(t.startTime)); setFormEnd(fmtTime(t.endTime)) }
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!selectMultiDays && !createDate) { setCreateErr('Chọn ngày'); return }
    if (selectMultiDays && selectedDays.length === 0) { setCreateErr('Chọn ít nhất một ngày'); return }
    if (!formTpl && (!formStart || !formEnd)) { setCreateErr('Nhập giờ bắt đầu và kết thúc'); return }
    
    setCreating(true); setCreateErr(null)
    try {
      if (selectMultiDays) {
        // Bulk Create
        const requests = selectedDays.map(dateStr => {
          const payload = { date: dateStr, name: formName.trim() || null, note: formNote.trim() || null }
          if (formTpl) { payload.templateId = Number(formTpl) }
          else { payload.startTime = formStart + ':00'; payload.endTime = formEnd + ':00' }
          return payload
        })
        await createShiftsBulk(groupId, requests)
      } else {
        // Single Create
        const payload = { name: formName.trim() || null, date: createDate, note: formNote.trim() || null }
        if (formTpl) { payload.templateId = Number(formTpl) }
        else { payload.startTime = formStart + ':00'; payload.endTime = formEnd + ':00' }
        await createShift(groupId, payload)
      }
      setShowCreate(false)
      await loadData()
    } catch (err) { setCreateErr(err?.message || 'Không thể tạo ca') }
    finally { setCreating(false) }
  }

  async function handleDeleteShift(shiftId) {
    if (!window.confirm('Bạn có chắc chắn muốn xóa ca làm việc này? Các phân công và đăng ký liên quan cũng sẽ bị xóa.')) return
    try {
      await deleteShift(groupId, shiftId)
      setSelShift(null)
      loadData()
    } catch (err) {
      alert(err.message || 'Lỗi khi xóa ca làm việc')
    }
  }

  /* ───── requirements ───── */
  async function openReqs(shift) {
    setSelShift(shift)
    setActiveTab('requirements')
    setLoadingReqs(true); setReqErr(null); setReqPos(''); setReqQty(1)
    setPendingRegs([]); setAssignUserId(''); setAssignPosId(''); setAssignNote(''); setAssignErr(null)
    try {
      const r = await getRequirements(shift.id)
      setReqs(unwrapApiArray(r))
    } catch { setReqs(shift.requirements || []) }
    finally { setLoadingReqs(false) }

    // Load pending registrations + members for manager
    if (isManager) {
      setLoadingPending(true)
      try {
        const [pRes, mRes] = await Promise.all([
          getPendingRegistrations(shift.id),
          getGroupMembers(groupId).catch(() => []),
        ])
        setPendingRegs(unwrapApiArray(pRes))
        setMembers(unwrapApiArray(mRes).filter((m) => m.status === 'APPROVED'))
      } catch { setPendingRegs([]); setMembers([]) }
      finally { setLoadingPending(false) }
    }
  }

  async function handleAddReq(e) {
    e.preventDefault()
    if (!reqPos) { setReqErr('Chọn vị trí'); return }
    setAddingReq(true); setReqErr(null)
    try {
      await createRequirement(selShift.id, { positionId: Number(reqPos), quantity: Number(reqQty) })
      const r = await getRequirements(selShift.id)
      setReqs(unwrapApiArray(r))
      setReqPos(''); setReqQty(1)
      await loadData() // refresh calendar
    } catch (err) { setReqErr(err?.message || 'Lỗi') }
    finally { setAddingReq(false) }
  }

  async function handleDelReq(id) {
    try {
      await deleteRequirement(selShift.id, id)
      setReqs(p => p.filter(r => r.id !== id))
      await loadData()
    } catch (err) { alert(err?.message || 'Lỗi') }
  }

  /* ───── B14: approve registration ───── */
  async function handleApprove(regId) {
    setActioningId(regId)
    try {
      await approveRegistration(regId, null)
      showRegToast('Đã duyệt đăng ký')
      setPendingRegs(prev => prev.filter(r => r.id !== regId))
      await loadData()
    } catch (err) { alert(err?.message || 'Không thể duyệt') }
    finally { setActioningId(null) }
  }

  /* ───── B15: reject registration ───── */
  async function handleReject(regId) {
    const reason = prompt('Lý do từ chối (tùy chọn):')
    if (reason === null) return // cancelled
    setActioningId(regId)
    try {
      await rejectRegistration(regId, reason || 'Không phù hợp')
      showRegToast('Đã từ chối đăng ký')
      setPendingRegs(prev => prev.filter(r => r.id !== regId))
    } catch (err) { alert(err?.message || 'Không thể từ chối') }
    finally { setActioningId(null) }
  }

  /* ───── B16: assign shift ───── */
  async function handleAssign(e) {
    e.preventDefault()
    if (!assignUserId || !assignPosId) { setAssignErr('Chọn nhân viên và vị trí'); return }
    setAssigning(true); setAssignErr(null)
    try {
      await assignShift(selShift.id, Number(assignUserId), Number(assignPosId), assignNote.trim() || null)
      showRegToast('Đã gán nhân viên vào ca')
      setAssignUserId(''); setAssignPosId(''); setAssignNote('')
      await loadData()
    } catch (err) { setAssignErr(err?.message || 'Không thể gán nhân viên') }
    finally { setAssigning(false) }
  }

  function getMemberName(userId) {
    const m = members.find(m => String(m.userId) === String(userId))
    return m?.fullName || m?.username || `NV #${userId}`
  }

  function getPositionName(posId) {
    const p = positions.find(p => String(p.id) === String(posId))
    return p?.name || `Vị trí #${posId}`
  }

  /* ───── render ───── */
  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <ShiftsHeader isManager={isManager} onCreate={() => openCreateForDate(toISO(new Date()))} />

      {/* Week navigation */}
      <WeekNavigator
        label={`${MONTH_NAMES[weekStart.getMonth()]} ${weekStart.getDate()} — ${MONTH_NAMES[weekEnd.getMonth()]} ${weekEnd.getDate()}, ${weekEnd.getFullYear()}`}
        onPrev={goPrevWeek}
        onNext={goNextWeek}
        onToday={goCurrentWeek}
      />

      {loading && <LoadingState />}
      <ErrorAlert message={error} />

      {!loading && !error && (
        <ShiftsWeekGrid
          weekDays={weekDays}
          toISO={toISO}
          shiftsByDate={shiftsByDate}
          isManager={isManager}
          selShift={selShift}
          pendingCountsByShiftId={pendingCountsByShiftId}
          myRegStatusByShiftId={myRegStatusByShiftId}
          onOpenCreateForDate={openCreateForDate}
          onOpenReqs={openReqs}
          onRegisterClick={handleRegisterClick}
        />
      )}

      <ShiftsRegistrationToast message={regToast} onClose={() => setRegToast(null)} />

      <ShiftRegistrationModal
        open={!!regShift}
        shift={regShift}
        regErr={regErr}
        regPosId={regPosId}
        setRegPosId={setRegPosId}
        regNote={regNote}
        setRegNote={setRegNote}
        registering={registering}
        onClose={() => setRegShift(null)}
        onSubmit={handleRegisterSubmit}
        loadingMyPos={loadingMyPos}
        myPositions={myPositions}
      />

      {!loading && !error && <ShiftsSummaryCards shifts={shifts} />}

      <ShiftDetailsPanel
        selShift={selShift}
        isManager={isManager}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingRegs={pendingRegs}
        positions={positions}
        reqs={reqs}
        loadingReqs={loadingReqs}
        reqErr={reqErr}
        reqPos={reqPos}
        reqQty={reqQty}
        addingReq={addingReq}
        loadingPending={loadingPending}
        actioningId={actioningId}
        members={members}
        assignErr={assignErr}
        assignUserId={assignUserId}
        assignPosId={assignPosId}
        assignNote={assignNote}
        assigning={assigning}
        onClose={() => setSelShift(null)}
        onDeleteShift={handleDeleteShift}
        onOpenLockShift={() => setLockShiftModalShift(selShift)}
        onSetRecommendModalState={setRecommendModalState}
        onDelReq={handleDelReq}
        onAddReq={handleAddReq}
        setReqPos={setReqPos}
        setReqQty={setReqQty}
        onApprove={handleApprove}
        onReject={handleReject}
        onAssign={handleAssign}
        setAssignUserId={setAssignUserId}
        setAssignPosId={setAssignPosId}
        setAssignNote={setAssignNote}
        getMemberName={getMemberName}
        getPositionName={getPositionName}
      />

      <ShiftCreateModal
        open={showCreate}
        createErr={createErr}
        templates={templates}
        formTpl={formTpl}
        formName={formName}
        formStart={formStart}
        formEnd={formEnd}
        formNote={formNote}
        selectMultiDays={selectMultiDays}
        createDate={createDate}
        weekDays={weekDays}
        selectedDays={selectedDays}
        creating={creating}
        toISO={toISO}
        onClose={() => setShowCreate(false)}
        onSubmit={handleCreate}
        onTplChange={handleTplChange}
        setFormName={setFormName}
        setFormStart={setFormStart}
        setFormEnd={setFormEnd}
        setFormNote={setFormNote}
        setCreateDate={setCreateDate}
        setSelectMultiDays={setSelectMultiDays}
        onToggleDaySelection={toggleDaySelection}
      />

      <ShiftLockModal
        open={!!lockShiftModalShift}
        onClose={() => setLockShiftModalShift(null)}
        groupId={groupId}
        shift={lockShiftModalShift}
        onLocked={async () => {
          setLockShiftModalShift(null)
          setSelShift(null)
          await loadData()
          showRegToast('Đã khóa ca làm việc')
        }}
      />

      <ShiftRecommendationsModal
        open={!!recommendModalState}
        onClose={() => setRecommendModalState(null)}
        groupId={groupId}
        shift={recommendModalState?.shift}
        position={recommendModalState?.position}
        onAssigned={async () => {
          setRecommendModalState(null)
          setSelShift(null)
          await loadData()
          showRegToast('Đã gán nhân viên vào ca')
        }}
      />
    </div>
  )
}
