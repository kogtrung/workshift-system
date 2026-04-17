export function ShiftRegistrationModal({
  open,
  shift,
  regErr,
  regPosId,
  setRegPosId,
  regNote,
  setRegNote,
  registering,
  onClose,
  onSubmit,
  loadingMyPos,
  myPositions,
}) {
  if (!open || !shift) return null

  const fmtTime = (t) => (t ? String(t).substring(0, 5) : '—')
  const shiftReqs = shift.requirements || []
  const myPosIds = new Set(myPositions.map((p) => Number(p.id ?? p.positionId)).filter((n) => Number.isFinite(n)))
  const availablePositions = shiftReqs.filter((r) => myPosIds.has(Number(r.positionId)))

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center modal-overlay" onClick={onClose}>
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg mx-4 animate-[fadeIn_0.2s_ease-out]" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 pt-6 pb-4 border-b border-outline/10 flex items-center justify-between">
          <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">how_to_reg</span>
            Đăng ký ca làm việc
          </h3>
          <button onClick={onClose} className="p-1.5 text-on-surface-variant hover:bg-surface-container-high rounded-lg">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-5">
          <div className="bg-primary-container/10 rounded-xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-xl">calendar_month</span>
            </div>
            <div>
              <p className="text-base font-bold text-on-surface">{shift.name || 'Ca'}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {shift.date} · {fmtTime(shift.startTime)} – {fmtTime(shift.endTime)}
              </p>
            </div>
          </div>

          {regErr && <div className="bg-error-container/20 text-on-error-container rounded-lg p-3 text-sm">{regErr}</div>}

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
              Vị trí đăng ký <span className="text-error">*</span>
            </label>
            {loadingMyPos ? (
              <p className="text-on-surface-variant animate-pulse py-3">Đang tải vị trí...</p>
            ) : myPositions.length === 0 ? (
              <div className="bg-amber-50 text-amber-800 rounded-xl p-4 text-sm">Bạn chưa khai báo vị trí nào.</div>
            ) : shiftReqs.length === 0 ? (
              <div className="bg-amber-50 text-amber-800 rounded-xl p-4 text-sm">Ca này chưa cấu hình nhu cầu nhân sự.</div>
            ) : availablePositions.length === 0 ? (
              <div className="bg-amber-50 text-amber-800 rounded-xl p-4 text-sm">Không có vị trí phù hợp với vị trí bạn đã khai báo.</div>
            ) : (
              <select
                value={regPosId}
                onChange={(e) => setRegPosId(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl border border-outline/20 text-on-surface"
              >
                <option value="">— Chọn vị trí —</option>
                {availablePositions.map((r) => (
                  <option key={r.positionId} value={r.positionId}>
                    {r.positionName} (cần {r.quantity} người)
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Ghi chú</label>
            <textarea
              value={regNote}
              onChange={(e) => setRegNote(e.target.value)}
              placeholder="Ghi chú cho manager..."
              rows={2}
              className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl border border-outline/20 text-on-surface resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-on-surface-variant font-semibold rounded-lg hover:bg-surface-container-high">
              Hủy
            </button>
            <button type="submit" disabled={registering || !regPosId} className="px-5 py-2.5 bg-primary text-on-primary font-semibold rounded-lg disabled:opacity-50">
              {registering ? 'Đang đăng ký...' : 'Đăng ký ca'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
