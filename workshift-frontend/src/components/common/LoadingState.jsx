export function LoadingState({ message = 'Đang tải...' }) {
  return (
    <div className="text-center py-12">
      <p className="text-on-surface-variant animate-pulse">{message}</p>
    </div>
  )
}
