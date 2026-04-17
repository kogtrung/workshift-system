export function MyScheduleStats({ calendarItems }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-surface-container-lowest rounded-xl border border-outline/10 p-4 text-center">
        <p className="text-3xl font-black text-on-surface">{calendarItems.length}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">Tổng đăng ký</p>
      </div>
      <div className="bg-surface-container-lowest rounded-xl border border-outline/10 p-4 text-center">
        <p className="text-3xl font-black text-emerald-600">{calendarItems.filter((i) => i.registrationStatus === 'APPROVED').length}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">Đã duyệt</p>
      </div>
      <div className="bg-surface-container-lowest rounded-xl border border-outline/10 p-4 text-center">
        <p className="text-3xl font-black text-amber-600">{calendarItems.filter((i) => i.registrationStatus === 'PENDING').length}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">Chờ duyệt</p>
      </div>
      <div className="bg-surface-container-lowest rounded-xl border border-outline/10 p-4 text-center">
        <p className="text-3xl font-black text-red-600">{calendarItems.filter((i) => i.registrationStatus === 'REJECTED').length}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">Từ chối</p>
      </div>
    </div>
  )
}
