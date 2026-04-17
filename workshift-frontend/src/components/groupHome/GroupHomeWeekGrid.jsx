const DAY_LABELS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN']
const STATUS_CFG = {
  OPEN: { label: 'Mở', cls: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
  LOCKED: { label: 'Khóa', cls: 'bg-amber-50 border-amber-200', dot: 'bg-amber-500' },
  COMPLETED: { label: 'Xong', cls: 'bg-slate-50 border-slate-200', dot: 'bg-slate-400' },
}

function fmtTime(t) { return t ? String(t).substring(0, 5) : '—' }
function isToday(d, toISO) { return toISO(d) === toISO(new Date()) }

function hexToRgba(hex, opacity) {
  let c = hex.replace('#', '')
  if (c.length === 3) c = c.split('').map(x => x + x).join('')
  if (c.length !== 6) return `rgba(200, 200, 200, ${opacity})`
  const r = parseInt(c.slice(0, 2), 16)
  const g = parseInt(c.slice(2, 4), 16)
  const b = parseInt(c.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

export function GroupHomeWeekGrid({ weekDays, toISO, shiftsByDate, isManager, user, shortageByShiftId, loadingShifts, displayPositions }) {
  if (loadingShifts) {
    return <div className="text-center py-12 bg-surface-container-lowest rounded-2xl border border-outline/10"><p className="text-on-surface-variant animate-pulse font-bold tracking-widest uppercase text-xs">Đang tải lịch tuần...</p></div>
  }

  return (
    <>
      {displayPositions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 py-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mr-1">Vị trí:</span>
          {displayPositions.map(p => (
            <div key={p.id} className="flex items-center gap-1.5 bg-surface-container-lowest px-2 py-1 border border-outline/10 rounded-md shadow-sm">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.colorCode || '#ccc' }} />
              <span className="text-[10px] font-bold text-on-surface">{p.name}</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-2">
        {weekDays.map((day, idx) => {
          const key = toISO(day)
          const dayShiftsAll = shiftsByDate[key] || []
          const dayShifts = isManager ? dayShiftsAll : dayShiftsAll.filter(shift => (shift.assignedMembers || []).some(am => String(am.userId) === String(user?.id)))
          const today = isToday(day, toISO)
          return (
            <div key={key} className={`rounded-lg border transition-all flex flex-col ${today ? 'bg-primary-container/10 border-primary/30 ring-1 ring-primary/20' : 'bg-surface-container-lowest border-outline/5 hover:border-outline/20'}`}>
              <div className={`px-2 py-1.5 border-b flex items-center justify-between ${today ? 'border-primary/20' : 'border-outline/5'}`}>
                <div className="flex items-center gap-1.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${today ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface'}`}>{day.getDate()}</div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{DAY_LABELS[idx]}</span>
                </div>
              </div>
              <div className="flex-1 p-1.5 space-y-1.5">
                {dayShifts.length === 0 && <div className="flex items-center justify-center py-4"><p className="text-[9px] text-on-surface-variant opacity-30 uppercase tracking-widest font-bold">Trống</p></div>}
                {dayShifts.map(shift => {
                  const st = STATUS_CFG[shift.status] || STATUS_CFG.OPEN
                  const assignedAll = shift.assignedMembers || []
                  const isMyShift = assignedAll.some(am => String(am.userId) === String(user?.id))
                  const assigned = isManager ? assignedAll : assignedAll.filter(am => String(am.userId) === String(user?.id))
                  const shortage = isManager ? (shortageByShiftId[String(shift.id)] || 0) : 0

                  return (
                    <div key={shift.id} className={`rounded border p-2 transition-colors ${st.cls} ${!isManager && !isMyShift ? 'opacity-50 grayscale flex-shrink-0' : 'shadow-sm'}`}>
                      <div className="flex items-center gap-1 mb-0.5">
                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${st.dot}`} />
                        <span className="min-w-0 flex-1 text-[10px] font-extrabold text-on-surface truncate" title={shift.name}>{shift.name || 'Ca'}</span>
                        {isManager && shortage > 0 && <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-error/10 border border-error/20 text-error text-[9px] font-bold flex-shrink-0"><span className="material-symbols-outlined text-[12px]">warning</span>Thiếu {shortage}</span>}
                      </div>
                      <p className="text-[9px] text-on-surface-variant font-black tracking-widest mb-1.5 pl-2.5">{fmtTime(shift.startTime)}-{fmtTime(shift.endTime)}</p>

                      {assigned.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {assigned.map(am => {
                            const color = am.colorCode || '#888888'
                            const bgColor = hexToRgba(color, 0.15)
                            return (
                              <div key={am.userId} className="flex items-center px-1.5 py-0.5 rounded-[4px] border" style={{ backgroundColor: bgColor, borderColor: hexToRgba(color, 0.3) }} title={am.positionName}>
                                <span className="truncate text-[9px] font-bold w-full" style={{ color }}>{am.fullName}</span>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="pl-2.5"><span className="text-[9px] text-on-surface-variant opacity-60 font-medium italic">Chưa xếp người</span></div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
