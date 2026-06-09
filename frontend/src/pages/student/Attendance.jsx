import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyAttendance } from '../../store/slices/attendanceSlice';
import StatusBadge from '../../components/common/StatusBadge';

export default function StudentAttendance() {
  const dispatch = useDispatch();
  const { my, loading } = useSelector((s) => s.attendance);

  useEffect(() => { dispatch(fetchMyAttendance()); }, [dispatch]);

  return (
    <div>
      <h1 className="page-title">Журнал посещаемости</h1>
      <p className="page-subtitle">Полная история посещений</p>

      <div className="card">
        {loading && <div style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>}
        {!loading && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Дисциплина</th>
                  <th>Дата</th>
                  <th>Время</th>
                  <th>Аудитория</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {my?.history?.map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{r.subject_name}</td>
                    <td>{new Date(r.starts_at).toLocaleDateString('ru-RU')}</td>
                    <td style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                      {new Date(r.starts_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>{r.room || '—'}</td>
                    <td><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
                {!my?.history?.length && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '3rem' }}>
                    Нет данных о посещаемости
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
