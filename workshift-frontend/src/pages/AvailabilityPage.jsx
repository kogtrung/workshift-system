import { useEffect, useState } from 'react'
import { unwrapApiArray } from '../api/apiClient'
import { getMyAvailability, updateMyAvailability } from '../services/availability/availabilityApi'
import { AvailabilityHeader } from '../components/availability/AvailabilityHeader'
import { AvailabilityStats } from '../components/availability/AvailabilityStats'
import { AvailabilityWeekGrid } from '../components/availability/AvailabilityWeekGrid'
import { LoadingState } from '../components/common/LoadingState'

function fmtTime(t) { return t ? String(t).substring(0, 5) : '' }

const DAYS = [
  { num: 1, label: 'Thứ 2', short: 'T2' },
  { num: 2, label: 'Thứ 3', short: 'T3' },
  { num: 3, label: 'Thứ 4', short: 'T4' },
  { num: 4, label: 'Thứ 5', short: 'T5' },
  { num: 5, label: 'Thứ 6', short: 'T6' },
  { num: 6, label: 'Thứ 7', short: 'T7' },
  { num: 7, label: 'Chủ nhật', short: 'CN' },
]

function emptySlots() {
  return DAYS.map((d) => ({ dayOfWeek: d.num, slots: [] }))
}

export function AvailabilityPage() {
  const [availability, setAvailability] = useState(() => emptySlots())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  async function loadData() {
    setLoading(true); setError(null)
    try {
      const res = await getMyAvailability()
      const list = unwrapApiArray(res)
      const grouped = emptySlots()
      list.forEach(item => {
        const dayEntry = grouped.find(g => g.dayOfWeek === item.dayOfWeek)
        if (dayEntry) {
          dayEntry.slots.push({
            id: item.id,
            startTime: fmtTime(item.startTime),
            endTime: fmtTime(item.endTime),
          })
        }
      })
      setAvailability(grouped)
    } catch (err) {
      setError(err?.message || 'Không thể tải lịch rảnh')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  function addSlot(dayIdx) {
    setAvailability(prev => {
      const next = prev.map((d, i) => i === dayIdx
        ? { ...d, slots: [...d.slots, { startTime: '08:00', endTime: '17:00' }] }
        : d
      )
      return next
    })
    setSuccess(null)
  }

  function removeSlot(dayIdx, slotIdx) {
    setAvailability(prev => {
      const next = prev.map((d, i) => i === dayIdx
        ? { ...d, slots: d.slots.filter((_, si) => si !== slotIdx) }
        : d
      )
      return next
    })
    setSuccess(null)
  }

  function updateSlot(dayIdx, slotIdx, field, value) {
    setAvailability(prev => {
      const next = prev.map((d, i) => i === dayIdx
        ? {
          ...d, slots: d.slots.map((s, si) => si === slotIdx
            ? { ...s, [field]: value }
            : s
          )
        }
        : d
      )
      return next
    })
    setSuccess(null)
  }

  async function handleSave() {
    setSaving(true); setError(null); setSuccess(null)
    try {
      const slots = []
      availability.forEach((day) => {
        day.slots.forEach((slot) => {
          if (slot.startTime && slot.endTime) {
            slots.push({
              dayOfWeek: Number(day.dayOfWeek),
              startTime: slot.startTime.length === 5 ? `${slot.startTime}:00` : slot.startTime,
              endTime: slot.endTime.length === 5 ? `${slot.endTime}:00` : slot.endTime,
            })
          }
        })
      })
      await updateMyAvailability(slots)
      setSuccess('Cập nhật lịch rảnh thành công!')
      await loadData()
    } catch (err) {
      setError(err?.message || 'Không thể lưu lịch rảnh')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="w-full space-y-6">
      <AvailabilityHeader saving={saving} onSave={handleSave} />

      {/* Messages */}
      {success && (
        <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl p-4 text-sm flex items-center gap-3 animate-[fadeIn_0.2s_ease-out]">
          <span className="material-symbols-outlined">check_circle</span>
          <span className="font-medium">{success}</span>
          <button onClick={() => setSuccess(null)} className="ml-auto p-1 hover:bg-emerald-100 rounded-lg">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      )}
      {error && (
        <div className="bg-error-container/20 text-on-error-container rounded-xl p-4 text-sm flex items-center gap-3">
          <span className="material-symbols-outlined">error</span>
          <span>{error}</span>
        </div>
      )}

      {loading && <LoadingState />}

      {!loading && <AvailabilityStats availability={availability} />}
      {!loading && (
        <AvailabilityWeekGrid
          availability={availability}
          onAddSlot={addSlot}
          onRemoveSlot={removeSlot}
          onUpdateSlot={updateSlot}
        />
      )}
    </div>
  )
}
