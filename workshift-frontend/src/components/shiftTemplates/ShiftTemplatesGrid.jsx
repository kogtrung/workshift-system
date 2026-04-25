const SHIFT_COLORS = {
  light_mode: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', accent: '#f59e0b' },
  wb_sunny: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', accent: '#f97316' },
  wb_twilight: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', accent: '#a855f7' },
  dark_mode: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200', accent: '#6366f1' },
  schedule: { bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-200', accent: '#0ea5e9' },
}

function getShiftIcon(name) {
  const lower = (name || '').toLowerCase()
  if (lower.includes('sáng') || lower.includes('sang') || lower.includes('morning')) return 'light_mode'
  if (lower.includes('trưa') || lower.includes('trua') || lower.includes('noon')) return 'wb_sunny'
  if (lower.includes('chiều') || lower.includes('chieu') || lower.includes('afternoon')) return 'wb_twilight'
  if (lower.includes('tối') || lower.includes('toi') || lower.includes('night') || lower.includes('đêm')) return 'dark_mode'
  return 'schedule'
}

function calcDuration(start, end) {
  if (!start || !end) return null
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  const mins = (eh * 60 + em) - (sh * 60 + sm)
  if (mins <= 0) return null
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h${m}p` : `${h}h`
}

export function ShiftTemplatesGrid({ templates, isManager, formatTime, onEdit, onDelete }) {
  if (!templates.length) {
    return (
      <div className="text-center py-16 bg-surface-container-lowest rounded-2xl border border-outline/10 border-dashed">
        <span className="material-symbols-outlined text-5xl text-on-surface-variant opacity-20 mb-4">schedule</span>
        <h3 className="text-xl font-bold text-on-surface mb-2">Chưa có ca mẫu nào</h3>
        <p className="text-on-surface-variant font-medium">Tạo khung giờ mẫu để tạo ca làm việc nhanh hơn.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {templates.map((tpl) => {
        const icon = getShiftIcon(tpl.name)
        const colors = SHIFT_COLORS[icon]
        const duration = calcDuration(tpl.startTime, tpl.endTime)
        return (
          <div
            key={tpl.id}
            className="bg-surface-container-lowest rounded-2xl border border-outline/10 shadow-[0_24px_48px_rgba(0,52,94,0.06)] hover:shadow-lg transition-all group overflow-hidden"
          >
            <div className="h-1" style={{ backgroundColor: colors.accent }} />
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colors.bg} ${colors.text}`}>
                    <span className="material-symbols-outlined">{icon}</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-on-surface">{tpl.name}</h3>
                    {duration && <span className="text-xs text-on-surface-variant">{duration}</span>}
                  </div>
                </div>
                {isManager && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(tpl)} title="Sửa" className="p-1.5 text-on-surface-variant hover:bg-primary-container/30 rounded-lg transition-colors">
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button onClick={() => onDelete(tpl)} title="Xóa" className="p-1.5 text-on-surface-variant hover:bg-error-container/30 hover:text-error rounded-lg transition-colors">
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                )}
              </div>

              <div className={`rounded-xl p-3 ${colors.bg} ${colors.border} border`}>
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60">Bắt đầu</p>
                    <p className={`text-lg font-black ${colors.text}`}>{formatTime(tpl.startTime)}</p>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant opacity-30">arrow_forward</span>
                  <div className="text-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60">Kết thúc</p>
                    <p className={`text-lg font-black ${colors.text}`}>{formatTime(tpl.endTime)}</p>
                  </div>
                </div>
              </div>

              {tpl.description && <p className="text-sm text-on-surface-variant mt-3 line-clamp-2">{tpl.description}</p>}

              {tpl.requirements?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-outline/10">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Nhu cầu mặc định</p>
                  <div className="flex flex-wrap gap-1.5">
                    {tpl.requirements.map(req => (
                      <span key={req.id} className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg border border-outline/10 bg-surface-container">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: req.positionColorCode || '#6366f1' }} />
                        {req.positionName} ×{req.quantity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
