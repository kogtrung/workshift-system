export function SalaryConfigFormModal({
  show,
  formErr,
  formType,
  formPosId,
  formUserId,
  formRate,
  formDate,
  positions,
  members,
  saving,
  onClose,
  onSubmit,
  setFormType,
  setFormPosId,
  setFormUserId,
  setFormRate,
  setFormDate,
}) {
  if (!show) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center modal-overlay" onClick={onClose}>
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg mx-4 animate-[fadeIn_0.2s_ease-out]" onClick={e => e.stopPropagation()}>
        <div className="px-6 pt-6 pb-4 border-b border-outline/10 flex items-center justify-between">
          <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">payments</span>
            Thêm cấu hình lương
          </h3>
          <button onClick={onClose} className="p-1.5 text-on-surface-variant hover:bg-surface-container-high rounded-lg">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-5">
          {formErr && <div className="bg-error-container/20 text-on-error-container rounded-lg p-3 text-sm">{formErr}</div>}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Loại cấu hình</label>
            <div className="flex bg-surface-container rounded-xl p-1">
              <button type="button" onClick={() => setFormType('position')} className={`flex-1 px-4 py-2 text-sm font-bold rounded-lg transition-all ${formType === 'position' ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant'}`}>
                Theo vị trí
              </button>
              <button type="button" onClick={() => setFormType('user')} className={`flex-1 px-4 py-2 text-sm font-bold rounded-lg transition-all ${formType === 'user' ? 'bg-primary text-on-primary shadow-md' : 'text-on-surface-variant'}`}>
                Theo nhân viên
              </button>
            </div>
          </div>

          {formType === 'position' ? (
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                Vị trí <span className="text-error">*</span>
              </label>
              <select value={formPosId} onChange={e => setFormPosId(e.target.value)} className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl border border-outline/20 text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                <option value="">— Chọn vị trí —</option>
                {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                Nhân viên <span className="text-error">*</span>
              </label>
              <select value={formUserId} onChange={e => setFormUserId(e.target.value)} className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl border border-outline/20 text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                <option value="">— Chọn nhân viên —</option>
                {members.map(m => <option key={m.userId} value={m.userId}>{m.fullName || m.username}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
              Mức lương / giờ (VNĐ) <span className="text-error">*</span>
            </label>
            <input type="number" min="0" step="1000" value={formRate} onChange={e => setFormRate(e.target.value)} placeholder="VD: 50000" className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl border border-outline/20 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
              Ngày áp dụng <span className="text-error">*</span>
            </label>
            <input type="date" value={formDate} onChange={e => setFormDate(e.target.value)} className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl border border-outline/20 text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-on-surface-variant font-semibold rounded-lg hover:bg-surface-container-high transition-colors">Hủy</button>
            <button type="submit" disabled={saving} className="px-5 py-2.5 bg-primary text-on-primary font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-md disabled:opacity-50">
              {saving ? 'Đang lưu...' : 'Tạo cấu hình'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
