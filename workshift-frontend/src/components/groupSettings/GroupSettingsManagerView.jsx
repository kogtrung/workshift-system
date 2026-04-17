export function GroupSettingsManagerView({
  groupInfo,
  isActive,
  name,
  description,
  saving,
  saveMsg,
  saveErr,
  toggling,
  toggleMsg,
  onChangeName,
  onChangeDescription,
  onSave,
  onToggle,
  onOpenDelete,
}) {
  return (
    <div className="w-full space-y-8">
      <div className="space-y-1">
        <p className="text-xs font-bold tracking-[0.05em] uppercase text-on-surface-variant opacity-70">Quản lý</p>
        <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">Cài đặt Group</h2>
        <p className="text-on-surface-variant font-medium">Chỉnh sửa thông tin và quản lý group</p>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl border border-outline/10 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-surface-container-low border-b border-outline/10">
          <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">edit</span>
            Thông tin chung
          </h3>
        </div>
        <form onSubmit={onSave} className="p-6 space-y-5">
          {saveMsg && (
            <div className="bg-emerald-50 text-emerald-700 rounded-xl p-3 text-sm flex items-center gap-2 border border-emerald-200">
              <span className="material-symbols-outlined text-lg">check_circle</span>{saveMsg}
            </div>
          )}
          {saveErr && (
            <div className="bg-error-container/20 text-on-error-container rounded-xl p-3 text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>{saveErr}
            </div>
          )}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
              Tên group <span className="text-error">*</span>
            </label>
            <input type="text" value={name} onChange={e => onChangeName(e.target.value)} placeholder="Nhập tên group" className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl border border-outline/20 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-lg font-semibold" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">Mô tả</label>
            <textarea value={description} onChange={e => onChangeDescription(e.target.value)} placeholder="Mô tả ngắn về nhóm làm việc..." rows={3} className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl border border-outline/20 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none" />
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary text-on-primary font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-md disabled:opacity-50 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">save</span>
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl border border-outline/10 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-surface-container-low border-b border-outline/10">
          <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">vpn_key</span>
            Mã tham gia
          </h3>
        </div>
        <div className="p-6">
          <p className="text-sm text-on-surface-variant mb-4">Chia sẻ mã này để thành viên mới gửi yêu cầu tham gia.</p>
          <div className="flex items-center gap-3">
            <code className="text-2xl font-mono font-black text-primary bg-primary-container/10 px-6 py-3 rounded-xl tracking-[0.3em] border border-primary/10">{groupInfo?.joinCode || '——————'}</code>
            <button onClick={() => navigator.clipboard?.writeText(groupInfo?.joinCode || '')} className="flex items-center gap-2 px-4 py-3 bg-surface-container hover:bg-surface-container-high rounded-xl text-on-surface font-semibold transition-colors">
              <span className="material-symbols-outlined">content_copy</span>Sao chép
            </button>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl border border-red-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-red-50 border-b border-red-200">
          <h3 className="text-lg font-bold text-red-700 flex items-center gap-2">
            <span className="material-symbols-outlined">warning</span>
            Vùng nguy hiểm
          </h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm font-bold text-on-surface flex items-center gap-2">
                {isActive
                  ? <><span className="material-symbols-outlined text-amber-500 text-lg">lock</span> Đóng group</>
                  : <><span className="material-symbols-outlined text-emerald-500 text-lg">lock_open</span> Mở lại group</>
                }
              </p>
              <p className="text-xs text-on-surface-variant mt-1">
                {isActive ? 'Đóng group sẽ ngăn thành viên mới tham gia. Bạn có thể mở lại bất cứ lúc nào.' : 'Mở lại group để cho phép hoạt động bình thường trở lại.'}
              </p>
              {toggleMsg && (
                <p className="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">check_circle</span>{toggleMsg}
                </p>
              )}
            </div>
            <button
              onClick={onToggle}
              disabled={toggling}
              className={`px-5 py-2.5 font-semibold rounded-lg transition-colors flex items-center gap-2 flex-shrink-0 disabled:opacity-50 ${isActive ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
            >
              <span className="material-symbols-outlined text-lg">{isActive ? 'lock' : 'lock_open'}</span>
              {toggling ? 'Đang xử lý...' : (isActive ? 'Đóng group' : 'Mở lại group')}
            </button>
          </div>

          <hr className="border-red-100" />

          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-red-600 text-lg">delete_forever</span>
                Xóa vĩnh viễn
              </p>
              <p className="text-xs text-on-surface-variant mt-1">
                Xóa hoàn toàn group khỏi hệ thống. Tất cả dữ liệu (ca, vị trí, thành viên) sẽ bị mất vĩnh viễn và <strong>không thể khôi phục</strong>.
              </p>
            </div>
            <button onClick={onOpenDelete} className="px-5 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 flex-shrink-0">
              <span className="material-symbols-outlined text-lg">delete_forever</span>
              Xóa vĩnh viễn
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
