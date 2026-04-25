export function GroupSettingsDeleteModal({
  show,
  groupName,
  deleteInput,
  deleteErr,
  deleting,
  onClose,
  onChangeDeleteInput,
  onDelete,
}) {
  if (!show) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center modal-overlay" onClick={onClose}>
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-[fadeIn_0.2s_ease-out]" onClick={e => e.stopPropagation()}>
        <div className="px-6 pt-6 pb-4 border-b border-outline/10">
          <h3 className="text-xl font-bold text-red-600 flex items-center gap-2">
            <span className="material-symbols-outlined">delete_forever</span>
            Xác nhận xóa vĩnh viễn
          </h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-red-50 text-red-700 rounded-xl p-4 text-sm border border-red-200">
            <p className="font-bold mb-1">⚠️ Hành động này KHÔNG THỂ hoàn tác!</p>
            <p>Group <strong>"{groupName}"</strong> và toàn bộ dữ liệu sẽ bị xóa vĩnh viễn khỏi hệ thống.</p>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
              Nhập <strong className="text-red-600">"{groupName}"</strong> để xác nhận
            </label>
            <input type="text" value={deleteInput} onChange={e => onChangeDeleteInput(e.target.value)} placeholder={groupName} className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl border border-red-200 text-on-surface focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-200 transition-all" />
          </div>
          {deleteErr && <div className="bg-error-container/20 text-on-error-container rounded-lg p-3 text-sm">{deleteErr}</div>}
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={onClose} className="px-5 py-2.5 text-on-surface-variant font-semibold rounded-lg hover:bg-surface-container-high transition-colors">Hủy</button>
            <button onClick={onDelete} disabled={deleting || deleteInput !== groupName} className="px-5 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">delete_forever</span>
              {deleting ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
