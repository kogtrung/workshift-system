export function PayrollMonthNavigator({ month, year, onPrev, onNext }) {
  return (
    <div className="flex items-center justify-between bg-surface-container-lowest rounded-2xl border border-outline/10 px-5 py-3 shadow-sm">
      <button onClick={onPrev} className="p-2 hover:bg-surface-container-high rounded-lg transition-colors">
        <span className="material-symbols-outlined">chevron_left</span>
      </button>
      <span className="text-lg font-bold text-on-surface">Tháng {String(month).padStart(2, '0')} / {year}</span>
      <button onClick={onNext} className="p-2 hover:bg-surface-container-high rounded-lg transition-colors">
        <span className="material-symbols-outlined">chevron_right</span>
      </button>
    </div>
  )
}
