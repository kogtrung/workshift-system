import { useEffect, useState } from 'react'
import { useParams, useOutletContext, useNavigate } from 'react-router-dom'
import { updateGroup, deleteGroup, toggleGroupStatus, leaveGroup } from '../services/groups/groupApi'
import { GroupSettingsStaffView } from '../components/groupSettings/GroupSettingsStaffView'
import { GroupSettingsManagerView } from '../components/groupSettings/GroupSettingsManagerView'
import { GroupSettingsDeleteModal } from '../components/groupSettings/GroupSettingsDeleteModal'

export function GroupSettingsPage() {
  const { groupId } = useParams()
  const navigate = useNavigate()
  const { isManager, groupInfo } = useOutletContext() || {}

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState(null)
  const [saveErr, setSaveErr] = useState(null)
  const [leaving, setLeaving] = useState(false)
  const [leaveErr, setLeaveErr] = useState(null)

  // close/reopen
  const [toggling, setToggling] = useState(false)
  const [toggleMsg, setToggleMsg] = useState(null)

  // permanent delete
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteErr, setDeleteErr] = useState(null)

  const isActive = groupInfo?.groupStatus === 'ACTIVE'

  useEffect(() => {
    if (groupInfo) {
      setName(groupInfo.groupName || '')
      setDescription(groupInfo.description || '')
    }
  }, [groupInfo])

  async function handleSave(e) {
    e.preventDefault()
    if (!name.trim()) { setSaveErr('Tên group không được để trống'); return }
    setSaving(true); setSaveErr(null); setSaveMsg(null)
    try {
      await updateGroup(groupId, { name: name.trim(), description: description.trim() || null })
      setSaveMsg('Cập nhật thành công! Tải lại trang để thấy thay đổi.')
    } catch (err) {
      setSaveErr(err?.message || 'Không thể cập nhật')
    } finally { setSaving(false) }
  }

  async function handleToggle() {
    setToggling(true); setToggleMsg(null)
    try {
      await toggleGroupStatus(groupId)
      setToggleMsg(isActive ? 'Đã đóng group. Tải lại trang để cập nhật.' : 'Đã mở lại group. Tải lại trang để cập nhật.')
    } catch (err) { alert(err?.message || 'Lỗi') }
    finally { setToggling(false) }
  }

  async function handleDelete() {
    setDeleting(true); setDeleteErr(null)
    try {
      await deleteGroup(groupId)
      navigate('/app/groups', { replace: true })
    } catch (err) {
      setDeleteErr(err?.message || 'Không thể xóa group')
    } finally { setDeleting(false) }
  }

  async function handleLeaveGroup() {
    if (!confirm('Bạn có chắc chắn muốn rời group này?')) return
    setLeaving(true); setLeaveErr(null)
    try {
      await leaveGroup(groupId)
      navigate('/app/groups', { replace: true })
    } catch (err) {
      setLeaveErr(err?.message || 'Không thể rời group')
    } finally { setLeaving(false) }
  }

  /* ───── Staff read-only view ───── */
  if (!isManager) {
    return (
      <GroupSettingsStaffView
        groupInfo={groupInfo}
        isActive={isActive}
        leaving={leaving}
        leaveErr={leaveErr}
        onLeaveGroup={handleLeaveGroup}
      />
    )
  }

  /* ───── Manager view ───── */
  return (
    <>
      <GroupSettingsManagerView
        groupInfo={groupInfo}
        isActive={isActive}
        name={name}
        description={description}
        saving={saving}
        saveMsg={saveMsg}
        saveErr={saveErr}
        toggling={toggling}
        toggleMsg={toggleMsg}
        onChangeName={setName}
        onChangeDescription={setDescription}
        onSave={handleSave}
        onToggle={handleToggle}
        onOpenDelete={() => setShowDeleteConfirm(true)}
      />
      <GroupSettingsDeleteModal
        show={showDeleteConfirm}
        groupName={groupInfo?.groupName || ''}
        deleteInput={deleteInput}
        deleteErr={deleteErr}
        deleting={deleting}
        onClose={() => { setShowDeleteConfirm(false); setDeleteInput(''); setDeleteErr(null) }}
        onChangeDeleteInput={setDeleteInput}
        onDelete={handleDelete}
      />
    </>
  )
}
