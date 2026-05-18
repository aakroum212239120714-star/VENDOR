const statusColors = {
  pending:   'badge-yellow',
  confirmed: 'badge-blue',
  shipped:   'badge-dark',
  delivered: 'badge-green',
  cancelled: 'badge-red',
  active:    'badge-green',
  inactive:  'badge-gray',
};

export default function Badge({ status, label, color }) {
  const colorClass = color || statusColors[status] || 'badge-gray';
  return (
    <span className={`badge ${colorClass}`}>
      {label ?? status}
    </span>
  );
}
