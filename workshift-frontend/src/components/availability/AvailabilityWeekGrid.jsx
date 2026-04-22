const DAYS = [
  { num: 1, label: 'Thứ 2', short: 'T2' },
  { num: 2, label: 'Thứ 3', short: 'T3' },
  { num: 3, label: 'Thứ 4', short: 'T4' },
  { num: 4, label: 'Thứ 5', short: 'T5' },
  { num: 5, label: 'Thứ 6', short: 'T6' },
  { num: 6, label: 'Thứ 7', short: 'T7' },
  { num: 7, label: 'Chủ nhật', short: 'CN' },
]

export function AvailabilityWeekGrid({ availability, onAddSlot, onRemoveSlot, onUpdateSlot }) {
  return (
    <div className="space-y-3">
      {availability.map((day, dayIdx) => {
        const dayInfo = DAYS[dayIdx]
        const hasSlots = day.slots.length > 0
        return (
          <div key={String(day.dayOfWeek)} className={`bg-surface-container-lowest rounded-2xl border transition-all ${hasSlots ? 'border-primary/15 shadow-md' : 'border-outline/10 shadow-sm'}`}>
            <div className={`px-5 py-4 flex items-center justify-between border-b ${hasSlots ? 'border-primary/10 bg-primary/[0.02]' : 'border-outline/5'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black ${hasSlots ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'}`}>
                  {dayInfo.short}
                </div>
                <div>
                  <h3 className="text-base font-bold text-on-surface">{dayInfo.label}</h3>
                  <p className="text-xs text-on-surface-variant">{day.slots.length > 0 ? `${day.slots.length} khung giờ` : 'Chưa khai báo'}</p>
                </div>
              </div>
              <button onClick={() => onAddSlot(dayIdx)} className="px-3 py-1.5 text-xs font-bold text-primary bg-primary-container/20 hover:bg-primary-container/40 rounded-lg transition-colors flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">add</span>
                Thêm giờ
              </button>
            </div>

            {day.slots.length > 0 ? (
              <div className="p-4 space-y-2">
                {day.slots.map((slot, slotIdx) => (
                  <div key={slotIdx} className="flex items-center gap-3 bg-surface-container rounded-xl px-4 py-3 group">
                    <span className="material-symbols-outlined text-primary text-lg">schedule</span>
                    <input type="time" value={slot.startTime} onChange={e => onUpdateSlot(dayIdx, slotIdx, 'startTime', e.target.value)} className="px-3 py-2 bg-surface-container-lowest rounded-lg border border-outline/20 text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                    <span className="text-on-surface-variant text-sm font-medium">đến</span>
                    <input type="time" value={slot.endTime} onChange={e => onUpdateSlot(dayIdx, slotIdx, 'endTime', e.target.value)} className="px-3 py-2 bg-surface-container-lowest rounded-lg border border-outline/20 text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                    <button onClick={() => onRemoveSlot(dayIdx, slotIdx)} className="ml-auto p-1.5 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all" title="Xóa khung giờ">
                      <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-5 py-6 text-center">
                <p className="text-xs text-on-surface-variant opacity-40 italic">Nhấn "Thêm giờ" để khai báo khung giờ rảnh</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
