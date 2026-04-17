export function WeekNavigator({ label, onPrev, onNext, onToday }) {
  return (
    <div className="flex items-center justify-between bg-surface-container-lowest rounded-2xl border border-outline/10 px-5 py-3 shadow-sm">
      <button onClick={onPrev} className="p-2 hover:bg-surface-container-high rounded-lg transition-colors">
        <span className="material-symbols-outlined">chevron_left</span>
      </button>
      <div className="flex items-center gap-3">
        {onToday ? (
          <button
            onClick={onToday}
            className="px-3 py-1.5 text-xs font-bold text-primary bg-primary-container/30 rounded-lg hover:bg-primary-container/50 transition-colors"
          >
            Hôm nay
          </button>
        ) : null}
        <span className="text-base font-bold text-on-surface">{label}</span>
      </div>
      <button onClick={onNext} className="p-2 hover:bg-surface-container-high rounded-lg transition-colors">
        <span className="material-symbols-outlined">chevron_right</span>
      </button>
    </div>
  )
}
