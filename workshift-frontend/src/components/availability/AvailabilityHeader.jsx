import { PageIntro } from '../common/PageIntro'

export function AvailabilityHeader({ saving, onSave }) {
  const rightSlot = (
    <button onClick={onSave} disabled={saving} className="px-6 py-2.5 bg-primary text-on-primary font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 self-start shadow-md disabled:opacity-50">
      <span className="material-symbols-outlined text-sm">{saving ? 'hourglass_empty' : 'save'}</span>
      <span>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
    </button>
  )
  return <PageIntro eyebrow="Cá nhân" title="Lịch rảnh của tôi" description="Khai báo khung giờ rảnh hàng tuần để hệ thống gợi ý ca phù hợp" rightSlot={rightSlot} />
}
