function fmtNumber(val) {
  const n = Number(val)
  return Number.isFinite(n) ? n.toLocaleString('vi-VN') : '—'
}

export function AlertsStats({ visibleAlerts, totals }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <div className="bg-surface-container-lowest rounded-xl border border-outline/10 p-4 text-center">
        <p className="text-3xl font-black text-error">{visibleAlerts.length}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">Ca thiếu người</p>
      </div>
      <div className="bg-surface-container-lowest rounded-xl border border-outline/10 p-4 text-center">
        <p className="text-3xl font-black text-amber-600">{totals.totalShortage}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">Tổng thiếu hụt</p>
      </div>
      <div className="bg-surface-container-lowest rounded-xl border border-outline/10 p-4 text-center">
        <p className="text-3xl font-black text-on-surface">{fmtNumber(totals.totalRequired)}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">Tổng nhu cầu</p>
      </div>
    </div>
  )
}
