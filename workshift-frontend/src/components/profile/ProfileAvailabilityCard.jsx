const DAY_NUM_LABEL = [null, 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật']

function fmtTime(t) { return t ? String(t).substring(0, 5) : '—' }

export function ProfileAvailabilityCard({ availability }) {
  const grouped = Object.entries(
    availability.reduce((acc, item) => {
      const key = item.dayOfWeek
      if (!acc[key]) acc[key] = []
      acc[key].push(item)
      return acc
    }, {})
  )

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline/10 shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-surface-container-low border-b border-outline/10">
        <h4 className="text-base font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">event_available</span>
          Lịch rảnh hàng tuần
        </h4>
      </div>
      <div className="p-5">
        {availability.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {grouped.map(([day, slots]) => (
              <div key={day} className="flex items-center gap-3 bg-surface-container rounded-xl px-4 py-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xs font-black text-primary flex-shrink-0">
                  {(DAY_NUM_LABEL[Number(day)] || `T${day}`).substring(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-on-surface">{DAY_NUM_LABEL[Number(day)] || `Ngày ${day}`}</p>
                  <p className="text-[11px] text-on-surface-variant">{slots.map(s => `${fmtTime(s.startTime)}–${fmtTime(s.endTime)}`).join(', ')}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-3xl text-on-surface-variant opacity-20 mb-2">event_busy</span>
            <p className="text-sm text-on-surface-variant">Chưa khai báo lịch rảnh</p>
          </div>
        )}
      </div>
    </div>
  )
}
