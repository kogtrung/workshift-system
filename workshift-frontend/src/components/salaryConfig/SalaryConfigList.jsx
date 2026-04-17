function fmtCurrency(val) {
  return Number(val).toLocaleString('vi-VN') + 'đ'
}

export function SalaryConfigList({ configs, resolveConfigDisplayName, onDelete }) {
  if (!configs.length) {
    return (
      <div className="text-center py-16 bg-surface-container-lowest rounded-2xl border border-outline/10 border-dashed">
        <span className="material-symbols-outlined text-5xl text-on-surface-variant opacity-20 mb-4">payments</span>
        <h3 className="text-xl font-bold text-on-surface mb-2">Chưa có cấu hình lương</h3>
        <p className="text-on-surface-variant font-medium">Nhấn "Thêm cấu hình" để thiết lập mức lương theo giờ.</p>
      </div>
    )
  }

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline/10 shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-surface-container-low border-b border-outline/10">
        <h4 className="text-base font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">payments</span>
          Danh sách cấu hình lương
        </h4>
      </div>
      <div className="divide-y divide-outline/5">
        {configs.map(cfg => (
          <div key={cfg.id} className="flex items-center justify-between px-6 py-4 hover:bg-surface-container/30 transition-colors group">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm ${cfg.userId ? 'bg-tertiary' : 'bg-primary'}`}>
                <span className="material-symbols-outlined text-lg">{cfg.userId ? 'person' : 'work'}</span>
              </div>
              <div>
                <p className="text-sm font-bold text-on-surface">{resolveConfigDisplayName(cfg)}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-on-surface-variant">{cfg.userId ? '👤 Nhân viên' : '📋 Vị trí'}</span>
                  <span className="text-xs text-on-surface-variant">📅 Áp dụng: {cfg.effectiveDate}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-lg font-black text-primary">{fmtCurrency(cfg.hourlyRate)}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">/giờ</p>
              </div>
              <button onClick={() => onDelete(cfg.id)} className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                <span className="material-symbols-outlined text-lg">delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
