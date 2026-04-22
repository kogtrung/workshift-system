import { PageIntro } from '../common/PageIntro'

export function ShiftChangeRequestsHeader({ groupName, groupId, loading, onRefresh }) {
  const rightSlot = (
    <button className="px-5 py-2.5 bg-surface-container-lowest text-primary font-semibold rounded-xl border border-outline/10 hover:bg-surface-container-low transition-colors flex items-center gap-2" type="button" onClick={onRefresh} disabled={loading}>
      <span className="material-symbols-outlined text-sm">refresh</span>
      Làm mới
    </button>
  )
  return <PageIntro eyebrow="Quản lý" title="Yêu cầu đổi ca" description={`${groupName || `Group #${groupId}`} · đang chờ duyệt`} rightSlot={rightSlot} />
}
