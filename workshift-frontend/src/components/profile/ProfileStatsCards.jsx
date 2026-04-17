export function ProfileStatsCards({ approvedShiftsCount, myPositionCount, availabilityCount, totalHours }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-surface-container-lowest rounded-xl border border-outline/10 p-4 text-center">
        <p className="text-3xl font-black text-primary">{approvedShiftsCount}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">Ca tháng này</p>
      </div>
      <div className="bg-surface-container-lowest rounded-xl border border-outline/10 p-4 text-center">
        <p className="text-3xl font-black text-emerald-600">{myPositionCount}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">Vị trí</p>
      </div>
      <div className="bg-surface-container-lowest rounded-xl border border-outline/10 p-4 text-center">
        <p className="text-3xl font-black text-on-surface">{availabilityCount}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">Khung giờ rảnh</p>
      </div>
      <div className="bg-surface-container-lowest rounded-xl border border-outline/10 p-4 text-center">
        <p className="text-3xl font-black text-amber-600">{totalHours}h</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">Giờ làm tháng</p>
      </div>
    </div>
  )
}
