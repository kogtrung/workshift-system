import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { unwrapApiResponse } from '../api/apiClient'
import { getAuditLogs, getDailySummary, getMonthlySummary } from '../services/audit/auditApi'
import { formatLocalISODate } from '../utils/dateUtils'
import { AuditLogsHeader } from '../components/auditLogs/AuditLogsHeader'
import { AuditLogsSummaryCards } from '../components/auditLogs/AuditLogsSummaryCards'
import { AuditLogsFilters } from '../components/auditLogs/AuditLogsFilters'
import { AuditLogsTable } from '../components/auditLogs/AuditLogsTable'

const ACTION_TYPE_LABELS = {
  GROUP_CREATED: 'Tạo nhóm',
  GROUP_MEMBER_JOIN_REQUESTED: 'Yêu cầu tham gia',
  GROUP_MEMBER_APPROVED: 'Duyệt thành viên',
  GROUP_MEMBER_REJECTED: 'Từ chối thành viên',
}

const ENTITY_TYPE_LABELS = {
  GROUP: 'Nhóm',
  GROUP_MEMBER: 'Thành viên',
}

const ACTOR_ROLE_LABELS = {
  MANAGER: 'Quản lý',
  MEMBER: 'Thành viên',
  SYSTEM: 'Hệ thống',
}

function friendlyActionType(raw) {
  return ACTION_TYPE_LABELS[raw] || raw
}

function friendlyEntityType(raw) {
  return ENTITY_TYPE_LABELS[raw] || raw
}

function friendlyActorRole(raw) {
  return ACTOR_ROLE_LABELS[raw] || raw
}

export function AuditLogsPage() {
  const { groupId } = useParams()
  const numericGroupId = useMemo(() => Number(groupId), [groupId])

  const today = useMemo(() => new Date(), [])
  const yyyy = today.getFullYear()
  const mm = today.getMonth() + 1
  const isoDate = formatLocalISODate(today)

  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [actionType, setActionType] = useState('')
  const [actorUserId, setActorUserId] = useState('')
  const [entityType, setEntityType] = useState('')
  const [entityId, setEntityId] = useState('')
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(20)

  const [logs, setLogs] = useState(null)
  const [daily, setDaily] = useState(null)
  const [monthly, setMonthly] = useState(null)
  const [dailyDate, setDailyDate] = useState(isoDate)
  const [monthlyMonth, setMonthlyMonth] = useState(mm)
  const [monthlyYear, setMonthlyYear] = useState(yyyy)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    if (!Number.isFinite(numericGroupId) || numericGroupId <= 0) return
    setError('')
    setIsLoading(true)
    try {
      const payload = await getAuditLogs(numericGroupId, {
        from: from || null,
        to: to || null,
        actionType: actionType || null,
        actorUserId: actorUserId || null,
        entityType: entityType || null,
        entityId: entityId || null,
        page,
        size,
      })
      const data = unwrapApiResponse(payload)
      setLogs(data)
    } catch (err) {
      setError(err?.message || 'Không thể tải audit logs')
    } finally {
      setIsLoading(false)
    }
  }

  async function loadSummaries() {
    if (!Number.isFinite(numericGroupId) || numericGroupId <= 0) return
    try {
      const [dailyPayload, monthlyPayload] = await Promise.all([
        getDailySummary(numericGroupId, { date: dailyDate }),
        getMonthlySummary(numericGroupId, { month: monthlyMonth, year: monthlyYear }),
      ])
      setDaily(unwrapApiResponse(dailyPayload))
      setMonthly(unwrapApiResponse(monthlyPayload))
    } catch {
      setDaily(null)
      setMonthly(null)
    }
  }

  useEffect(() => {
    load()
  }, [numericGroupId, page, size])

  useEffect(() => {
    loadSummaries()
  }, [numericGroupId, dailyDate, monthlyMonth, monthlyYear])

  return (
    <div className="w-full">
      <AuditLogsHeader isLoading={isLoading} onRefresh={load} />

      {error ? (
        <div className="mb-6 bg-error-container/20 text-on-error-container rounded-xl px-4 py-3 text-sm font-medium">
          {error}
        </div>
      ) : null}

      <AuditLogsSummaryCards
        dailyDate={dailyDate}
        monthlyMonth={monthlyMonth}
        monthlyYear={monthlyYear}
        daily={daily}
        monthly={monthly}
        actionTypeLabels={ACTION_TYPE_LABELS}
        onChangeDailyDate={setDailyDate}
        onChangeMonthlyMonth={setMonthlyMonth}
        onChangeMonthlyYear={setMonthlyYear}
      />

      <AuditLogsFilters
        from={from}
        to={to}
        actionType={actionType}
        actorUserId={actorUserId}
        entityType={entityType}
        entityId={entityId}
        page={page}
        size={size}
        actionTypeLabels={ACTION_TYPE_LABELS}
        entityTypeLabels={ENTITY_TYPE_LABELS}
        onChangeFrom={setFrom}
        onChangeTo={setTo}
        onChangeActionType={setActionType}
        onChangeActorUserId={setActorUserId}
        onChangeEntityType={setEntityType}
        onChangeEntityId={setEntityId}
        onChangePage={setPage}
        onChangeSize={setSize}
        onApply={() => { setPage(0); load() }}
      />

      <AuditLogsTable
        logs={logs}
        isLoading={isLoading}
        friendlyActionType={friendlyActionType}
        friendlyActorRole={friendlyActorRole}
        friendlyEntityType={friendlyEntityType}
      />
    </div>
  )
}
