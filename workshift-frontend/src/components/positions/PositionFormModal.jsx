export function PositionFormModal({
  open,
  editingId,
  formError,
  formName,
  formColor,
  submitting,
  presetColors,
  onClose,
  onSubmit,
  setFormName,
  setFormColor,
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center modal-overlay" onClick={onClose}>
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-md mx-4 p-0 animate-[fadeIn_0.2s_ease-out]" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 pt-6 pb-4 border-b border-outline/10">
          <h3 className="text-xl font-bold text-on-surface">{editingId ? 'Chỉnh sửa vị trí' : 'Thêm vị trí mới'}</h3>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-5">
          {formError && <div className="bg-error-container/20 text-on-error-container rounded-lg p-3 text-sm">{formError}</div>}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Tên vị trí <span className="text-error">*</span></label>
            <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="VD: Pha chế, Thu ngân, Phục vụ..." className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl border border-outline/20 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" autoFocus />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Màu hiển thị</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {presetColors.map((c) => (
                <button key={c} type="button" onClick={() => setFormColor(c)} className={`w-8 h-8 rounded-lg transition-all ${formColor === c ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface scale-110' : 'hover:scale-105'}`} style={{ backgroundColor: c }} />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <input type="color" value={formColor} onChange={(e) => setFormColor(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent" />
              <input type="text" value={formColor} onChange={(e) => setFormColor(e.target.value)} className="flex-1 px-3 py-2 bg-surface-container-lowest rounded-lg border border-outline/20 text-sm font-mono text-on-surface focus:outline-none focus:border-primary transition-all" />
              <div className="w-10 h-10 rounded-lg shadow-inner border border-outline/10" style={{ backgroundColor: formColor }} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-on-surface-variant font-semibold rounded-lg hover:bg-surface-container-high transition-colors">Hủy</button>
            <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-primary text-on-primary font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-md disabled:opacity-50">
              {submitting ? 'Đang lưu...' : (editingId ? 'Cập nhật' : 'Tạo mới')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
