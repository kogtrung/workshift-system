import { apiFetch } from '../../api/apiClient'

export function getShiftRecommendations(groupId, shiftId, positionId) {
  const qs = new URLSearchParams()
  qs.set('positionId', String(positionId))
  return apiFetch(`/groups/${groupId}/shifts/${shiftId}/recommendations?${qs.toString()}`)
}
