import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchMyAttendance } from '../../store/slices/attendanceSlice';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';

export default function StudentDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user }           = useSelector((s) => s.auth);
  const { my, loading }    = useSelector((s) => s.attendance);

  useEffect(() => { dispatch(fetchMyAttendance()); }, [dispatch]);

  const stats = my?.stats;
  const total = parseInt(stats?.total) || 0;
  const pct   = total ? Math.round((parseInt(stats?.present) / total) * 100) : 0;

  return (
    <div>
      <h1 className="page-title">Добро пожаловать, {user?.full_name?.split(' ')[0]}!</h1>
      <p className="page-subtitle">Ваша статистика посещаемости</p>

      <div className="stats-grid">
        <StatCard label="Посещаемость" value={`${pct}%`}
          sub={`${stats?.present || 0} из ${total} занятий`}
          color={pct >= 75 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--danger)'} />
        <StatCard label="Присутствовал" value={stats?.present || 0} color="var(--success)" />
        <StatCard label="Опоздал"       value={stats?.late    || 0} color="var(--warning)" />
        <StatCard label="Пропустил"     value={stats?.absent  || 0} color="var(--danger)"  />
      </div>

      {/* Quick scan button */}
      <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontWeight: 700 }}>Отметить присутствие</h3>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', marginTop: '4px' }}>
            Отсканируйте QR-код у преподавателя
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/student/scan')}>
          ⊡ Сканировать QR
        </button>
      </div>

      {/* Recent history */}
      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Последние занятия</h3>
        {loading && <div style={{ textAlign: 'center', padding: '2rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>}
        {!loading && my?.history?.length === 0 && (
          <p style={{ color: 'var(--gray-400)', textAlign: 'center', padding: '2rem' }}>Нет данных</p>
        )}
        {!loading && my?.history?.slice(0, 5).map((r) => (
          <div key={r.scanned_at} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.75rem 0', borderBottom: '1px solid var(--gray-100)',
          }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{r.subject_name}</p>
              <p style={{ color: 'var(--gray-500)', fontSize: '0.8125rem' }}>
                {new Date(r.starts_at).toLocaleDateString('ru-RU')} · Ауд. {r.room}
              </p>
            </div>
            <StatusBadge status={r.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
