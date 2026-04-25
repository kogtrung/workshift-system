import { PageIntro } from '../common/PageIntro'

export function PositionsHeader({ isManager, onCreate }) {
  const rightSlot = isManager ? (
    <button onClick={onCreate} className="px-5 py-2.5 bg-primary text-on-primary font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 self-start shadow-md">
      <span className="material-symbols-outlined text-sm">add</span>
      <span>Thêm vị trí</span>
    </button>
  ) : null
  return <PageIntro eyebrow="Cấu hình" title="Vị trí làm việc" description="Định nghĩa các vị trí trong quán (Pha chế, Thu ngân, Phục vụ...)" rightSlot={rightSlot} />
}
