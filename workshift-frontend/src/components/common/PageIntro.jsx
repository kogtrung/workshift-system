export function PageIntro({ eyebrow, title, description, rightSlot = null }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div className="space-y-1">
        {eyebrow ? <p className="text-xs font-bold tracking-[0.05em] uppercase text-on-surface-variant opacity-70">{eyebrow}</p> : null}
        <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">{title}</h2>
        {description ? <p className="text-on-surface-variant font-medium">{description}</p> : null}
      </div>
      {rightSlot}
    </div>
  )
}
