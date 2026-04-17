export function AuditLogsFilters({
  from,
  to,
  actionType,
  actorUserId,
  entityType,
  entityId,
  page,
  size,
  actionTypeLabels,
  entityTypeLabels,
  onChangeFrom,
  onChangeTo,
  onChangeActionType,
  onChangeActorUserId,
  onChangeEntityType,
  onChangeEntityId,
  onChangePage,
  onChangeSize,
  onApply,
}) {
  return (
    <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline/10 mb-6">
      <div className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Bộ lọc</div>
      <div className="mt-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary text-sm font-medium" placeholder="from (YYYY-MM-DD)" value={from} onChange={(e) => onChangeFrom(e.target.value)} />
          <input className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary text-sm font-medium" placeholder="to (YYYY-MM-DD)" value={to} onChange={(e) => onChangeTo(e.target.value)} />
        </div>
        <select className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary text-sm font-medium" value={actionType} onChange={(e) => onChangeActionType(e.target.value)}>
          <option value="">Tất cả hành động</option>
          {Object.entries(actionTypeLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
        <div className="grid grid-cols-2 gap-3">
          <input className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary text-sm font-medium" placeholder="ID người thực hiện" type="number" value={actorUserId} onChange={(e) => onChangeActorUserId(e.target.value)} />
          <input className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary text-sm font-medium" placeholder="ID đối tượng" type="number" value={entityId} onChange={(e) => onChangeEntityId(e.target.value)} />
        </div>
        <select className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary text-sm font-medium" value={entityType} onChange={(e) => onChangeEntityType(e.target.value)}>
          <option value="">Tất cả đối tượng</option>
          {Object.entries(entityTypeLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
        <div className="grid grid-cols-2 gap-3">
          <input className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary text-sm font-medium" type="number" min={0} value={page} onChange={(e) => onChangePage(Number(e.target.value))} />
          <input className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary text-sm font-medium" type="number" min={1} max={200} value={size} onChange={(e) => onChangeSize(Number(e.target.value))} />
        </div>
        <button className="w-full bg-gradient-to-r from-primary to-primary-dim text-on-primary py-3 rounded-xl font-bold shadow-lg shadow-primary/20 active:scale-[0.98] transition-all" type="button" onClick={onApply}>
          Áp dụng
        </button>
      </div>
    </div>
  )
}
