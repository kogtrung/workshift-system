import { useEffect, useMemo, useState } from "react"
import { useParams, useOutletContext } from "react-router-dom"
import {
  approveShiftChangeRequest,
  listPendingShiftChangeRequests,
  rejectShiftChangeRequest,
} from '../services/shiftChange/shiftChangeApi'
import { unwrapApiArray } from "../api/apiClient"
import { ShiftChangeRequestsHeader } from '../components/shiftChangeRequests/ShiftChangeRequestsHeader'

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function RequestRow({ item, actioningId, rejectingId, onApprove, onStartReject }) {
  const isActioning = actioningId === item.id
  const isRejecting = rejectingId === item.id

  return (
    <tr className={`border-b border-outline/5 transition-colors ${isRejecting ? 'bg-error-container/5' : 'hover:bg-surface-container/20'}`}>
      <td className="px-4 py-4">
        <div className="font-bold text-on-surface text-sm">{item.fullName || item.username}</div>
        <div className="text-xs text-on-surface-variant mt-0.5">@{item.username}</div>
      </td>
      <td className="px-4 py-4">
        <div className="text-sm font-medium text-on-surface">
          {item.fromShiftDate ? fmtDate(item.fromShiftDate) : '—'}
        </div>
        <div className="text-xs text-on-surface-variant">{item.fromShiftStartTime?.slice(0,5)}–{item.fromShiftEndTime?.slice(0,5)}</div>
        {item.fromPositionName && <div className="text-xs text-primary mt-0.5">{item.fromPositionName}</div>}
      </td>
      <td className="px-4 py-4 text-center">
        {item.toShiftId ? (
          <div>
            <div className="text-sm font-medium text-on-surface">{fmtDate(item.toShiftDate)}</div>
            <div className="text-xs text-on-surface-variant">{item.toShiftStartTime?.slice(0,5)}–{item.toShiftEndTime?.slice(0,5)}</div>
          </div>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">Xin nghỉ</span>
        )}
      </td>
      <td className="px-4 py-4 text-sm text-on-surface-variant max-w-[160px] truncate" title={item.reason || ''}>
        {item.reason || <span className="opacity-40">—</span>}
      </td>
      <td className="px-4 py-4 text-right space-x-2">
        <button
          type="button"
          onClick={() => onApprove(item.id)}
          disabled={!!actioningId || !!rejectingId}
          className="px-3 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg hover:bg-emerald-200 transition-colors disabled:opacity-50"
        >
          {isActioning ? '...' : 'Duyệt'}
        </button>
        <button
          type="button"
          onClick={() => onStartReject(item.id)}
          disabled={!!actioningId || !!rejectingId}
          className="px-3 py-1.5 bg-error-container/30 text-error text-xs font-bold rounded-lg hover:bg-error-container/50 transition-colors disabled:opacity-50"
        >
          Từ chối
        </button>
      </td>
    </tr>
  )
}

function RejectRow({ onConfirm, onCancel, loading }) {
  const [note, setNote] = useState('')
  return (
    <tr className="bg-error-container/5 border-b border-error/10">
      <td colSpan={5} className="px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-error uppercase tracking-wide shrink-0">Lý do từ chối:</span>
          <input
            autoFocus
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') onConfirm(note); if (e.key === 'Escape') onCancel() }}
            placeholder="Tùy chọn — Enter để xác nhận, Esc để hủy"
            className="flex-1 bg-white rounded-lg border border-outline/20 px-3 py-1.5 text-sm focus:outline-none focus:border-error focus:ring-2 focus:ring-error/20"
          />
          <button
            type="button"
            onClick={() => onConfirm(note)}
            disabled={loading}
            className="px-3 py-1.5 bg-error text-on-error text-xs font-bold rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            {loading ? '...' : 'Xác nhận'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 border border-outline/20 text-on-surface-variant text-xs font-medium rounded-lg hover:bg-surface-container"
          >
            Hủy
          </button>
        </div>
      </td>
    </tr>
  )
}

export function ShiftChangeRequestsPage() {
  const { groupId } = useParams()
  const { isManager, groupInfo } = useOutletContext() || {}

  const numericGroupId = useMemo(() => Number(groupId), [groupId])

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [actioningId, setActioningId] = useState(null)
  const [rejectingId, setRejectingId] = useState(null)
  const [rejectLoading, setRejectLoading] = useState(false)

  async function load() {
    if (!Number.isFinite(numericGroupId) || numericGroupId <= 0) return
    setLoading(true)
    setError("")
    try {
      const res = await listPendingShiftChangeRequests(numericGroupId)
      setItems(unwrapApiArray(res))
    } catch (e) {
      setError(e?.message || "Không thể tải yêu cầu đổi ca")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [numericGroupId])

  async function handleApprove(requestId) {
    setActioningId(requestId)
    try {
      await approveShiftChangeRequest(numericGroupId, requestId)
      await load()
    } catch (e) {
      alert(e?.message || "Không thể duyệt yêu cầu")
    } finally {
      setActioningId(null)
    }
  }

  async function handleRejectConfirm(note) {
    if (!rejectingId) return
    setRejectLoading(true)
    try {
      await rejectShiftChangeRequest(numericGroupId, rejectingId, note || null)
      setRejectingId(null)
      await load()
    } catch (e) {
      alert(e?.message || "Không thể từ chối yêu cầu")
    } finally {
      setRejectLoading(false)
    }
  }

  if (!isManager) {
    return (
      <div className="w-full text-center py-20">
        <span className="material-symbols-outlined text-5xl text-on-surface-variant opacity-20 mb-4">lock</span>
        <h3 className="text-xl font-bold text-on-surface mb-2">Không có quyền truy cập</h3>
        <p className="text-on-surface-variant">Chỉ quản lý mới có thể duyệt yêu cầu đổi ca.</p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      <ShiftChangeRequestsHeader groupName={groupInfo?.groupName} groupId={groupId} loading={loading} onRefresh={load} />

      {error ? (
        <div className="bg-error-container/20 text-on-error-container rounded-xl px-4 py-3 text-sm font-medium">{error}</div>
      ) : null}

      {loading ? (
        <div className="text-center py-12"><p className="text-on-surface-variant animate-pulse">Đang tải...</p></div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 bg-surface-container-lowest rounded-2xl border border-outline/10 border-dashed">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant opacity-20 mb-3">swap_horiz</span>
          <h3 className="text-xl font-bold text-on-surface mb-2">Không có yêu cầu chờ duyệt</h3>
          <p className="text-on-surface-variant">Tất cả yêu cầu đổi ca đã được xử lý.</p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline/10 overflow-hidden">
          <div className="px-6 py-4 bg-surface-container-low border-b border-outline/10 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">swap_horiz</span>
            <h4 className="text-base font-bold text-on-surface">Yêu cầu đổi ca chờ duyệt</h4>
            <span className="ml-auto inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-on-primary text-xs font-black">{items.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline/10 bg-surface-container/30">
                  <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-widest text-on-surface-variant">Nhân viên</th>
                  <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-widest text-on-surface-variant">Ca hiện tại</th>
                  <th className="text-center px-4 py-3 font-bold text-[10px] uppercase tracking-widest text-on-surface-variant">Ca muốn chuyển</th>
                  <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-widest text-on-surface-variant">Lý do</th>
                  <th className="text-right px-4 py-3 font-bold text-[10px] uppercase tracking-widest text-on-surface-variant">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <>
                    <RequestRow
                      key={item.id}
                      item={item}
                      actioningId={actioningId}
                      rejectingId={rejectingId}
                      onApprove={handleApprove}
                      onStartReject={(id) => setRejectingId(id)}
                    />
                    {rejectingId === item.id && (
                      <RejectRow
                        key={`reject-${item.id}`}
                        loading={rejectLoading}
                        onConfirm={handleRejectConfirm}
                        onCancel={() => setRejectingId(null)}
                      />
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
