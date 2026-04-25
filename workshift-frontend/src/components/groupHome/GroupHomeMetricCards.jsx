function fmtCurrency(val) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
}

export function GroupHomeMetricCards({ isManager, metrics }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 bg-surface-container-lowest rounded-2xl shadow-[0_8px_16px_rgba(0,0,0,0.03)] border border-outline/10 relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/5 rounded-full group-hover:scale-110 transition-transform duration-500" />
        <div className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-2 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-primary text-sm">event_note</span>
          Số ca {isManager ? 'của tuần' : 'đã đăng ký'}
        </div>
        <div className="flex items-end gap-2">
          <div className="text-3xl font-black text-on-surface tracking-tighter">{metrics.totalShifts}</div>
          <div className="text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-widest">Ca</div>
        </div>
      </div>

      <div className="p-4 bg-surface-container-lowest rounded-2xl shadow-[0_8px_16px_rgba(0,0,0,0.03)] border border-outline/10 relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-16 h-16 bg-tertiary/5 rounded-full group-hover:scale-110 transition-transform duration-500" />
        <div className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-2 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-tertiary text-sm">schedule</span>
          Tổng giờ làm
        </div>
        <div className="flex items-end gap-2">
          <div className="text-3xl font-black text-on-surface tracking-tighter">{metrics.totalHours}</div>
          <div className="text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-widest">Giờ</div>
        </div>
      </div>

      <div className="p-4 bg-surface-container-lowest rounded-2xl shadow-[0_8px_16px_rgba(0,0,0,0.03)] border border-outline/10 relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-500/5 rounded-full group-hover:scale-110 transition-transform duration-500" />
        <div className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-2 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-emerald-600 text-sm">payments</span>
          {isManager ? 'Chi phí ước tính' : 'Lương dự kiến'}
        </div>
        <div className="flex items-center gap-2">
          <div className="text-2xl font-black text-emerald-700 tracking-tighter">
            {metrics.totalSalary == null ? '—' : fmtCurrency(metrics.totalSalary)}
          </div>
        </div>
      </div>
    </div>
  )
}
