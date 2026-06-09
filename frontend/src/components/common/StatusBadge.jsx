export default function StatusBadge({ status }) {
  const map = {
    present: { label: 'Присутствует', cls: 'badge-success' },
    late:    { label: 'Опоздал',      cls: 'badge-warning' },
    absent:  { label: 'Отсутствует',  cls: 'badge-danger'  },
  };
  const s = map[status] || { label: status, cls: 'badge-gray' };
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}
