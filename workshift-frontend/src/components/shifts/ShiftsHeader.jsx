export function ShiftsHeader({ isManager, onCreate }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div className="space-y-1">
        <p className="text-xs font-bold tracking-[0.05em] uppercase text-on-surface-variant opacity-70">Quản lý</p>
        <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">Lịch ca làm việc</h2>
        <p className="text-on-surface-variant font-medium">
          {isManager ? 'Xem tổng quan ca và nhu cầu nhân sự theo tuần' : 'Xem lịch ca và đăng ký ca làm việc'}
        </p>
      </div>
      {isManager && (
        <button
          onClick={onCreate}
          className="px-5 py-2.5 bg-primary text-on-primary font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 self-start shadow-md"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          <span>Tạo ca mới</span>
        </button>
      )}
    </div>
  )
}
