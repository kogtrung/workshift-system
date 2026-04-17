export function MembersStats({ members, managers, staff }) {
  if (!members.length) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="p-6 bg-surface-container-lowest rounded-xl shadow-[0_24px_48px_rgba(0,52,94,0.06)] border border-outline/5">
        <div className="text-xs font-bold tracking-widest text-on-surface-variant uppercase mb-2">Tổng thành viên</div>
        <div className="text-4xl font-black text-on-surface tracking-tighter">{members.length}</div>
      </div>
      <div className="p-6 bg-surface-container-lowest rounded-xl shadow-[0_24px_48px_rgba(0,52,94,0.06)] border border-outline/5">
        <div className="text-xs font-bold tracking-widest text-on-surface-variant uppercase mb-2">Quản lý</div>
        <div className="text-4xl font-black text-on-surface tracking-tighter">{managers.length}</div>
      </div>
      <div className="p-6 bg-surface-container-lowest rounded-xl shadow-[0_24px_48px_rgba(0,52,94,0.06)] border border-outline/5">
        <div className="text-xs font-bold tracking-widest text-on-surface-variant uppercase mb-2">Nhân viên</div>
        <div className="text-4xl font-black text-on-surface tracking-tighter">{staff.length}</div>
      </div>
    </div>
  )
}
