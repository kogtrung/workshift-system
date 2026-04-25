import { apiFetch } from '../../api/apiClient'

export function getMyAvailability() {
  return apiFetch('/availability')
}

export function updateMyAvailability(slots) {
  return apiFetch('/availability', {
    method: 'PUT',
    body: JSON.stringify({ slots }),
  })
}
