export function PositionsGrid({ positions, isManager, onEdit, onDelete }) {
  if (!positions.length) {
    return (
      <div className="text-center py-16 bg-surface-container-lowest rounded-2xl border border-outline/10 border-dashed">
        <span className="material-symbols-outlined text-5xl text-on-surface-variant opacity-20 mb-4">work</span>
        <h3 className="text-xl font-bold text-on-surface mb-2">Chưa có vị trí nào</h3>
        <p className="text-on-surface-variant font-medium">Tạo các vị trí làm việc để bắt đầu cấu hình ca.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {positions.map((pos) => (
        <div key={pos.id} className="bg-surface-container-lowest rounded-2xl p-5 border border-outline/10 shadow-[0_24px_48px_rgba(0,52,94,0.06)] hover:shadow-lg transition-all group">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm" style={{ backgroundColor: pos.colorCode || '#6366f1' }}>
                {pos.name?.charAt(0)?.toUpperCase() || 'P'}
              </div>
              <div>
                <h3 className="text-base font-bold text-on-surface">{pos.name}</h3>
                <p className="text-xs text-on-surface-variant font-mono">{pos.colorCode || '—'}</p>
              </div>
            </div>
            {isManager && (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEdit(pos)} title="Sửa" className="p-1.5 text-on-surface-variant hover:bg-primary-container/30 rounded-lg transition-colors">
                  <span className="material-symbols-outlined text-lg">edit</span>
                </button>
                <button onClick={() => onDelete(pos)} title="Xóa" className="p-1.5 text-on-surface-variant hover:bg-error-container/30 hover:text-error rounded-lg transition-colors">
                  <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            )}
          </div>
          <div className="h-1.5 rounded-full" style={{ backgroundColor: pos.colorCode || '#6366f1', opacity: 0.3 }} />
        </div>
      ))}
    </div>
  )
}
