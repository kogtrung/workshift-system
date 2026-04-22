import { useEffect, useState } from 'react'
import { useParams, useOutletContext } from 'react-router-dom'
import { getPositions, createPosition, updatePosition, deletePosition } from '../services/positions/positionApi'
import { unwrapApiArray } from '../api/apiClient'
import { PositionsHeader } from '../components/positions/PositionsHeader'
import { PositionsGrid } from '../components/positions/PositionsGrid'
import { PositionFormModal } from '../components/positions/PositionFormModal'
import { ErrorAlert } from '../components/common/ErrorAlert'
import { LoadingState } from '../components/common/LoadingState'

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#ef4444', '#f97316',
  '#f59e0b', '#eab308', '#84cc16', '#22c55e',
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#2563eb', '#6d28d9', '#78716c',
]

export function PositionsPage() {
  const { groupId } = useParams()
  const { isManager } = useOutletContext() || {}
  const [positions, setPositions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formName, setFormName] = useState('')
  const [formColor, setFormColor] = useState(PRESET_COLORS[0])
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)

  async function loadPositions() {
    setLoading(true)
    setError(null)
    try {
      const res = await getPositions(groupId)
      setPositions(unwrapApiArray(res))
    } catch (err) {
      setError(err?.message || 'Không thể tải danh sách vị trí')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadPositions() }, [groupId])

  function openCreate() {
    setEditingId(null)
    setFormName('')
    setFormColor(PRESET_COLORS[0])
    setFormError(null)
    setShowForm(true)
  }

  function openEdit(pos) {
    setEditingId(pos.id)
    setFormName(pos.name)
    setFormColor(pos.colorCode || PRESET_COLORS[0])
    setFormError(null)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setFormName('')
    setFormColor(PRESET_COLORS[0])
    setFormError(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!formName.trim()) { setFormError('Tên vị trí không được để trống'); return }
    setSubmitting(true)
    setFormError(null)
    try {
      const payload = { name: formName.trim(), colorCode: formColor }
      if (editingId) {
        await updatePosition(groupId, editingId, payload)
      } else {
        await createPosition(groupId, payload)
      }
      closeForm()
      await loadPositions()
    } catch (err) {
      setFormError(err?.message || 'Có lỗi xảy ra')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(pos) {
    if (!confirm(`Xóa vị trí "${pos.name}"?`)) return
    try {
      await deletePosition(groupId, pos.id)
      await loadPositions()
    } catch (err) {
      alert(err?.message || 'Không thể xóa vị trí')
    }
  }

  return (
    <div className="w-full space-y-8">
      <PositionsHeader isManager={isManager} onCreate={openCreate} />

      {/* Loading */}
      {loading && <LoadingState />}

      {/* Error */}
      <ErrorAlert message={error} />

      {!loading && !error && (
        <PositionsGrid
          positions={positions}
          isManager={isManager}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      )}

      <PositionFormModal
        open={showForm}
        editingId={editingId}
        formError={formError}
        formName={formName}
        formColor={formColor}
        submitting={submitting}
        presetColors={PRESET_COLORS}
        onClose={closeForm}
        onSubmit={handleSubmit}
        setFormName={setFormName}
        setFormColor={setFormColor}
      />
    </div>
  )
}
