import { Link } from 'react-router-dom'

function fmtTime(t) { return t ? String(t).substring(0, 5) : '—' }

function severityColor(shortage) {
  if (shortage >= 3) return 'text-error bg-error/10 border border-error/20'
  if (shortage >= 1) return 'text-amber-700 bg-amber-50 border border-amber-200'
  return 'text-emerald-700 bg-emerald-50 border border-emerald-200'
}

export function AlertsList({ groupId, alerts, expanded, setExpanded }) {
  if (!alerts.length) {
    return (
      <div className="text-center py-16 bg-surface-container-lowest rounded-2xl border border-outline/10 border-dashed">
        <span className="material-symbols-outlined text-5xl text-emerald-500 opacity-40 mb-4">verified</span>
        <h3 className="text-xl font-bold text-on-surface mb-2">Không có ca thiếu người trong khoảng hiển thị</h3>
        <p className="text-on-surface-variant font-medium">Thử đổi bộ lọc “Hiển thị” hoặc bấm “Làm mới”.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {alerts.map((alert) => {
        const shortage = Math.max(0, (alert.totalRequired || 0) - (alert.totalApproved || 0))
        const pct = alert.totalRequired > 0 ? Math.round((alert.totalApproved / alert.totalRequired) * 100) : 0
        const isOpen = !!expanded[alert.shiftId]
        return (
          <div key={alert.shiftId} className="bg-surface-container-lowest rounded-2xl border border-outline/10 shadow-sm overflow-hidden hover:shadow-md transition-all">
            <div className="px-5 py-4 bg-error-container/10 border-b border-error/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center flex-shrink-0"><span className="material-symbols-outlined text-error">warning</span></div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-on-surface truncate">{alert.shiftName || 'Ca'}</p>
                  <p className="text-xs text-on-surface-variant">{alert.date} · {fmtTime(alert.startTime)} – {fmtTime(alert.endTime)}</p>
                </div>
              </div>
              <button type="button" onClick={() => setExpanded((prev) => ({ ...prev, [alert.shiftId]: !isOpen }))} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-error/10 text-error border border-error/10 text-xs font-bold flex-shrink-0 hover:bg-error/15 transition-colors" title="Xem chi tiết thiếu theo vị trí">
                <span className="material-symbols-outlined text-sm">{isOpen ? 'expand_less' : 'expand_more'}</span>
                Thiếu {shortage}
              </button>
            </div>

            <div className="px-5 py-3 border-b border-outline/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Nhân sự tổng</span>
                <span className="text-xs font-bold text-on-surface">{alert.totalApproved}/{alert.totalRequired} ({pct}%)</span>
              </div>
              <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${pct >= 80 ? 'bg-amber-500' : pct >= 50 ? 'bg-orange-500' : 'bg-error'}`} style={{ width: `${Math.min(100, pct)}%` }} />
              </div>
            </div>

            {isOpen ? (
              <>
                <div className="px-5 py-3 space-y-2">
                  {(alert.shortages || []).map((ps) => {
                    const posPct = ps.required > 0 ? Math.round((ps.approved / ps.required) * 100) : 0
                    return (
                      <div key={ps.positionId} className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-[10px] font-bold text-on-surface-variant flex-shrink-0">{(ps.positionName || '?').charAt(0).toUpperCase()}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1 gap-2">
                            <span className="text-xs font-bold text-on-surface truncate">{ps.positionName}</span>
                            <span className="text-[10px] text-on-surface-variant font-medium whitespace-nowrap">{ps.approved}/{ps.required}</span>
                          </div>
                          <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${posPct >= 100 ? 'bg-emerald-500' : posPct >= 50 ? 'bg-amber-500' : 'bg-error'}`} style={{ width: `${Math.min(100, posPct)}%` }} />
                          </div>
                        </div>
                        {ps.shortage > 0 && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${severityColor(ps.shortage)}`}>-{ps.shortage}</span>}
                      </div>
                    )
                  })}
                </div>
                <div className="px-5 py-3 border-t border-outline/5">
                  <Link to={`/groups/${groupId}/shifts`} className="w-full py-2 text-xs font-bold text-primary bg-primary-container/20 hover:bg-primary-container/40 rounded-lg transition-colors flex items-center justify-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">calendar_month</span>
                    Đi đến quản lý ca
                  </Link>
                </div>
              </>
            ) : (
              <div className="px-5 py-3 border-t border-outline/5">
                <button type="button" onClick={() => setExpanded((prev) => ({ ...prev, [alert.shiftId]: true }))} className="w-full py-2 text-xs font-bold text-primary bg-primary-container/20 hover:bg-primary-container/40 rounded-lg transition-colors flex items-center justify-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">search</span>
                  Xem chi tiết thiếu theo vị trí
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
