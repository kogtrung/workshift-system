export function ProfileUserCard({ user, isManager, groupInfo, groupId, memberInfo }) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline/10 shadow-lg overflow-hidden">
      <div className="h-28 bg-gradient-to-br from-primary via-primary/80 to-tertiary relative">
        <div className="absolute -bottom-12 left-6">
          <div className="w-24 h-24 rounded-2xl bg-surface flex items-center justify-center text-4xl font-black text-primary border-4 border-surface shadow-lg">
            {(user?.fullName || user?.username || 'U').charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
      <div className="pt-16 px-6 pb-6">
        <h3 className="text-2xl font-black text-on-surface">{user?.fullName || 'Chưa cập nhật'}</h3>
        <p className="text-sm text-on-surface-variant mt-0.5">@{user?.username || '—'}</p>

        <div className="mt-5 space-y-3">
          <div className="flex items-center gap-3 bg-surface-container rounded-xl px-4 py-3">
            <span className="material-symbols-outlined text-primary text-lg">mail</span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60">Email</p>
              <p className="text-sm text-on-surface truncate">{user?.email || '—'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-surface-container rounded-xl px-4 py-3">
            <span className="material-symbols-outlined text-primary text-lg">phone</span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60">Số điện thoại</p>
              <p className="text-sm text-on-surface">{user?.phone || '—'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-surface-container rounded-xl px-4 py-3">
            <span className="material-symbols-outlined text-primary text-lg">badge</span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60">Vai trò trong nhóm</p>
              <span className={`inline-block mt-1 px-3 py-1 text-xs font-bold rounded-full ${isManager ? 'bg-primary-container text-on-primary-container' : 'bg-tertiary-container text-on-tertiary-container'}`}>
                {isManager ? 'Quản lý' : 'Nhân viên'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-surface-container rounded-xl px-4 py-3">
            <span className="material-symbols-outlined text-primary text-lg">group</span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60">Nhóm</p>
              <p className="text-sm text-on-surface font-medium">{groupInfo?.groupName || `Nhóm #${groupId}`}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-surface-container rounded-xl px-4 py-3">
            <span className="material-symbols-outlined text-primary text-lg">calendar_today</span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60">Ngày tham gia</p>
              <p className="text-sm text-on-surface">
                {memberInfo?.joinedAt ? new Date(memberInfo.joinedAt).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-surface-container rounded-xl px-4 py-3">
            <span className="material-symbols-outlined text-primary text-lg">shield</span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60">Trạng thái tài khoản</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <p className="text-sm text-on-surface">{memberInfo?.status === 'APPROVED' ? 'Hoạt động' : (memberInfo?.status || 'Đang hoạt động')}</p>
              </div>
            </div>
          </div>

          {user?.globalRole && user.globalRole !== 'USER' && (
            <div className="flex items-center gap-3 bg-surface-container rounded-xl px-4 py-3">
              <span className="material-symbols-outlined text-amber-600 text-lg">admin_panel_settings</span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60">Quyền hệ thống</p>
                <span className="inline-block mt-1 px-3 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-700">{user.globalRole}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
