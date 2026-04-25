export function ProfilePositionsCard({ allPositions, myPositionIds, savingPos, onTogglePosition, onSavePositions }) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline/10 shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-surface-container-low border-b border-outline/10 flex items-center justify-between">
        <div>
          <h4 className="text-base font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">work</span>
            Vị trí của tôi
          </h4>
          <p className="text-xs text-on-surface-variant mt-0.5">Chọn vị trí mà bạn đảm nhận trong nhóm</p>
        </div>
        <button onClick={onSavePositions} disabled={savingPos} className="px-4 py-2 text-xs font-bold text-primary bg-primary-container/20 hover:bg-primary-container/40 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50">
          <span className="material-symbols-outlined text-sm">{savingPos ? 'hourglass_empty' : 'save'}</span>
          {savingPos ? 'Đang lưu...' : 'Lưu'}
        </button>
      </div>
      <div className="p-5">
        {allPositions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {allPositions.map(pos => {
              const selected = myPositionIds.includes(pos.id)
              return (
                <button key={pos.id} onClick={() => onTogglePosition(pos.id)} className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${selected ? 'border-primary bg-primary/5 shadow-sm' : 'border-outline/10 bg-surface-container hover:border-outline/30'}`}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm" style={{ backgroundColor: pos.colorCode || '#6366f1' }}>
                    {pos.name?.charAt(0)?.toUpperCase() || 'P'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-on-surface">{pos.name}</p>
                    <p className="text-[10px] text-on-surface-variant">{pos.colorCode || '—'}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${selected ? 'border-primary bg-primary' : 'border-outline/30'}`}>
                    {selected && <span className="material-symbols-outlined text-on-primary text-sm">check</span>}
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-3xl text-on-surface-variant opacity-20 mb-2">work_off</span>
            <p className="text-sm text-on-surface-variant">Chưa có vị trí nào trong nhóm. Quản lý cần tạo vị trí trước.</p>
          </div>
        )}
      </div>
    </div>
  )
}
