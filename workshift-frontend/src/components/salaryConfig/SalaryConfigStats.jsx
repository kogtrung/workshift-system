export function SalaryConfigStats({ configs }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <div className="bg-surface-container-lowest rounded-xl border border-outline/10 p-4 text-center">
        <p className="text-3xl font-black text-on-surface">{configs.length}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">Tổng cấu hình</p>
      </div>
      <div className="bg-surface-container-lowest rounded-xl border border-outline/10 p-4 text-center">
        <p className="text-3xl font-black text-primary">{configs.filter(c => c.positionId && !c.userId).length}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">Theo vị trí</p>
      </div>
      <div className="bg-surface-container-lowest rounded-xl border border-outline/10 p-4 text-center">
        <p className="text-3xl font-black text-tertiary">{configs.filter(c => c.userId).length}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">Theo nhân viên</p>
      </div>
    </div>
  )
}
