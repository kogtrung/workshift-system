import { PageIntro } from '../common/PageIntro'

export function PendingMembersHeader({ groupName, joinCode, loading, onRefresh }) {
  const rightSlot = (
    <button className="px-5 py-2.5 bg-surface-container-lowest text-primary font-semibold rounded-xl border border-outline/10 hover:bg-surface-container-low transition-colors flex items-center gap-2" type="button" onClick={onRefresh} disabled={loading}>
      <span className="material-symbols-outlined text-sm">refresh</span>
      Làm mới
    </button>
  )
  const desc = joinCode ? <>Mã group: <span className="font-bold text-primary">{joinCode}</span></> : null
  return <PageIntro eyebrow={groupName || 'Group'} title="Thành viên chờ duyệt" description={desc} rightSlot={rightSlot} />
}
