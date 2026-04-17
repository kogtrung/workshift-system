export function AlertsHeader({ weekOffset, loading, onChangeWeekOffset, onRefresh }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div className="space-y-1">
        <p className="text-xs font-bold tracking-[0.05em] uppercase text-on-surface-variant opacity-70">Quản lý</p>
        <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">Cảnh báo thiếu người</h2>
        <p className="text-on-surface-variant font-medium">Các ca `OPEN` sắp đến nhưng chưa đủ nhân sự theo `ShiftRequirement`</p>
      </div>
      <div className="flex items-center gap-2 self-start md:self-auto">
        <div className="flex items-center gap-2 bg-surface-container-lowest border border-outline/10 rounded-xl px-3 py-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Tuần</span>
          <select value={weekOffset} onChange={(e) => onChangeWeekOffset(Number(e.target.value))} className="bg-transparent border-none outline-none text-on-surface text-sm font-bold" disabled={loading}>
            <option value={0}>Tuần này</option>
            <option value={1}>Tuần sau</option>
            <option value={2}>Tuần kế</option>
            <option value={3}>Tuần +3</option>
          </select>
        </div>
        <button onClick={onRefresh} className="px-5 py-2.5 bg-surface-container text-on-surface font-semibold rounded-lg hover:bg-surface-container-high transition-colors flex items-center gap-2 self-start">
          <span className="material-symbols-outlined text-sm">refresh</span>
          Làm mới
        </button>
      </div>
    </div>
  )
}
