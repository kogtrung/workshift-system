export function MembersHeader({ total }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div className="space-y-1">
        <p className="text-xs font-bold tracking-[0.05em] uppercase text-on-surface-variant opacity-70">Nội bộ</p>
        <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">Thành viên</h2>
      </div>
      <div className="text-sm text-on-surface-variant font-medium">{total} thành viên</div>
    </div>
  )
}
