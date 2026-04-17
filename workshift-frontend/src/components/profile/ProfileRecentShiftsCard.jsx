function fmtTime(t) { return t ? String(t).substring(0, 5) : '—' }

export function ProfileRecentShiftsCard({ approvedShifts }) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline/10 shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-surface-container-low border-b border-outline/10">
        <h4 className="text-base font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">history</span>
          Ca đã duyệt tháng này
        </h4>
      </div>
      <div className="p-5">
        {approvedShifts.length > 0 ? (
          <div className="space-y-2">
            {approvedShifts.slice(0, 10).map(item => (
              <div key={item.registrationId} className="flex items-center justify-between bg-surface-container rounded-xl px-4 py-3 group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: item.positionColorCode || '#6366f1' }}>
                    {(item.positionName || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface">{item.shiftName || 'Ca'}</p>
                    <p className="text-xs text-on-surface-variant">{item.date} · {fmtTime(item.startTime)} – {fmtTime(item.endTime)}</p>
                  </div>
                </div>
                {item.positionName && <span className="text-xs font-medium text-on-surface-variant bg-surface-container-lowest px-2 py-1 rounded-lg">{item.positionName}</span>}
              </div>
            ))}
            {approvedShifts.length > 10 && <p className="text-xs text-on-surface-variant text-center opacity-50 pt-2">+{approvedShifts.length - 10} ca khác</p>}
          </div>
        ) : (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-3xl text-on-surface-variant opacity-20 mb-2">event_busy</span>
            <p className="text-sm text-on-surface-variant">Chưa có ca nào được duyệt</p>
          </div>
        )}
      </div>
    </div>
  )
}
