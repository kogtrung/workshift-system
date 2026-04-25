function fmtTime(t) { return t ? String(t).substring(0, 5) : '—' }

const DAY_LABELS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN']
const REG_STATUS_CFG = {
  PENDING: { label: 'Chờ duyệt', cls: 'bg-amber-100 text-amber-700', icon: 'hourglass_top' },
  APPROVED: { label: 'Đã duyệt', cls: 'bg-emerald-100 text-emerald-700', icon: 'check_circle' },
  REJECTED: { label: 'Từ chối', cls: 'bg-red-100 text-red-700', icon: 'cancel' },
  CANCELLED: { label: 'Đã hủy', cls: 'bg-slate-100 text-slate-600', icon: 'block' },
}

export function MyScheduleWeekGrid({
  weekDays,
  toISO,
  calByDate,
  preparingChange,
  onOpenCancel,
  onOpenShiftChange,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
      {weekDays.map((day, idx) => {
        const key = toISO(day)
        const items = calByDate[key] || []
        const isToday = key === toISO(new Date())
        return (
          <div key={key} className={`rounded-2xl border transition-all flex flex-col ${isToday ? 'bg-primary-container/10 border-primary/20 shadow-md ring-1 ring-primary/10' : 'bg-surface-container-lowest border-outline/10 shadow-sm'}`}>
            <div className={`px-3 py-3 border-b flex items-center gap-2 ${isToday ? 'border-primary/10' : 'border-outline/5'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${isToday ? 'bg-primary text-on-primary' : 'text-on-surface'}`}>{day.getDate()}</div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{DAY_LABELS[idx]}</span>
            </div>
            <div className="flex-1 p-2 space-y-2 min-h-[100px]">
              {items.length === 0 && <div className="flex items-center justify-center h-full"><p className="text-[10px] text-on-surface-variant opacity-30">Trống</p></div>}
              {items.map(item => {
                const st = REG_STATUS_CFG[item.registrationStatus] || REG_STATUS_CFG.PENDING
                return (
                  <div key={item.registrationId} className="rounded-xl border border-outline/10 p-2.5 bg-white/50 hover:shadow-sm transition-all">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-3 h-3 rounded flex-shrink-0" style={{ backgroundColor: item.positionColorCode || '#6366f1' }} />
                      <span className="text-xs font-bold text-on-surface truncate">{item.shiftName || 'Ca'}</span>
                    </div>
                    <p className="text-[10px] text-on-surface-variant font-medium mb-1.5 pl-[18px]">{fmtTime(item.startTime)} – {fmtTime(item.endTime)}</p>
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${st.cls}`}>
                        <span className="material-symbols-outlined text-[10px]">{st.icon}</span>
                        {st.label}
                      </span>
                      {(item.registrationStatus === 'PENDING' || item.registrationStatus === 'APPROVED') && (
                        <div className="flex items-center gap-1">
                          <button onClick={() => onOpenCancel(item)} className="p-1 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded transition-all" title="Hủy đăng ký">
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                          {item.registrationStatus === 'APPROVED' && (
                            <button onClick={() => onOpenShiftChange(item)} disabled={preparingChange} className="p-1 text-on-surface-variant hover:text-primary hover:bg-primary-container/30 rounded transition-all disabled:opacity-60" title="Xin đổi ca">
                              <span className="material-symbols-outlined text-sm">swap_horiz</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    {item.positionName && <p className="text-[9px] text-on-surface-variant mt-1 pl-[18px] truncate">📋 {item.positionName}</p>}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
