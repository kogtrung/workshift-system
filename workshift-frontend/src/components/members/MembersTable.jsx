export function MembersTable({ members, managers, staff }) {
  if (!members.length) {
    return (
      <div className="text-center py-16 bg-surface-container-lowest rounded-2xl border border-outline/10 border-dashed">
        <span className="material-symbols-outlined text-5xl text-on-surface-variant opacity-20 mb-4">group</span>
        <h3 className="text-xl font-bold text-on-surface mb-2">Chưa có thành viên</h3>
        <p className="text-on-surface-variant font-medium">Chia sẻ mã tham gia để mời thành viên mới.</p>
      </div>
    )
  }

  return (
    <div className="bg-surface-container-low rounded-xl overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-high/50">
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Tên</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Vai trò</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant hidden md:table-cell">Email</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant hidden lg:table-cell">Ngày tham gia</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline/5">
          {[...managers, ...staff].map((member) => (
            <tr key={member.memberId} className="hover:bg-surface-container-lowest transition-colors group">
              <td className="px-6 py-5">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${member.role === 'MANAGER' ? 'bg-primary/10 text-primary' : 'bg-tertiary/10 text-tertiary'}`}>
                    {(member.fullName || member.username || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-on-surface">{member.fullName || member.username}</div>
                    <div className="text-xs text-on-surface-variant">@{member.username}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-5">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${member.role === 'MANAGER' ? 'bg-primary-container text-on-primary-container' : 'bg-secondary-container text-on-secondary-container'}`}>
                  {member.role === 'MANAGER' ? 'Quản lý' : 'Nhân viên'}
                </span>
              </td>
              <td className="px-6 py-5 hidden md:table-cell"><span className="text-sm text-on-surface-variant">{member.email || '—'}</span></td>
              <td className="px-6 py-5 hidden lg:table-cell"><span className="text-sm text-on-surface-variant">{member.joinedAt ? new Date(member.joinedAt).toLocaleDateString('vi-VN') : '—'}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
