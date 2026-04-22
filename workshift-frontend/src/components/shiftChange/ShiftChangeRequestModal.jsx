import { useEffect, useMemo, useState } from 'react'
import { Modal } from '../common/Modal'
import { createShiftChangeRequest } from '../../services/shiftChange/shiftChangeApi'
import { shiftFitsMemberAvailabilitySlots, shiftHasRequirementForPosition } from '../../utils/shiftAvailability'
import { weekdayLabelViFromIsoDate } from '../../utils/dateUtils'

function fmtTime(t) {
  if (!t) return '—'
  return String(t).substring(0, 5)
}

const DAY_SHORT = [null, 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

function normalizeDateTimeKey(shiftLike) {
  const date = shiftLike?.date ? String(shiftLike.date) : null
  const start = shiftLike?.startTime ? fmtTime(shiftLike.startTime) : null
  const end = shiftLike?.endTime ? fmtTime(shiftLike.endTime) : null
  return date && start && end ? `${date}|${start}|${end}` : null
}

export function ShiftChangeRequestModal({
  open,
  onClose,
  groupId,
  fromItem,
  availableShifts,
  availabilitySlots = [],
  myPositions = [],
  onCreated,
}) {
  const [toShiftId, setToShiftId] = useState('')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const fromPositionId = fromItem?.positionId != null ? Number(fromItem.positionId) : Number.NaN
  const fromPosOk = Number.isFinite(fromPositionId)

  const myPosIds = useMemo(
    () =>
      new Set(
        (Array.isArray(myPositions) ? myPositions : [])
          .map((p) => Number(p.id ?? p.positionId))
          .filter((n) => Number.isFinite(n)),
      ),
    [myPositions],
  )

  const eligibleToShifts = useMemo(() => {
    if (!Array.isArray(availableShifts) || !fromItem || !fromPosOk) return []
    const currentKey = normalizeDateTimeKey(fromItem)
    return availableShifts
      .filter((s) => s?.status === 'OPEN')
      .filter((s) => normalizeDateTimeKey(s) !== currentKey)
      .filter((s) => shiftHasRequirementForPosition(s, fromPositionId))
      .filter((s) => shiftFitsMemberAvailabilitySlots(s, availabilitySlots))
  }, [availableShifts, fromItem, fromPosOk, fromPositionId, availabilitySlots])

  useEffect(() => {
    if (!open) return
    setError(null)
    setReason('')
    const first = eligibleToShifts[0]
    setToShiftId(first ? String(first.id) : '')
  }, [open, eligibleToShifts])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!fromItem?.registrationId || fromItem?.shiftId == null) {
      setError('Không tìm thấy ca đăng ký gốc')
      return
    }
    if (!toShiftId) {
      setError('Chọn ca đích')
      return
    }
    if (myPosIds.size > 0 && fromPosOk && !myPosIds.has(fromPositionId)) {
      setError('Vị trí ca này không nằm trong danh sách vị trí bạn đã khai báo trong nhóm')
      return
    }

    setSaving(true)
    setError(null)
    try {
      await createShiftChangeRequest(groupId, {
        fromShiftId: Number(fromItem.shiftId),
        toShiftId: Number(toShiftId),
        reason: reason.trim() || null,
      })
      onCreated?.()
    } catch (err) {
      setError(err?.message || 'Không thể tạo yêu cầu đổi ca')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} maxWidthClass="max-w-2xl">
      <div className="px-6 pt-6 pb-4 border-b border-outline/10 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">swap_horiz</span>
            Yeu cau doi ca
          </h3>
          <p className="text-xs text-on-surface-variant mt-1">
            Tu: {fromItem?.date} · {fmtTime(fromItem?.startTime)} - {fmtTime(fromItem?.endTime)}
          </p>
        </div>
        <button onClick={onClose} className="p-1.5 text-on-surface-variant hover:bg-surface-container-high rounded-lg" type="button">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <form className="p-6 space-y-4" onSubmit={handleSubmit}>
        {error ? <div className="bg-error-container/20 text-on-error-container rounded-xl p-3 text-sm">{error}</div> : null}
        <select
          value={toShiftId}
          onChange={(e) => setToShiftId(e.target.value)}
          className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl border border-outline/20"
        >
          {eligibleToShifts.length === 0 ? <option value="">{!availabilitySlots?.length ? 'Khai bao lich ranh truoc' : 'Khong co ca phu hop'}</option> : null}
          {eligibleToShifts.map((s) => {
            const dow = weekdayLabelViFromIsoDate(s.date)
            return (
              <option key={s.id} value={s.id}>
                {dow ? `${dow} · ` : ''}
                {s.date} · {s.name || 'Ca'} · {fmtTime(s.startTime)}-{fmtTime(s.endTime)}
              </option>
            )
          })}
        </select>

        {!availabilitySlots?.length ? (
          <div className="rounded-xl bg-amber-50 text-amber-900 text-sm px-4 py-3">Ban chua khai bao lich ranh.</div>
        ) : (
          <ul className="text-xs text-on-surface-variant">
            {[...availabilitySlots]
              .sort((a, b) => Number(a.dayOfWeek) - Number(b.dayOfWeek))
              .map((s) => (
                <li key={`${s.id ?? s.dayOfWeek}-${s.startTime}-${s.endTime}`}>
                  {(DAY_SHORT[Number(s.dayOfWeek)] || s.dayOfWeek)} · {fmtTime(s.startTime)} - {fmtTime(s.endTime)}
                </li>
              ))}
          </ul>
        )}

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Nhap ly do doi ca..."
          rows={3}
          className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl border border-outline/20"
        />

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-on-surface-variant font-semibold rounded-lg">
            Huy
          </button>
          <button
            type="submit"
            disabled={saving || !toShiftId || !availabilitySlots?.length || (myPosIds.size > 0 && fromPosOk && !myPosIds.has(fromPositionId))}
            className="px-5 py-2.5 bg-primary text-on-primary font-semibold rounded-lg disabled:opacity-50"
          >
            {saving ? 'Dang gui...' : 'Gui yeu cau'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
