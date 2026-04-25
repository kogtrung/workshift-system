function fmtHours(val) {
  const n = Number(val)
  return Number.isFinite(n) ? `${n.toFixed(1)}h` : '—'
}

export function PerformanceTopChart({ topByHours, maxHours }) {
  if (!topByHours.length) return null

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline/10 shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-surface-container-low border-b border-outline/10">
        <h4 className="text-base font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">trending_up</span>
          Top nhân viên theo tổng giờ
        </h4>
        <p className="text-xs text-on-surface-variant mt-1">Biểu đồ hiển thị đơn giản (CSS) để không phụ thuộc thư viện chart.</p>
      </div>
      <div className="p-6 space-y-4">
        {topByHours.map((e) => {
          const hours = Number(e.totalHours ?? e.totalHoursWorked ?? e.hours ?? 0)
          const pct = maxHours > 0 ? Math.round((hours / maxHours) * 100) : 0
          const name = e.fullName || e.userFullName || e.name || `NV #${e.userId ?? e.id ?? '—'}`
          return (
            <div key={e.userId ?? e.id ?? name} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-9 h-9 rounded-xl bg-primary-container flex items-center justify-center text-on-primary-container text-xs font-black">
                    {(name || 'U').charAt(0).toUpperCase()}
                  </span>
                  <span className="font-bold text-on-surface truncate">{name}</span>
                </div>
                <span className="text-sm font-bold text-on-surface-variant">{fmtHours(hours)}</span>
              </div>
              <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
