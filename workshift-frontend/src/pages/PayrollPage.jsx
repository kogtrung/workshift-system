import { useEffect, useState } from 'react'
import { useParams, useOutletContext } from 'react-router-dom'
import { getPayroll } from '../services/payroll/payrollApi'
import { PayrollHeader } from '../components/payroll/PayrollHeader'
import { PayrollMonthNavigator } from '../components/payroll/PayrollMonthNavigator'
import { PayrollStats } from '../components/payroll/PayrollStats'
import { PayrollTable } from '../components/payroll/PayrollTable'
import { ErrorAlert } from '../components/common/ErrorAlert'
import { LoadingState } from '../components/common/LoadingState'

export function PayrollPage() {
  const { groupId } = useParams()
  const { isManager } = useOutletContext() || {}

  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [payroll, setPayroll] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function loadPayroll() {
    setLoading(true); setError(null)
    try {
      const res = await getPayroll(groupId, month, year)
      setPayroll(res?.data ?? res ?? null)
    } catch (err) {
      setError(err?.message || 'Không thể tải bảng lương')
    } finally { setLoading(false) }
  }

  useEffect(() => { loadPayroll() }, [groupId, month, year])

  const entries = Array.isArray(payroll?.entries)
    ? payroll.entries
    : (Array.isArray(payroll?.items) ? payroll.items : [])
  const totalShifts = entries.reduce((s, e) => s + Number(e.totalShifts ?? e.shiftsWorked ?? 0), 0)
  const totalHours = entries.reduce((s, e) => s + Number(e.totalHours || 0), 0)
  const totalPay = entries.reduce((s, e) => s + Number(e.totalPay ?? e.estimatedPay ?? 0), 0)

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  if (!isManager) {
    return (
      <div className="w-full text-center py-20">
        <span className="material-symbols-outlined text-5xl text-on-surface-variant opacity-20 mb-4">lock</span>
        <h3 className="text-xl font-bold text-on-surface mb-2">Không có quyền truy cập</h3>
        <p className="text-on-surface-variant">Chỉ quản lý mới có thể xem bảng lương.</p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      <PayrollHeader />
      <PayrollMonthNavigator month={month} year={year} onPrev={prevMonth} onNext={nextMonth} />

      <ErrorAlert message={error} />
      {loading && <LoadingState />}

      {!loading && !error && <PayrollStats entries={entries} totalShifts={totalShifts} totalHours={totalHours} totalPay={totalPay} />}
      {!loading && !error && <PayrollTable entries={entries} month={month} year={year} totalShifts={totalShifts} totalHours={totalHours} totalPay={totalPay} />}
    </div>
  )
}
