export function AvailabilityStats({ availability }) {
  const totalSlots = availability.reduce((s, d) => s + d.slots.length, 0)
  const daysWithSlots = availability.filter(d => d.slots.length > 0).length
  const daysOff = availability.filter(d => d.slots.length === 0).length
  const totalHours = (() => {
    let total = 0
    availability.forEach(d => d.slots.forEach(s => {
      if (s.startTime && s.endTime) {
        const [sh, sm] = s.startTime.split(':').map(Number)
        const [eh, em] = s.endTime.split(':').map(Number)
        total += (eh * 60 + em - sh * 60 - sm) / 60
      }
    }))
    return total.toFixed(1)
  })()

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-surface-container-lowest rounded-xl border border-outline/10 p-4 text-center">
        <p className="text-3xl font-black text-primary">{totalSlots}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">Khung giờ</p>
      </div>
      <div className="bg-surface-container-lowest rounded-xl border border-outline/10 p-4 text-center">
        <p className="text-3xl font-black text-emerald-600">{daysWithSlots}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">Ngày có lịch</p>
      </div>
      <div className="bg-surface-container-lowest rounded-xl border border-outline/10 p-4 text-center">
        <p className="text-3xl font-black text-amber-600">{daysOff}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">Ngày nghỉ</p>
      </div>
      <div className="bg-surface-container-lowest rounded-xl border border-outline/10 p-4 text-center">
        <p className="text-3xl font-black text-on-surface">{totalHours}h</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">Tổng giờ/tuần</p>
      </div>
    </div>
  )
}
