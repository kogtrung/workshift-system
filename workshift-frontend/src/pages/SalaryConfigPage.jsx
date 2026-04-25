import { useEffect, useMemo, useState } from 'react'
import { useParams, useOutletContext } from 'react-router-dom'
import { getSalaryConfigs, createSalaryConfig, deleteSalaryConfig } from '../services/salaryConfig/salaryApi'
import { getPositions } from '../services/positions/positionApi'
import { getGroupMembers } from '../services/groups/groupApi'
import { formatLocalISODate } from '../utils/dateUtils'
import { unwrapApiArray } from '../api/apiClient'
import { SalaryConfigHeader } from '../components/salaryConfig/SalaryConfigHeader'
import { SalaryConfigStats } from '../components/salaryConfig/SalaryConfigStats'
import { SalaryConfigList } from '../components/salaryConfig/SalaryConfigList'
import { SalaryConfigFormModal } from '../components/salaryConfig/SalaryConfigFormModal'
import { SalaryConfigToast } from '../components/salaryConfig/SalaryConfigToast'

export function SalaryConfigPage() {
  const { groupId } = useParams()
  const { isManager } = useOutletContext() || {}

  const [configs, setConfigs] = useState([])
  const [positions, setPositions] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [formType, setFormType] = useState('position') // 'position' | 'user'
  const [formPosId, setFormPosId] = useState('')
  const [formUserId, setFormUserId] = useState('')
  const [formRate, setFormRate] = useState('')
  const [formDate, setFormDate] = useState(() => formatLocalISODate(new Date()))
  const [saving, setSaving] = useState(false)
  const [formErr, setFormErr] = useState(null)

  async function loadData() {
    setLoading(true); setError(null)
    try {
      const [cfgRes, posRes, memRes] = await Promise.all([
        getSalaryConfigs(groupId),
        getPositions(groupId),
        getGroupMembers(groupId).catch(() => []),
      ])
      setConfigs(unwrapApiArray(cfgRes))
      setPositions(unwrapApiArray(posRes))
      setMembers(unwrapApiArray(memRes).filter((m) => m.status === 'APPROVED'))
    } catch (err) {
      setError(err?.message || 'Không thể tải dữ liệu')
    } finally { setLoading(false) }
  }

  useEffect(() => { loadData() }, [groupId])

  const positionNameById = useMemo(() => {
    const m = new Map()
    for (const p of positions) m.set(Number(p.id), p.name ?? '')
    return m
  }, [positions])

  const memberLabelByUserId = useMemo(() => {
    const m = new Map()
    for (const mb of members) {
      const uid = Number(mb.userId)
      const label = (mb.fullName && String(mb.fullName).trim()) || mb.username || ''
      m.set(uid, label)
    }
    return m
  }, [members])

  function resolveConfigDisplayName(cfg) {
    if (cfg.userId != null && cfg.userId !== '') {
      const uid = Number(cfg.userId)
      return (cfg.userFullName && String(cfg.userFullName).trim())
        || memberLabelByUserId.get(uid)
        || `NV #${cfg.userId}`
    }
    const pid = cfg.positionId != null ? Number(cfg.positionId) : null
    return (cfg.positionName && String(cfg.positionName).trim())
      || (pid != null ? positionNameById.get(pid) : null)
      || (pid != null ? `Vị trí #${pid}` : '—')
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!formRate || Number(formRate) < 0) { setFormErr('Nhập mức lương hợp lệ'); return }
    if (formType === 'position' && !formPosId) { setFormErr('Chọn vị trí'); return }
    if (formType === 'user' && !formUserId) { setFormErr('Chọn nhân viên'); return }

    setSaving(true); setFormErr(null)
    try {
      const data = {
        hourlyRate: Number(formRate),
        effectiveDate: formDate,
      }
      if (formType === 'position') data.positionId = Number(formPosId)
      else data.userId = Number(formUserId)

      await createSalaryConfig(groupId, data)
      showToast('Tạo cấu hình lương thành công!')
      setShowForm(false)
      resetForm()
      await loadData()
    } catch (err) {
      setFormErr(err?.message || 'Không thể tạo cấu hình')
    } finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!confirm('Xóa cấu hình lương này?')) return
    try {
      await deleteSalaryConfig(groupId, id)
      showToast('Đã xóa cấu hình lương')
      await loadData()
    } catch (err) {
      setError(err?.message || 'Không thể xóa')
    }
  }

  function resetForm() {
    setFormType('position'); setFormPosId(''); setFormUserId(''); setFormRate('')
    setFormDate(formatLocalISODate(new Date())); setFormErr(null)
  }

  if (!isManager) {
    return (
      <div className="w-full text-center py-20">
        <span className="material-symbols-outlined text-5xl text-on-surface-variant opacity-20 mb-4">lock</span>
        <h3 className="text-xl font-bold text-on-surface mb-2">Không có quyền truy cập</h3>
        <p className="text-on-surface-variant">Chỉ quản lý mới có thể quản lý cấu hình lương.</p>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      <SalaryConfigHeader onOpenCreate={() => { resetForm(); setShowForm(true) }} />

      {error && <div className="bg-error-container/20 text-on-error-container rounded-xl p-4 text-center">{error}</div>}
      <SalaryConfigToast message={toast} onClose={() => setToast(null)} />

      {loading && <div className="text-center py-12"><p className="text-on-surface-variant animate-pulse">Đang tải...</p></div>}

      {!loading && <SalaryConfigStats configs={configs} />}

      {!loading && (
        <SalaryConfigList
          configs={configs}
          resolveConfigDisplayName={resolveConfigDisplayName}
          onDelete={handleDelete}
        />
      )}

      <SalaryConfigFormModal
        show={showForm}
        formErr={formErr}
        formType={formType}
        formPosId={formPosId}
        formUserId={formUserId}
        formRate={formRate}
        formDate={formDate}
        positions={positions}
        members={members}
        saving={saving}
        onClose={() => setShowForm(false)}
        onSubmit={handleCreate}
        setFormType={setFormType}
        setFormPosId={setFormPosId}
        setFormUserId={setFormUserId}
        setFormRate={setFormRate}
        setFormDate={setFormDate}
      />
    </div>
  )
}
