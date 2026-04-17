import { useEffect, useMemo, useState } from 'react'
import { Modal } from '../common/Modal'
import { getShiftRecommendations } from '../../services/recommendations/recommendationApi'
import { assignShift } from '../../services/registrations/registrationApi'
import { unwrapApiArray } from '../../api/apiClient'

function fmtTime(t) {
  if (!t) return '—'
  return String(t).substring(0, 5)
}

export function ShiftRecommendationsModal({ open, onClose, groupId, shift, position, onAssigned }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [assigningUserId, setAssigningUserId] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [reloadTick, setReloadTick] = useState(0)

  const positionId = position?.positionId
  const positionName = position?.positionName

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!open || !shift?.id || !groupId || !positionId) return
      setLoading(true)
      setError(null)
      setCandidates([])
      try {
        const res = await getShiftRecommendations(groupId, shift.id, positionId)
        if (!cancelled) setCandidates(unwrapApiArray(res))
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Không thể tải gợi ý')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [open, groupId, shift?.id, positionId, reloadTick])

  const emptyStateText = useMemo(() => {
    if (!loading && !error && candidates.length === 0) return 'Không có nhân viên phù hợp cho vị trí này.'
    return null
  }, [loading, error, candidates.length])

  async function handleAssign(userId) {
    if (!shift?.id || !positionId) return
    setAssigningUserId(userId)
    setError(null)
    try {
      await assignShift(shift.id, userId, positionId, null)
      onAssigned?.()
    } catch (err) {
      setError(err?.message || 'Không thể gán nhân viên')
    } finally {
      setAssigningUserId(null)
    }
  }

  return (
    <Modal open={open} onClose={onClose} maxWidthClass="max-w-2xl">
      <div className="px-6 pt-6 pb-4 border-b border-outline/10 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-on-surface">Gợi ý nhân viên</h3>
          <p className="text-xs text-on-surface-variant mt-1">
            {shift?.date} · {fmtTime(shift?.startTime)} - {fmtTime(shift?.endTime)}
          </p>
          {positionName ? <p className="text-xs text-on-surface-variant mt-1">Vị trí: <strong className="text-on-surface">{positionName}</strong></p> : null}
        </div>
        <button onClick={onClose} className="p-1.5 text-on-surface-variant hover:bg-surface-container-high rounded-lg" type="button">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div className="p-6 space-y-4">
        {error ? <div className="bg-error-container/20 text-on-error-container rounded-xl p-3 text-sm">{error}</div> : null}
        {loading ? <div className="text-on-surface-variant animate-pulse text-sm py-6 text-center">Đang tải...</div> : null}
        {!loading && emptyStateText ? (
          <div className="bg-surface-container-lowest rounded-xl border border-dashed border-outline/20 p-4 text-sm">
            <div className="font-semibold text-on-surface">{emptyStateText}</div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setReloadTick((v) => v + 1)} className="px-4 py-2 bg-surface-container-highest rounded-lg">
                Thử lại
              </button>
            </div>
          </div>
        ) : null}
        {!loading && !emptyStateText ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {candidates.map((c) => (
              <div key={c.userId} className="bg-surface-container-lowest rounded-2xl border border-outline/10 p-4">
                <p className="font-bold text-on-surface truncate">{c.fullName || c.username}</p>
                <p className="text-xs text-on-surface-variant truncate">@{c.username}</p>
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleAssign(c.userId)}
                    disabled={assigningUserId === c.userId}
                    className="px-4 py-2 bg-primary text-on-primary font-bold rounded-xl disabled:opacity-50"
                  >
                    {assigningUserId === c.userId ? 'Đang gán...' : 'Gán vào ca'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </Modal>
  )
}
