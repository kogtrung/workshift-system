export function CancelRegistrationModal({
  open,
  cancelItem,
  cancelReason,
  setCancelReason,
  cancelling,
  onClose,
  onSubmit,
}) {
  if (!open || !cancelItem) return null

  const fmtTime = (t) => (t ? String(t).substring(0, 5) : '—')

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center modal-overlay" onClick={onClose}>
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-[fadeIn_0.2s_ease-out]" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 pt-6 pb-4 border-b border-outline/10 flex items-center justify-between">
          <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-error">event_busy</span>
            Hủy đăng ký ca
          </h3>
          <button onClick={onClose} className="p-1.5 text-on-surface-variant hover:bg-surface-container-high rounded-lg">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-5">
          <div className="bg-error-container/10 border border-error/20 rounded-xl p-4">
            <p className="text-sm font-bold text-on-surface">{cancelItem.shiftName || 'Ca'}</p>
            <p className="text-xs text-on-surface-variant mt-1">
              {cancelItem.date} · {fmtTime(cancelItem.startTime)} – {fmtTime(cancelItem.endTime)}
            </p>
            {cancelItem.positionName && <p className="text-xs text-on-surface-variant mt-1">📋 {cancelItem.positionName}</p>}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">Sau khi hủy, bạn có thể cần đăng ký lại và chờ duyệt.</div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Lý do hủy</label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Nhập lý do (tùy chọn)..."
              rows={2}
              className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl border border-outline/20 text-on-surface resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-on-surface-variant font-semibold rounded-lg hover:bg-surface-container-high">
              Quay lại
            </button>
            <button type="submit" disabled={cancelling} className="px-5 py-2.5 bg-error text-on-error font-semibold rounded-lg disabled:opacity-50">
              {cancelling ? 'Đang hủy...' : 'Xác nhận hủy'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
