export type ComplaintStatus = 'جديد' | 'قيد التنفيذ' | 'تحت المراجعة' | 'محلول' | 'مغلق';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusClass = (val: string) => {
    if (val.includes("حل") || val.includes("محلول")) return "resolved";
    if (val.includes("تنفيذ")) return "processing";
    if (val.includes("مراجعة")) return "review";
    if (val.includes("مغلق")) return "closed";
    return "new";
  };

  const statusClass = getStatusClass(status);

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium status status-${statusClass}`}>
      {status}
    </span>
  );
}