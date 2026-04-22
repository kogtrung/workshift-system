export function ErrorAlert({ message }) {
  if (!message) return null
  return <div className="bg-error-container/20 text-on-error-container rounded-xl p-4 text-center">{message}</div>
}
