import { useEffect, useMemo, useState } from 'react'
import { useParams, useOutletContext } from 'react-router-dom'
import { unwrapApiResponse } from '../api/apiClient'
import { getPendingMembers, reviewMember } from '../services/groups/groupApi'
import { PendingMembersHeader } from '../components/pendingMembers/PendingMembersHeader'
import { PendingMembersTable } from '../components/pendingMembers/PendingMembersTable'

export function PendingMembersPage() {
  const { groupId } = useParams()
  const { groupInfo } = useOutletContext() || {}
  const numericGroupId = useMemo(() => Number(groupId), [groupId])

  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [actingMemberId, setActingMemberId] = useState(null)

  async function load() {
    if (!Number.isFinite(numericGroupId) || numericGroupId <= 0) return
    setError('')
    setIsLoading(true)
    try {
      const payload = await getPendingMembers(numericGroupId)
      const data = unwrapApiResponse(payload)
      setItems(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err?.message || 'Không thể tải danh sách')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { load() }, [numericGroupId])

  async function act(memberId, action) {
    if (!Number.isFinite(numericGroupId) || numericGroupId <= 0) return
    setActionError('')
    setActingMemberId(memberId)
    try {
      const payload = await reviewMember(numericGroupId, memberId, { action })
      unwrapApiResponse(payload)
      await load()
    } catch (err) {
      setActionError(err?.message || 'Thao tác thất bại')
    } finally {
      setActingMemberId(null)
    }
  }

  return (
    <div className="w-full space-y-6">
      <PendingMembersHeader groupName={groupInfo?.groupName} joinCode={groupInfo?.joinCode} loading={isLoading} onRefresh={load} />

      {error && (
        <div className="bg-error-container/20 text-on-error-container rounded-xl px-4 py-3 text-sm font-medium">{error}</div>
      )}
      {actionError && (
        <div className="bg-error-container/20 text-on-error-container rounded-xl px-4 py-3 text-sm font-medium">{actionError}</div>
      )}

      <PendingMembersTable items={items} isLoading={isLoading} actingMemberId={actingMemberId} onAct={act} />
    </div>
  )
}
