export function StatusBadge({ status }: { status: string }) {
  const statusClass = status.includes("حل")
    ? "resolved"
    : status.includes("تنفيذ")
      ? "processing"
      : status.includes("مراجعة")
        ? "review"
        : status.includes("مغلق")
          ? "closed"
          : "new"
  return <span className={`status status-${statusClass}`}>{status}</span>
}
