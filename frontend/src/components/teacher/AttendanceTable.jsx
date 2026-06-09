import StatusBadge from '../common/StatusBadge';

export default function AttendanceTable({ records }) {
  if (!records?.length) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-400)' }}>
        Нет записей о посещаемости
      </div>
    );
  }
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Студент</th>
            <th>Email</th>
            <th>Статус</th>
            <th>Время сканирования</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id}>
              <td style={{ fontWeight: 500 }}>{r.full_name}</td>
              <td style={{ color: 'var(--gray-500)' }}>{r.email}</td>
              <td><StatusBadge status={r.status} /></td>
              <td style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                {r.scanned_at ? new Date(r.scanned_at).toLocaleTimeString('ru-RU') : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
