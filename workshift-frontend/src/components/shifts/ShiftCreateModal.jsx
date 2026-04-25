function fmtTime(t) { return t ? String(t).substring(0, 5) : '—' }
const DAY_LABELS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN']

export function ShiftCreateModal({
  open,
  createErr,
  templates,
  formTpl,
  formName,
  formStart,
  formEnd,
  formNote,
  selectMultiDays,
  createDate,
  weekDays,
  selectedDays,
  creating,
  toISO,
  onClose,
  onSubmit,
  onTplChange,
  setFormName,
  setFormStart,
  setFormEnd,
  setFormNote,
  setCreateDate,
  setSelectMultiDays,
  onToggleDaySelection,
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center modal-overlay" onClick={onClose}>
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg mx-4 animate-[fadeIn_0.2s_ease-out]" onClick={e => e.stopPropagation()}>
        <div className="px-6 pt-6 pb-4 border-b border-outline/10 flex items-center justify-between">
          <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">event_available</span>
            Tạo ca làm việc mới
          </h3>
          <button onClick={onClose} className="p-1.5 text-on-surface-variant hover:bg-surface-container-high rounded-lg">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-5">
          {createErr && <div className="bg-error-container/20 text-on-error-container rounded-lg p-3 text-sm">{createErr}</div>}

          {templates.length > 0 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Ca mẫu (tùy chọn)</label>
              <select value={formTpl} onChange={e => onTplChange(e.target.value)} className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl border border-outline/20 text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                <option value="">— Nhập thủ công —</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.name} ({fmtTime(t.startTime)} – {fmtTime(t.endTime)})</option>)}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Tên ca</label>
              <input type="text" value={formName} onChange={e => setFormName(e.target.value)} placeholder="VD: Ca Sáng" className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl border border-outline/20 text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Chế độ tạo</label>
              <div className="flex bg-surface-container-lowest rounded-xl border border-outline/20 overflow-hidden divide-x divide-outline/20">
                <label className={`flex-1 text-center py-3 cursor-pointer text-sm font-semibold transition-colors ${!selectMultiDays ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
                  <input type="radio" className="hidden" checked={!selectMultiDays} onChange={() => setSelectMultiDays(false)} />
                  Một ngày
                </label>
                <label className={`flex-1 text-center py-3 cursor-pointer text-sm font-semibold transition-colors ${selectMultiDays ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
                  <input type="radio" className="hidden" checked={selectMultiDays} onChange={() => setSelectMultiDays(true)} />
                  Nhiều ngày
                </label>
              </div>
            </div>
          </div>

          {!selectMultiDays ? (
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Ngày <span className="text-error">*</span></label>
              <input type="date" value={createDate} onChange={e => setCreateDate(e.target.value)} min={toISO(new Date())} className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl border border-outline/20 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Chọn ngày trong tuần này <span className="text-error">*</span></label>
              <div className="grid grid-cols-7 gap-1.5">
                {weekDays.map((d, i) => {
                  const dStr = toISO(d)
                  const isPast = d < new Date(new Date().setHours(0, 0, 0, 0))
                  const isSel = selectedDays.includes(dStr)
                  return (
                    <button key={dStr} type="button" disabled={isPast} onClick={() => onToggleDaySelection(dStr)} className={`py-2 flex flex-col items-center justify-center rounded-lg border transition-all ${isPast ? 'opacity-30 cursor-not-allowed bg-surface-container' : isSel ? 'border-primary bg-primary-container text-primary font-bold shadow-inner ring-1 ring-primary' : 'border-outline/20 bg-surface-container-lowest text-on-surface-variant hover:border-primary/50'}`}>
                      <span className="text-[10px] uppercase">{DAY_LABELS[i]}</span>
                      <span className="text-sm">{d.getDate()}</span>
                    </button>
                  )
                })}
              </div>
              {selectedDays.length > 0 && <p className="text-[10px] text-primary mt-2">Đã chọn {selectedDays.length} ngày</p>}
            </div>
          )}

          {!formTpl && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Bắt đầu <span className="text-error">*</span></label>
                <input type="time" value={formStart} onChange={e => setFormStart(e.target.value)} className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl border border-outline/20 text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Kết thúc <span className="text-error">*</span></label>
                <input type="time" value={formEnd} onChange={e => setFormEnd(e.target.value)} className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl border border-outline/20 text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
            </div>
          )}

          {formTpl && (
            <div className="bg-primary-container/10 rounded-xl p-3 text-sm text-on-surface-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">info</span>
              Giờ từ ca mẫu: <strong className="text-on-surface">{formStart} – {formEnd}</strong>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Ghi chú</label>
            <textarea value={formNote} onChange={e => setFormNote(e.target.value)} placeholder="Ghi chú cho nhân viên..." rows={2} className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl border border-outline/20 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-on-surface-variant font-semibold rounded-lg hover:bg-surface-container-high transition-colors">Hủy</button>
            <button type="submit" disabled={creating} className="px-5 py-2.5 bg-primary text-on-primary font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-md disabled:opacity-50">
              {creating ? 'Đang tạo...' : 'Tạo ca'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
