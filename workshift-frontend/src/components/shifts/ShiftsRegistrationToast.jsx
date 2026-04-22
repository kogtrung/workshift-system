export function ShiftsRegistrationToast({ message, onClose }) {
  if (!message) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xl rounded-2xl px-6 py-4 flex items-center gap-3 animate-[fadeIn_0.2s_ease-out] max-w-md">
      <span className="material-symbols-outlined">check_circle</span>
      <span className="font-medium text-sm">{message}</span>
      <button onClick={onClose} className="ml-auto p-1 hover:bg-emerald-100 rounded-lg">
        <span className="material-symbols-outlined text-lg">close</span>
      </button>
    </div>
  )
}
