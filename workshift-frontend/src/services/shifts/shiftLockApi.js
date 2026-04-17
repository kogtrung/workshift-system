import { apiFetch } from '../../api/apiClient'

export function lockShift(groupId, shiftId) {
  return apiFetch(`/groups/${groupId}/shifts/${shiftId}/lock`, {
    method: 'PATCH',
  })
}
