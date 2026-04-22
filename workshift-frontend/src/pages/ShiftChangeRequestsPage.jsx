import { useEffect, useMemo, useState } from "react"
import { useParams, useOutletContext } from "react-router-dom"
import {
  approveShiftChangeRequest,
  listPendingShiftChangeRequests,
  rejectShiftChangeRequest,
} from '../services/shiftChange/shiftChangeApi'
import { unwrapApiArray } from "../api/apiClient"
import { ShiftChangeRequestsHeader } from '../components/shiftChangeRequests/ShiftChangeRequestsHeader'
import { ShiftChangeRequestsTable } from '../components/shiftChangeRequests/ShiftChangeRequestsTable'

export function ShiftChangeRequestsPage() {
  const { groupId } = useParams()
  const { isManager, groupInfo } = useOutletContext() || {}

  const numericGroupId = useMemo(() => Number(groupId), [groupId])

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [actioningId, setActioningId] = useState(null)

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

  useEffect(() => {
    load()
  }, [numericGroupId])

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

  async function handleReject(requestId) {
    const reason = prompt("Lý do từ chối (tùy chọn):")
    if (reason === null) return

    setActioningId(requestId)
    try {
      await rejectShiftChangeRequest(numericGroupId, requestId, reason || null)
      await load()
    } catch (e) {
      alert(e?.message || "Không thể từ chối yêu cầu")
    } finally {
      setActioningId(null)
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
        <div className="bg-error-container/20 text-on-error-container rounded-xl px-4 py-3 text-sm font-medium">
          {error}
        </div>
      ) : null}

      <ShiftChangeRequestsTable loading={loading} items={items} actioningId={actioningId} onApprove={handleApprove} onReject={handleReject} />
    </div>
  )
}

