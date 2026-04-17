function fmtNumber(val) {
  const n = Number(val)
  return Number.isFinite(n) ? n.toLocaleString('vi-VN') : '—'
}

function fmtHours(val) {
  const n = Number(val)
  return Number.isFinite(n) ? `${n.toFixed(1)}h` : '—'
}

export function PerformanceTable({ entries, range }) {
  const hasPositionColumn = entries.some((x) => x.positionName || x.position?.name)

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline/10 shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-surface-container-low border-b border-outline/10 flex items-center justify-between gap-3">
        <h4 className="text-base font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">history</span>
          Chi tiết theo nhân viên
        </h4>
        <span className="text-xs text-on-surface-variant font-medium">
          range: <span className="font-mono">{range}</span>
        </span>
      </div>

      {!entries.length ? (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant opacity-20 mb-4">insights</span>
          <h3 className="text-xl font-bold text-on-surface mb-2">Chưa có dữ liệu</h3>
          <p className="text-on-surface-variant font-medium">Không có bản ghi hiệu suất trong khoảng bạn chọn.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline/10 bg-surface-container/30">
                <th className="text-left px-6 py-3 font-bold text-[10px] uppercase tracking-widest text-on-surface-variant">#</th>
                <th className="text-left px-6 py-3 font-bold text-[10px] uppercase tracking-widest text-on-surface-variant">Nhân viên</th>
                <th className="text-center px-4 py-3 font-bold text-[10px] uppercase tracking-widest text-on-surface-variant">Số ca</th>
                <th className="text-center px-4 py-3 font-bold text-[10px] uppercase tracking-widest text-on-surface-variant">Tổng giờ</th>
                {hasPositionColumn && <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-widest text-on-surface-variant">Vị trí</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/5">
              {entries
                .slice()
                .sort((a, b) => Number(b.totalHours ?? b.totalHoursWorked ?? b.hours ?? 0) - Number(a.totalHours ?? a.totalHoursWorked ?? a.hours ?? 0))
                .map((e, idx) => {
                  const name = e.fullName || e.userFullName || e.name || `NV #${e.userId ?? e.id ?? '—'}`
                  const hours = Number(e.totalHours ?? e.totalHoursWorked ?? e.hours ?? 0)
                  const shifts = Number(e.shiftsWorked ?? e.totalShifts ?? e.totalShiftCount ?? e.shifts ?? 0)
                  const positionName = e.positionName || e.position?.name || e.posName || ''
                  return (
                    <tr key={e.userId ?? e.id ?? name} className="hover:bg-surface-container/20 transition-colors">
                      <td className="px-6 py-4 text-on-surface-variant font-medium">{idx + 1}</td>
                      <td className="px-6 py-4"><span className="font-bold text-on-surface">{name}</span></td>
                      <td className="px-4 py-4 text-center font-bold text-on-surface">{fmtNumber(shifts)}</td>
                      <td className="px-4 py-4 text-center font-medium text-on-surface">{fmtHours(hours)}</td>
                      {hasPositionColumn && <td className="px-4 py-4 text-on-surface-variant font-medium">{positionName || '—'}</td>}
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
