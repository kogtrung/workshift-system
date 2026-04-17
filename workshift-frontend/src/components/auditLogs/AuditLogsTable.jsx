function formatInstant(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleString()
}

export function AuditLogsTable({ logs, isLoading, friendlyActionType, friendlyActorRole, friendlyEntityType }) {
  return (
    <div className="bg-surface-container-low rounded-xl overflow-hidden border border-outline/10">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-high/50">
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Thời gian</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Hành động</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Người thực hiện</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Đối tượng</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Mô tả</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline/5">
          {isLoading ? (
            <tr><td className="px-6 py-6 text-on-surface-variant font-medium" colSpan={5}>Đang tải...</td></tr>
          ) : !logs?.items?.length ? (
            <tr><td className="px-6 py-6 text-on-surface-variant font-medium" colSpan={5}>Không có dữ liệu.</td></tr>
          ) : (
            logs.items.map((row) => (
              <tr key={row.id} className="hover:bg-surface-container-lowest transition-colors">
                <td className="px-6 py-5 text-sm font-medium text-on-surface">{formatInstant(row.occurredAt)}</td>
                <td className="px-6 py-5">
                  <span className="px-3 py-1 bg-primary-container text-on-primary-container text-xs font-semibold rounded-full">{friendlyActionType(row.actionType)}</span>
                </td>
                <td className="px-6 py-5 text-sm text-on-surface">
                  <div className="font-bold">{row.actorFullName || row.actorUsername}</div>
                  <div className="text-xs text-on-surface-variant font-medium">{friendlyActorRole(row.actorRole)}</div>
                </td>
                <td className="px-6 py-5 text-sm text-on-surface"><div className="font-bold">{friendlyEntityType(row.entityType)}</div></td>
                <td className="px-6 py-5 text-sm text-on-surface">{row.summary}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
