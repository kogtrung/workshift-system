export function MyScheduleToast({ toast, onClose }) {
  if (!toast) return null

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] shadow-2xl border rounded-2xl px-6 py-4 flex items-center gap-3 animate-[fadeIn_0.2s_ease-out] max-w-md ${toast.type === 'success' ? 'bg-surface border-emerald-200' : 'bg-surface border-error/20'}`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${toast.type === 'success' ? 'bg-emerald-100' : 'bg-error-container/30'}`}>
        <span className={`material-symbols-outlined ${toast.type === 'success' ? 'text-emerald-600' : 'text-error'}`}>{toast.type === 'success' ? 'check_circle' : 'error'}</span>
      </div>
      <p className="text-sm font-medium text-on-surface">{toast.msg}</p>
      <button onClick={onClose} className="p-1 text-on-surface-variant hover:text-on-surface flex-shrink-0">
        <span className="material-symbols-outlined text-lg">close</span>
      </button>
    </div>
  )
}
