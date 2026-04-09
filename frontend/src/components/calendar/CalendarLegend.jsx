const items = [
  { label: 'Confirmed (Direct)', color: 'bg-bcom-green' },
  { label: 'OTA', color: 'bg-bcom-blue' },
  { label: 'Blocked / Maintenance', color: 'bg-gray-400' },
  { label: 'Available', color: 'bg-white border border-bcom-border' },
];

export default function CalendarLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 px-1">
      {items.map((item) => (
        <div key={item.label} className="inline-flex items-center gap-1.5 text-sm text-bcom-muted">
          <span className={`h-3 w-3 rounded-sm ${item.color}`} />
          {item.label}
        </div>
      ))}
    </div>
  );
}
