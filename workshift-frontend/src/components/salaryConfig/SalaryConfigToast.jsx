export function SalaryConfigToast({ message, onClose }) {
  if (!message) return null

  return (
    <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl p-4 text-sm flex items-center gap-3 animate-[fadeIn_0.2s_ease-out]">
      <span className="material-symbols-outlined">check_circle</span>
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-auto p-1 hover:bg-emerald-100 rounded-lg">
        <span className="material-symbols-outlined text-base">close</span>
      </button>
    </div>
  )
}
