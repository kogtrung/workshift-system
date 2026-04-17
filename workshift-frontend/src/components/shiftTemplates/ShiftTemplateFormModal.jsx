export function ShiftTemplateFormModal({
  show,
  editingId,
  formError,
  formName,
  formStart,
  formEnd,
  formDesc,
  formReqs,
  positions,
  submitting,
  onClose,
  onSubmit,
  setFormName,
  setFormStart,
  setFormEnd,
  setFormDesc,
  setFormReqs,
}) {
  if (!show) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center modal-overlay" onClick={onClose}>
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-md mx-4 p-0 animate-[fadeIn_0.2s_ease-out]" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 pt-6 pb-4 border-b border-outline/10">
          <h3 className="text-xl font-bold text-on-surface">{editingId ? 'Chỉnh sửa ca mẫu' : 'Thêm ca mẫu mới'}</h3>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-5">
          {formError && <div className="bg-error-container/20 text-on-error-container rounded-lg p-3 text-sm">{formError}</div>}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
              Tên ca mẫu <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="VD: Ca Sáng, Ca Chiều, Ca Tối..."
              className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl border border-outline/20 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                Bắt đầu <span className="text-error">*</span>
              </label>
              <input type="time" value={formStart} onChange={(e) => setFormStart(e.target.value)} className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl border border-outline/20 text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                Kết thúc <span className="text-error">*</span>
              </label>
              <input type="time" value={formEnd} onChange={(e) => setFormEnd(e.target.value)} className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl border border-outline/20 text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Mô tả</label>
            <textarea
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder="Mô tả ca mẫu (tùy chọn)..."
              rows={3}
              className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl border border-outline/20 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Nhu cầu nhân sự mặc định</label>
            <div className="space-y-2">
              {formReqs.map((req, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <select
                    value={req.positionId}
                    onChange={e => {
                      const updated = [...formReqs]
                      updated[idx].positionId = Number(e.target.value)
                      setFormReqs(updated)
                    }}
                    className="flex-1 px-3 py-2 bg-surface-container-lowest rounded-lg border border-outline/20 text-on-surface text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="">Chọn vị trí</option>
                    {positions.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={req.quantity}
                    onChange={e => {
                      const updated = [...formReqs]
                      updated[idx].quantity = Number(e.target.value)
                      setFormReqs(updated)
                    }}
                    className="w-16 px-3 py-2 bg-surface-container-lowest rounded-lg border border-outline/20 text-on-surface text-sm text-center focus:outline-none focus:border-primary"
                  />
                  <button type="button" onClick={() => setFormReqs(formReqs.filter((_, i) => i !== idx))} className="p-1.5 text-error hover:bg-error/10 rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => setFormReqs([...formReqs, { positionId: '', quantity: 1 }])} className="w-full px-3 py-2 border border-dashed border-outline/30 rounded-lg text-xs font-bold text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-sm">add</span>
                Thêm nhu cầu
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-on-surface-variant font-semibold rounded-lg hover:bg-surface-container-high transition-colors">
              Hủy
            </button>
            <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-primary text-on-primary font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-md disabled:opacity-50">
              {submitting ? 'Đang lưu...' : (editingId ? 'Cập nhật' : 'Tạo mới')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
