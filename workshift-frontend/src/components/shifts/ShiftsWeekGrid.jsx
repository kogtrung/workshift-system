function fmtTime(t) { return t ? String(t).substring(0, 5) : '—' }
function isToday(d, toISO) { return toISO(d) === toISO(new Date()) }

const DAY_LABELS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN']
const STATUS_CFG = {
  OPEN: { label: 'Mở', cls: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700' },
  LOCKED: { label: 'Khóa', cls: 'bg-amber-50 border-amber-200', dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700' },
  COMPLETED: { label: 'Xong', cls: 'bg-slate-50 border-slate-200', dot: 'bg-slate-400', badge: 'bg-slate-100 text-slate-600' },
}

export function ShiftsWeekGrid({
  weekDays,
  toISO,
  shiftsByDate,
  isManager,
  selShift,
  pendingCountsByShiftId,
  myRegStatusByShiftId,
  onOpenCreateForDate,
  onOpenReqs,
  onRegisterClick,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
      {weekDays.map((day, idx) => {
        const key = toISO(day)
        const dayShifts = shiftsByDate[key] || []
        const today = isToday(day, toISO)
        return (
          <div key={key} className={`rounded-2xl border transition-all flex flex-col ${today ? 'bg-primary-container/10 border-primary/20 shadow-md ring-1 ring-primary/10' : 'bg-surface-container-lowest border-outline/10 shadow-sm'}`}>
            <div className={`px-3 py-3 border-b flex items-center justify-between ${today ? 'border-primary/10' : 'border-outline/5'}`}>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${today ? 'bg-primary text-on-primary' : 'text-on-surface'}`}>
                  {day.getDate()}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{DAY_LABELS[idx]}</span>
              </div>
              {isManager && (
                <button onClick={() => onOpenCreateForDate(key)} title="Thêm ca" className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-primary-container/40 text-on-surface-variant hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-base">add</span>
                </button>
              )}
            </div>

            <div className="flex-1 p-2 space-y-2 min-h-[120px]">
              {dayShifts.length === 0 && <div className="flex items-center justify-center h-full"><p className="text-[10px] text-on-surface-variant opacity-30">Trống</p></div>}
              {dayShifts.map(shift => {
                const st = STATUS_CFG[shift.status] || STATUS_CFG.OPEN
                const isActive = selShift?.id === shift.id
                const shiftReqs = shift.requirements || []
                const totalReq = shift.totalRequired || 0
                const assignedMembers = shift.assignedMembers || []
                const assignedMax = 2
                const assignedShown = assignedMembers.slice(0, assignedMax)
                const assignedRest = Math.max(0, assignedMembers.length - assignedShown.length)
                const pendingCount = pendingCountsByShiftId[shift.id] || 0
                return (
                  <div key={shift.id} onClick={() => onOpenReqs(shift)} className={`cursor-pointer rounded-xl border p-2.5 transition-all ${isActive ? 'border-primary bg-primary/5 ring-1 ring-primary/20 shadow-md' : `${st.cls} hover:shadow-sm`}`}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${st.dot}`} />
                        <span className="text-xs font-bold text-on-surface truncate">{shift.name || 'Ca'}</span>
                      </div>
                      {isManager && pendingCount > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-700">
                          <span className="material-symbols-outlined text-[12px]">pending_actions</span>
                          Chờ {pendingCount}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-on-surface-variant font-medium mb-2 pl-3">{fmtTime(shift.startTime)} – {fmtTime(shift.endTime)}</p>

                    {shiftReqs.length > 0 && (
                      <div className="space-y-1 mb-1.5">
                        {shiftReqs.map(req => (
                          <div key={req.id} className="flex items-center gap-1.5">
                            <div className="w-4 h-4 rounded flex-shrink-0 flex items-center justify-center text-[8px] font-bold text-white" style={{ backgroundColor: req.positionColorCode || '#6366f1' }}>
                              {(req.positionName || '?').charAt(0)}
                            </div>
                            <span className="text-[10px] text-on-surface truncate flex-1">{req.positionName}</span>
                            <span className="text-[10px] font-bold text-on-surface-variant">{req.quantity}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {assignedMembers.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <p className="text-[9px] font-bold uppercase text-on-surface-variant tracking-wider border-b border-outline/10 pb-0.5 mb-1">Đã phân công</p>
                        <div className="flex flex-wrap gap-1">
                          {assignedShown.map(am => (
                            <div key={am.userId} className="flex items-center gap-1 bg-surface-container px-1.5 py-0.5 rounded text-[9px] font-medium text-on-surface border border-outline/10">
                              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: am.colorCode || '#ccc' }} />
                              <span className="truncate max-w-[60px]">{am.fullName}</span>
                            </div>
                          ))}
                          {assignedRest > 0 && (
                            <div className="flex items-center gap-1 bg-surface-container px-1.5 py-0.5 rounded text-[9px] font-medium text-on-surface border border-outline/10">
                              <span className="material-symbols-outlined text-[14px]">add</span>
                              <span>+{assignedRest}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {totalReq > 0 && (
                      <div className="flex items-center justify-between pt-1.5 border-t border-outline/10">
                        <span className="text-[9px] font-bold uppercase text-on-surface-variant tracking-wider">Cần</span>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px] text-primary">groups</span>
                          <span className="text-[10px] font-black text-primary">{totalReq}</span>
                        </div>
                      </div>
                    )}

                    {shiftReqs.length === 0 && totalReq === 0 && (
                      <div className="pt-1 border-t border-outline/10">
                        <p className="text-[9px] text-on-surface-variant opacity-50 italic">Chưa cấu hình nhu cầu</p>
                      </div>
                    )}

                    {(!isManager && myRegStatusByShiftId[shift.id] === 'PENDING') && <div className="w-full mt-1.5 py-1.5 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg text-center">Đã đăng kí ca này</div>}
                    {(!isManager && myRegStatusByShiftId[shift.id] === 'APPROVED') && <div className="w-full mt-1.5 py-1.5 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg text-center">Đã đăng kí ca này</div>}
                    {(!isManager && shift.status === 'OPEN' && !myRegStatusByShiftId[shift.id]) && (
                      <button onClick={(e) => onRegisterClick(e, shift)} className="w-full mt-1.5 py-1.5 text-[10px] font-bold text-primary bg-primary-container/20 hover:bg-primary-container/40 rounded-lg transition-colors flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">how_to_reg</span>
                        Đăng ký
                      </button>
                    )}

                    {shift.note && <p className="text-[9px] text-on-surface-variant truncate mt-1 italic opacity-60">📝 {shift.note}</p>}
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
