export function AuditLogsSummaryCards({
  dailyDate,
  monthlyMonth,
  monthlyYear,
  daily,
  monthly,
  actionTypeLabels,
  onChangeDailyDate,
  onChangeMonthlyMonth,
  onChangeMonthlyYear,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline/10">
        <div className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Tổng hợp ngày</div>
        <div className="mt-4 flex gap-3 items-center">
          <input className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary text-sm font-medium" type="date" value={dailyDate} onChange={(e) => onChangeDailyDate(e.target.value)} />
        </div>
        <div className="mt-4">
          <div className="text-3xl font-extrabold text-on-surface">{daily?.totalEvents ?? '—'}</div>
          <div className="text-sm text-on-surface-variant font-medium mt-1">Tổng sự kiện</div>
        </div>
        <div className="mt-4 space-y-2">
          {(daily?.byAction || []).map((x) => (
            <div key={x.actionType} className="flex items-center justify-between bg-surface-container-low rounded-xl px-4 py-2">
              <div className="text-xs font-bold text-on-surface-variant">{actionTypeLabels[x.actionType] || x.actionType}</div>
              <div className="text-xs font-bold text-on-surface">{x.count}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline/10">
        <div className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Tổng hợp tháng</div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <input className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary text-sm font-medium" type="number" min={1} max={12} value={monthlyMonth} onChange={(e) => onChangeMonthlyMonth(Number(e.target.value))} />
          <input className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary text-sm font-medium" type="number" min={2000} max={2100} value={monthlyYear} onChange={(e) => onChangeMonthlyYear(Number(e.target.value))} />
        </div>
        <div className="mt-4">
          <div className="text-3xl font-extrabold text-on-surface">{monthly?.totalEvents ?? '—'}</div>
          <div className="text-sm text-on-surface-variant font-medium mt-1">Tổng sự kiện</div>
        </div>
        <div className="mt-4 space-y-2">
          {(monthly?.byAction || []).map((x) => (
            <div key={x.actionType} className="flex items-center justify-between bg-surface-container-low rounded-xl px-4 py-2">
              <div className="text-xs font-bold text-on-surface-variant">{actionTypeLabels[x.actionType] || x.actionType}</div>
              <div className="text-xs font-bold text-on-surface">{x.count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
