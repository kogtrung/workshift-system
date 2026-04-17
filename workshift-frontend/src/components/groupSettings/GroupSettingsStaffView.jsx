export function GroupSettingsStaffView({ groupInfo, isActive, leaving, leaveErr, onLeaveGroup }) {
  return (
    <div className="w-full">
      <div className="space-y-1 mb-6">
        <p className="text-xs font-bold tracking-[0.05em] uppercase text-on-surface-variant opacity-70">Cài đặt</p>
        <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">Thông tin Group</h2>
      </div>
      <div className="bg-surface-container-lowest rounded-2xl border border-outline/10 shadow-sm p-8 space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Tên group</label>
          <p className="text-lg font-bold text-on-surface">{groupInfo?.groupName || '—'}</p>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Mô tả</label>
          <p className="text-on-surface">{groupInfo?.description || 'Không có mô tả'}</p>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Trạng thái</label>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
            {isActive ? 'Đang hoạt động' : 'Đã đóng'}
          </span>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Mã tham gia</label>
          <div className="flex items-center gap-2">
            <code className="text-lg font-mono font-bold text-primary bg-primary-container/10 px-4 py-2 rounded-lg tracking-[0.2em]">{groupInfo?.joinCode || '——'}</code>
            <button onClick={() => navigator.clipboard?.writeText(groupInfo?.joinCode || '')} className="p-2 hover:bg-surface-container-high rounded-lg text-on-surface-variant transition-colors" title="Sao chép">
              <span className="material-symbols-outlined text-lg">content_copy</span>
            </button>
          </div>
        </div>
        <div className="pt-4 border-t border-outline/10">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Nhóm</p>
          <button onClick={onLeaveGroup} disabled={leaving} className="px-4 py-2 bg-surface-container-lowest text-error font-semibold rounded-lg border border-error/20 hover:bg-error/5 transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">logout</span>
            <span className="text-sm">{leaving ? 'Đang rời...' : 'Rời group'}</span>
          </button>
          {leaveErr ? <p className="text-xs text-error mt-2">{leaveErr}</p> : null}
        </div>
      </div>
    </div>
  )
}
