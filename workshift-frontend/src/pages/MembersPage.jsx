import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getGroupMembers } from '../services/groups/groupApi'
import { unwrapApiArray } from '../api/apiClient'
import { MembersHeader } from '../components/members/MembersHeader'
import { MembersTable } from '../components/members/MembersTable'
import { MembersStats } from '../components/members/MembersStats'

export function MembersPage() {
  const { groupId } = useParams()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const res = await getGroupMembers(groupId)
        if (!cancelled) setMembers(unwrapApiArray(res))
      } catch (err) {
        if (!cancelled) setError(err?.message || 'Không thể tải danh sách thành viên')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [groupId])

  const managers = members.filter((m) => m.role === 'MANAGER')
  const staff = members.filter((m) => m.role === 'MEMBER')

  return (
    <div className="w-full space-y-8">
      <MembersHeader total={members.length} />

      {loading && (
        <div className="text-center py-12">
          <p className="text-on-surface-variant animate-pulse">Đang tải...</p>
        </div>
      )}

      {error && (
        <div className="bg-error-container/20 text-on-error-container rounded-xl p-4 text-center">
          {error}
        </div>
      )}

      {!loading && !error && <MembersTable members={members} managers={managers} staff={staff} />}
      {!loading && !error && <MembersStats members={members} managers={managers} staff={staff} />}
    </div>
  )
}
