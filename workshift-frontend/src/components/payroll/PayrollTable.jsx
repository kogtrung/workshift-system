function fmtCurrency(val) {
  return Number(val).toLocaleString('vi-VN') + 'đ'
}

function exportCsv(entries, month, year) {
  const BOM = '﻿'
  const header = ['STT', 'Họ tên', 'Username', 'Số ca', 'Tổng giờ', 'Lương/giờ', 'Tổng lương']
  const rows = entries.map((e, i) => [
    i + 1,
    e.fullName || '',
    e.username || '',
    Number(e.totalShifts ?? e.shiftsWorked ?? 0),
    Number(e.totalHours).toFixed(1),
    e.hourlyRate != null ? Number(e.hourlyRate) : '',
    Number(e.totalPay ?? e.estimatedPay ?? 0),
  ])
  const csv = BOM + [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `payroll_${year}_${String(month).padStart(2, '0')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function PayrollTable({ entries, month, year, totalShifts, totalHours, totalPay }) {
  if (!entries.length) {
    return (
      <div className="text-center py-16 bg-surface-container-lowest rounded-2xl border border-outline/10 border-dashed">
        <span className="material-symbols-outlined text-5xl text-on-surface-variant opacity-20 mb-4">receipt_long</span>
        <h3 className="text-xl font-bold text-on-surface mb-2">Chưa có dữ liệu lương</h3>
        <p className="text-on-surface-variant font-medium">Không có ca nào được duyệt trong tháng {month}/{year}.</p>
      </div>
    )
  }

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline/10 shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-surface-container-low border-b border-outline/10 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-lg">receipt_long</span>
        <h4 className="text-base font-bold text-on-surface">
          Chi tiết bảng lương — Tháng {month}/{year}
        </h4>
        <button
          type="button"
          onClick={() => exportCsv(entries, month, year)}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-outline/20 text-xs font-bold text-on-surface-variant hover:bg-surface-container transition-colors"
          title="Xuất CSV"
        >
          <span className="material-symbols-outlined text-base">download</span>
          Xuất CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-outline/10 bg-surface-container/30">
              <th className="text-left px-6 py-3 font-bold text-[10px] uppercase tracking-widest text-on-surface-variant">#</th>
              <th className="text-left px-6 py-3 font-bold text-[10px] uppercase tracking-widest text-on-surface-variant">Nhân viên</th>
              <th className="text-center px-4 py-3 font-bold text-[10px] uppercase tracking-widest text-on-surface-variant">Số ca</th>
              <th className="text-center px-4 py-3 font-bold text-[10px] uppercase tracking-widest text-on-surface-variant">Tổng giờ</th>
              <th className="text-right px-4 py-3 font-bold text-[10px] uppercase tracking-widest text-on-surface-variant">Lương/giờ</th>
              <th className="text-right px-6 py-3 font-bold text-[10px] uppercase tracking-widest text-on-surface-variant">Tổng lương</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline/5">
            {entries.map((entry, idx) => (
              <tr key={entry.userId} className="hover:bg-surface-container/20 transition-colors">
                <td className="px-6 py-4 text-on-surface-variant font-medium">{idx + 1}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container text-xs font-bold">
                      {(entry.fullName || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-on-surface">{entry.fullName || `NV #${entry.userId}`}</div>
                      {entry.username && <div className="text-xs text-on-surface-variant">@{entry.username}</div>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-center font-bold text-on-surface">{Number(entry.totalShifts ?? entry.shiftsWorked ?? 0)}</td>
                <td className="px-4 py-4 text-center font-medium text-on-surface">{Number(entry.totalHours).toFixed(1)}h</td>
                <td className="px-4 py-4 text-right text-on-surface-variant font-medium">{entry.hourlyRate != null ? fmtCurrency(entry.hourlyRate) : '—'}</td>
                <td className="px-6 py-4 text-right"><span className="font-black text-emerald-600">{fmtCurrency(entry.totalPay ?? entry.estimatedPay ?? 0)}</span></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-outline/20 bg-primary-container/5">
              <td colSpan={2} className="px-6 py-4 font-black text-on-surface uppercase text-xs tracking-widest">Tổng cộng</td>
              <td className="px-4 py-4 text-center font-black text-on-surface">{totalShifts}</td>
              <td className="px-4 py-4 text-center font-black text-on-surface">{totalHours.toFixed(1)}h</td>
              <td className="px-4 py-4" />
              <td className="px-6 py-4 text-right font-black text-emerald-600 text-lg">{fmtCurrency(totalPay)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
