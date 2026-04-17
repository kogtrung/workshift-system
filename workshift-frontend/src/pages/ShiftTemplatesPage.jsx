import { useEffect, useState } from 'react'
import { useParams, useOutletContext } from 'react-router-dom'
import { getTemplates, createTemplate, updateTemplate, deleteTemplate } from '../services/shifts/shiftTemplateApi'
import { getPositions } from '../services/positions/positionApi'
import { unwrapApiArray } from '../api/apiClient'
import { ShiftTemplatesHeader } from '../components/shiftTemplates/ShiftTemplatesHeader'
import { ShiftTemplatesGrid } from '../components/shiftTemplates/ShiftTemplatesGrid'
import { ShiftTemplateFormModal } from '../components/shiftTemplates/ShiftTemplateFormModal'

export function ShiftTemplatesPage() {
  const { groupId } = useParams()
  const { isManager } = useOutletContext() || {}
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formName, setFormName] = useState('')
  const [formStart, setFormStart] = useState('')
  const [formEnd, setFormEnd] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)

  // positions + requirements
  const [positions, setPositions] = useState([])
  const [formReqs, setFormReqs] = useState([]) // [{positionId, quantity}]

  async function loadTemplates() {
    setLoading(true)
    setError(null)
    try {
      const res = await getTemplates(groupId)
      setTemplates(unwrapApiArray(res))
    } catch (err) {
      setError(err?.message || 'Không thể tải danh sách ca mẫu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadTemplates() }, [groupId])

  useEffect(() => {
    if (!groupId) return
    getPositions(groupId).then(res => {
      setPositions(unwrapApiArray(res))
    }).catch(() => {})
  }, [groupId])

  function formatTime(t) {
    if (!t) return '—'
    // handle "HH:mm:ss" or "HH:mm"
    return String(t).substring(0, 5)
  }

  function openCreate() {
    setEditingId(null)
    setFormName('')
    setFormStart('')
    setFormEnd('')
    setFormDesc('')
    setFormError(null)
    setFormReqs([])
    setShowForm(true)
  }

  function openEdit(tpl) {
    setEditingId(tpl.id)
    setFormName(tpl.name)
    setFormStart(formatTime(tpl.startTime))
    setFormEnd(formatTime(tpl.endTime))
    setFormDesc(tpl.description || '')
    setFormError(null)
    setFormReqs((tpl.requirements || []).map(r => ({ positionId: r.positionId, quantity: r.quantity })))
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setFormError(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!formName.trim()) { setFormError('Tên ca mẫu không được để trống'); return }
    if (!formStart || !formEnd) { setFormError('Giờ bắt đầu và kết thúc là bắt buộc'); return }
    setSubmitting(true)
    setFormError(null)
    try {
      const payload = {
        name: formName.trim(),
        startTime: formStart + ':00',
        endTime: formEnd + ':00',
        description: formDesc.trim() || null,
        requirements: formReqs.filter(r => r.positionId && r.quantity > 0),
      }
      if (editingId) {
        await updateTemplate(groupId, editingId, payload)
      } else {
        await createTemplate(groupId, payload)
      }
      closeForm()
      await loadTemplates()
    } catch (err) {
      setFormError(err?.message || 'Có lỗi xảy ra')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(tpl) {
    if (!confirm(`Xóa ca mẫu "${tpl.name}"?`)) return
    try {
      await deleteTemplate(groupId, tpl.id)
      await loadTemplates()
    } catch (err) {
      alert(err?.message || 'Không thể xóa')
    }
  }

  return (
    <div className="w-full space-y-8">
      <ShiftTemplatesHeader isManager={isManager} onCreate={openCreate} />

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <p className="text-on-surface-variant animate-pulse">Đang tải...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-error-container/20 text-on-error-container rounded-xl p-4 text-center">{error}</div>
      )}

      {!loading && !error && (
        <ShiftTemplatesGrid
          templates={templates}
          isManager={isManager}
          formatTime={formatTime}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      )}

      <ShiftTemplateFormModal
        show={showForm}
        editingId={editingId}
        formError={formError}
        formName={formName}
        formStart={formStart}
        formEnd={formEnd}
        formDesc={formDesc}
        formReqs={formReqs}
        positions={positions}
        submitting={submitting}
        onClose={closeForm}
        onSubmit={handleSubmit}
        setFormName={setFormName}
        setFormStart={setFormStart}
        setFormEnd={setFormEnd}
        setFormDesc={setFormDesc}
        setFormReqs={setFormReqs}
      />
    </div>
  )
}
