import { useEffect, useState } from 'react'
import { useParams, useOutletContext } from 'react-router-dom'
import { unwrapApiResponse } from '../api/apiClient'
import { useAuth } from '../states/auth/AuthContext'
import { getGroupMembers } from '../services/groups/groupApi'
import { getMyAvailability } from '../services/availability/availabilityApi'
import { getMyCalendar } from '../services/calendar/calendarApi'
import { getPositions } from '../services/positions/positionApi'
import { getMyPositions, updateMyPositions } from '../services/memberPosition/memberPositionApi'
import { ProfilePageHeader } from '../components/profile/ProfilePageHeader'
import { ProfileStatsCards } from '../components/profile/ProfileStatsCards'
import { ProfileUserCard } from '../components/profile/ProfileUserCard'
import { ProfilePositionsCard } from '../components/profile/ProfilePositionsCard'
import { ProfileAvailabilityCard } from '../components/profile/ProfileAvailabilityCard'
import { ProfileRecentShiftsCard } from '../components/profile/ProfileRecentShiftsCard'

function calcApprovedHours(approvedShifts) {
  let total = 0
  approvedShifts.forEach((s) => {
    if (s.startTime && s.endTime) {
      const [sh, sm] = String(s.startTime).split(':').map(Number)
      const [eh, em] = String(s.endTime).split(':').map(Number)
      total += (eh * 60 + em - sh * 60 - sm) / 60
    }
  })
  return total.toFixed(1)
}

function asArrayFromApi(res) {
  try {
    const u = unwrapApiResponse(res)
    return Array.isArray(u) ? u : []
  } catch {
    return []
  }
}

function mapCalendarItems(rawItems) {
  return (Array.isArray(rawItems) ? rawItems : []).map((item) => ({
    ...item,
    registrationStatus: item.registrationStatus ?? item.status ?? 'PENDING',
    shiftName: item.shiftName ?? item.name ?? null,
  }))
}

export function ProfilePage() {
  const { groupId } = useParams()
  const { isManager, groupInfo } = useOutletContext() || {}
  const { user } = useAuth()

  const [memberInfo, setMemberInfo] = useState(null)
  const [availability, setAvailability] = useState([])
  const [recentShifts, setRecentShifts] = useState([])
  const [allPositions, setAllPositions] = useState([])
  const [myPositionIds, setMyPositionIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [savingPos, setSavingPos] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true); setError(null)

    Promise.all([
      getGroupMembers(groupId).catch(() => []),
      getMyAvailability().catch(() => []),
      getMyCalendar({ range: 'month' }).catch(() => []),
      getPositions(groupId).catch(() => []),
      getMyPositions(groupId).catch(() => []),
    ]).then(([membersRes, availRes, calRes, posRes, myPosRes]) => {
      if (cancelled) return
      const members = asArrayFromApi(membersRes)
      const me = members.find(m => String(m.userId) === String(user?.id))
      setMemberInfo(me || null)

      setAvailability(asArrayFromApi(availRes))

      let calItems = []
      try {
        const inner = unwrapApiResponse(calRes)
        const raw = Array.isArray(inner) ? inner : (inner?.items ?? [])
        calItems = mapCalendarItems(raw)
      } catch {
        calItems = []
      }
      setRecentShifts(calItems.filter(c => (c.registrationStatus ?? c.status) === 'APPROVED'))

      setAllPositions(asArrayFromApi(posRes))

      const myPos = asArrayFromApi(myPosRes)
      setMyPositionIds(myPos.map(p => p.id ?? p.positionId).filter((id) => id != null))
    }).catch(err => {
      if (!cancelled) setError(err?.message || 'Không thể tải thông tin')
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })

    return () => { cancelled = true }
  }, [groupId, user?.id])

  function togglePosition(posId) {
    setMyPositionIds(prev =>
      prev.includes(posId)
        ? prev.filter(id => id !== posId)
        : [...prev, posId]
    )
  }

  async function handleSavePositions() {
    setSavingPos(true); setError(null)
    try {
      await updateMyPositions(groupId, myPositionIds)
      setToast('Cập nhật vị trí thành công!')
      setTimeout(() => setToast(null), 3000)
    } catch (err) {
      setError(err?.message || 'Không thể lưu vị trí')
    } finally { setSavingPos(false) }
  }

  const approvedShifts = recentShifts

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <ProfilePageHeader />

      {loading && <div className="text-center py-12"><p className="text-on-surface-variant animate-pulse">Đang tải...</p></div>}
      {error && <div className="bg-error-container/20 text-on-error-container rounded-xl p-4 text-center">{error}</div>}
      {toast && (
        <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl p-4 text-sm flex items-center gap-3 animate-[fadeIn_0.2s_ease-out]">
          <span className="material-symbols-outlined">check_circle</span>
          <span className="font-medium">{toast}</span>
          <button onClick={() => setToast(null)} className="ml-auto p-1 hover:bg-emerald-100 rounded-lg">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <ProfileUserCard user={user} isManager={isManager} groupInfo={groupInfo} groupId={groupId} memberInfo={memberInfo} />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <ProfileStatsCards
              approvedShiftsCount={approvedShifts.length}
              myPositionCount={myPositionIds.length}
              availabilityCount={availability.length}
              totalHours={calcApprovedHours(approvedShifts)}
            />
            <ProfilePositionsCard
              allPositions={allPositions}
              myPositionIds={myPositionIds}
              savingPos={savingPos}
              onTogglePosition={togglePosition}
              onSavePositions={handleSavePositions}
            />
            <ProfileAvailabilityCard availability={availability} />
            <ProfileRecentShiftsCard approvedShifts={approvedShifts} />
          </div>
        </div>
      )}
    </div>
  )
}
