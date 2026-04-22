import { weekdayLabelViFromIsoDate } from '../../utils/dateUtils'

function fmtTime(t) { return t ? String(t).substring(0, 5) : '—' }

function formatShiftCell(prefix, row) {
  const name = row[`${prefix}ShiftName`]
  const date = row[`${prefix}ShiftDate`]
  const st = row[`${prefix}ShiftStartTime`]
  const en = row[`${prefix}ShiftEndTime`]
  if (!date && !name) return <span className="text-on-surface-variant italic">—</span>
  const thu = weekdayLabelViFromIsoDate(date)
  const parts = [thu, date, name, st && en ? `${fmtTime(st)}–${fmtTime(en)}` : null].filter(Boolean)
  return <span className="font-medium text-on-surface">{parts.join(' · ')}</span>
}

export function ShiftChangeRequestsTable({ loading, items, actioningId, onApprove, onReject }) {
  if (loading) {
    return <div className="text-center py-12"><p className="text-on-surface-variant animate-pulse">Đang tải...</p></div>
  }
  if (items.length === 0) {
    return (
      <div className="text-center py-14 bg-surface-container-lowest rounded-2xl border border-dashed border-outline/20">
        <span className="material-symbols-outlined text-5xl text-on-surface-variant opacity-20 mb-4">check_circle</span>
        <h3 className="text-xl font-bold text-on-surface mb-2">Không có yêu cầu nào</h3>
        <p className="text-on-surface-variant font-medium">Hệ thống chưa nhận yêu cầu đổi ca nào đang chờ duyệt.</p>
      </div>
    )
  }

  return (
    <div className="bg-surface-container-low rounded-xl overflow-hidden border border-outline/10">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-high/50">
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Người yêu cầu</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Từ ca</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Tới ca</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Vị trí</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Lý do</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline/5">
          {items.map((it) => (
            <tr key={it.id} className="hover:bg-surface-container-lowest transition-colors">
              <td className="px-6 py-4">
                <div className="font-bold text-on-surface">{it.fullName || it.requesterFullName || it.username || it.requesterUsername || '—'}</div>
                <div className="text-xs text-on-surface-variant mt-1">@{it.username || it.requesterUsername || '—'}</div>
              </td>
              <td className="px-6 py-4 text-sm">{formatShiftCell('from', it)}</td>
              <td className="px-6 py-4 text-sm">{it.toShiftId == null ? <span className="text-on-surface-variant italic">Chỉ xin bỏ ca (không đổi sang ca khác)</span> : formatShiftCell('to', it)}</td>
              <td className="px-6 py-4 text-sm text-on-surface-variant">{it.fromPositionName || it.toPositionName || '—'}</td>
              <td className="px-6 py-4 text-sm text-on-surface-variant">{it.reason || <span className="opacity-50 italic">—</span>}</td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => onApprove(it.id)} disabled={actioningId === it.id} className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">check</span>
                    Duyệt
                  </button>
                  <button type="button" onClick={() => onReject(it.id)} disabled={actioningId === it.id} className="px-3 py-2 bg-surface-container-highest text-error text-xs font-bold rounded-lg hover:bg-error/10 transition-colors disabled:opacity-50">
                    Từ chối
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
