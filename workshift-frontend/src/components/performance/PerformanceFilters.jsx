export function PerformanceFilters({
  range,
  from,
  to,
  loading,
  onChangeRange,
  onChangeFrom,
  onChangeTo,
  onReload,
}) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline/10 px-5 py-4 shadow-sm space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => onChangeRange('week')} className={`px-4 py-2 rounded-lg font-bold transition-colors border ${range === 'week' ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container text-on-surface-variant border-outline/10 hover:bg-surface-container-high'}`}>Tuần</button>
          <button type="button" onClick={() => onChangeRange('month')} className={`px-4 py-2 rounded-lg font-bold transition-colors border ${range === 'month' ? 'bg-primary text-on-primary border-primary' : 'bg-surface-container text-on-surface-variant border-outline/10 hover:bg-surface-container-high'}`}>Tháng</button>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-on-surface-variant font-medium">Từ</span>
          <input type="date" value={from} onChange={(e) => onChangeFrom(e.target.value)} className="px-3 py-2 bg-surface-container-lowest border border-outline/20 rounded-lg text-on-surface" />
          <span className="text-on-surface-variant font-medium">Đến</span>
          <input type="date" value={to} onChange={(e) => onChangeTo(e.target.value)} className="px-3 py-2 bg-surface-container-lowest border border-outline/20 rounded-lg text-on-surface" />
        </div>
      </div>

      <div className="flex items-center justify-end">
        <button type="button" onClick={onReload} className="px-4 py-2 bg-primary text-on-primary rounded-lg font-bold hover:bg-primary/90 transition-colors flex items-center gap-2" disabled={loading}>
          <span className="material-symbols-outlined text-sm">{loading ? 'hourglass_empty' : 'refresh'}</span>
          Lọc dữ liệu
        </button>
      </div>
    </div>
  )
}
