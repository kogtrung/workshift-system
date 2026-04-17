export function MyScheduleHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div className="space-y-1">
        <p className="text-xs font-bold tracking-[0.05em] uppercase text-on-surface-variant opacity-70">Cá nhân</p>
        <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">Lịch làm việc</h2>
        <p className="text-on-surface-variant font-medium">
          Xem lịch ca đã đăng ký và trạng thái duyệt. Đăng ký ca mở tại mục <strong>Lịch ca</strong>.
        </p>
      </div>
    </div>
  )
}
