export function OverviewHeader({ isManager, metricRange, onChangeMetricRange }) {
  return (
    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
      <div className="space-y-1">
        <p className="text-xs font-bold tracking-[0.05em] uppercase text-on-surface-variant opacity-70">
          {isManager ? 'Bảng điều khiển quản lý' : 'Bảng điều khiển nhân viên'}
        </p>
        <h2 className="text-2xl font-extrabold text-on-surface tracking-tight">Tổng quan</h2>
        <p className="text-sm text-on-surface-variant font-medium">
          Lịch làm việc và thống kê {isManager ? 'nhóm' : 'cá nhân'} của tuần hiện tại.
        </p>
      </div>
      <div className="flex items-center gap-2 bg-surface-container rounded-xl p-1 border border-outline/10">
        <button
          type="button"
          onClick={() => onChangeMetricRange('week')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            metricRange === 'week' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          Tuần
        </button>
        <button
          type="button"
          onClick={() => onChangeMetricRange('month')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            metricRange === 'month' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          Tháng
        </button>
      </div>
    </div>
  )
}
