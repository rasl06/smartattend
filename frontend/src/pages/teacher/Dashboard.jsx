import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchClasses } from '../../store/slices/classesSlice';
import StatCard from '../../components/common/StatCard';

export default function TeacherDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user }           = useSelector((s) => s.auth);
  const { list, loading }  = useSelector((s) => s.classes);

  useEffect(() => { dispatch(fetchClasses()); }, [dispatch]);

  const now      = new Date();
  const upcoming = list.filter((c) => new Date(c.starts_at) >= now);
  const past     = list.filter((c) => new Date(c.starts_at) < now);

  return (
    <div>
      <h1 className="page-title">Добро пожаловать, {user?.full_name?.split(' ')[0]}!</h1>
      <p className="page-subtitle">Панель преподавателя</p>

      <div className="stats-grid">
        <StatCard label="Всего занятий"     value={list.length}     />
        <StatCard label="Предстоящих"       value={upcoming.length} color="var(--brand)" />
        <StatCard label="Проведено"         value={past.length}     color="var(--success)" />
      </div>

      {/* Quick action */}
      <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontWeight: 700 }}>Создать новое занятие</h3>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', marginTop: '4px' }}>
            Запланируйте занятие и получите QR-код
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/teacher/create')}>
          + Новое занятие
        </button>
      </div>

      {/* Upcoming classes */}
      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Ближайшие занятия</h3>
        {loading && <div style={{ textAlign:'center', padding:'2rem' }}><div className="spinner" style={{ margin:'0 auto' }}/></div>}
        {!loading && upcoming.length === 0 && (
          <p style={{ color:'var(--gray-400)', textAlign:'center', padding:'2rem' }}>
            Нет предстоящих занятий
          </p>
        )}
        {upcoming.slice(0, 5).map((c) => (
          <div key={c.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.875rem 0', borderBottom:'1px solid var(--gray-100)', gap:'1rem' }}>
            <div style={{ flex:1 }}>
              <p style={{ fontWeight:600 }}>{c.subject_name}</p>
              <p style={{ color:'var(--gray-500)', fontSize:'0.8125rem', marginTop:'2px' }}>
                {new Date(c.starts_at).toLocaleDateString('ru-RU')}
                {' · '}
                {new Date(c.starts_at).toLocaleTimeString('ru-RU', { hour:'2-digit', minute:'2-digit' })}
                {c.room ? ` · Ауд. ${c.room}` : ''}
              </p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/teacher/classes/${c.id}`)}>
              Открыть →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
