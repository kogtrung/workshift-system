function fmtNumber(val) {
  const n = Number(val)
  return Number.isFinite(n) ? n.toLocaleString('vi-VN') : '—'
}

function fmtHours(val) {
  const n = Number(val)
  return Number.isFinite(n) ? `${n.toFixed(1)}h` : '—'
}

export function PerformanceStats({ entries, totals }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-surface-container-lowest rounded-xl border border-outline/10 p-4 text-center">
        <p className="text-3xl font-black text-on-surface">{entries.length}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">Nhân viên</p>
      </div>
      <div className="bg-surface-container-lowest rounded-xl border border-outline/10 p-4 text-center">
        <p className="text-3xl font-black text-primary">{fmtNumber(totals.totalShifts)}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">Tổng ca</p>
      </div>
      <div className="bg-surface-container-lowest rounded-xl border border-outline/10 p-4 text-center md:col-span-2">
        <p className="text-3xl font-black text-amber-600">{fmtHours(totals.totalHours)}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">Tổng giờ</p>
      </div>
    </div>
  )
}
