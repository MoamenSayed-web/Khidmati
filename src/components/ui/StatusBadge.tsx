export type ComplaintStatus = 'جديد' | 'قيد التنفيذ' | 'تحت المراجعة' | 'محلول' | 'مغلق';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusConfig = (val: string) => {
    if (val.includes("مغلق") || val.toLowerCase() === "closed") {
      return { className: "bg-gray-100 text-gray-700 border-gray-300", key: "closed" };
    }
    if (val.includes("حل") || val.includes("محلول") || val.toLowerCase() === "resolved") {
      return { className: "bg-green-100 text-green-800 border-green-300", key: "resolved" };
    }
    if (val.includes("تنفيذ") || val.includes("معالجة") || val.toLowerCase() === "processing") {
      return { className: "bg-blue-100 text-blue-800 border-blue-300", key: "processing" };
    }
    if (val.includes("مراجعة") || val.toLowerCase() === "review") {
      return { className: "bg-amber-100 text-amber-800 border-amber-300", key: "review" };
    }
    return { className: "bg-purple-100 text-purple-800 border-purple-300", key: "new" };
  };

  const config = getStatusConfig(status);

  return (
    <span 
      data-status={config.key} 
      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.className} inline-flex items-center justify-center`}
    >
      {status}
    </span>
  );
}