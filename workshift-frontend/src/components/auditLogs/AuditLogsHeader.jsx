export function AuditLogsHeader({ isLoading, onRefresh }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
      <div className="space-y-1">
        <p className="text-xs font-bold tracking-[0.05em] uppercase text-on-surface-variant opacity-70">Nhóm</p>
        <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">Lịch sử hoạt động</h2>
        <p className="text-on-surface-variant font-medium">Theo dõi các thay đổi trong nhóm</p>
      </div>
      <button className="px-5 py-2.5 bg-surface-container-lowest text-primary font-semibold rounded-xl border border-outline/10 hover:bg-surface-container-low transition-colors" type="button" onClick={onRefresh} disabled={isLoading}>
        Làm mới
      </button>
    </div>
  )
}
