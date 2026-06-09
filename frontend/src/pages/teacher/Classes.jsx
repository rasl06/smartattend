import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchClasses } from '../../store/slices/classesSlice';

export default function TeacherClasses() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, loading } = useSelector((s) => s.classes);

  useEffect(() => { dispatch(fetchClasses()); }, [dispatch]);

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <h1 className="page-title">Мои занятия</h1>
          <p className="page-subtitle">Список всех занятий</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/teacher/create')}>
          + Новое занятие
        </button>
      </div>

      <div className="card">
        {loading && <div style={{ textAlign:'center', padding:'3rem' }}><div className="spinner" style={{ margin:'0 auto' }}/></div>}
        {!loading && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Дисциплина</th>
                  <th>Группы</th>
                  <th>Дата</th>
                  <th>Время</th>
                  <th>Аудитория</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {list.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight:600 }}>{c.subject_name}</td>
                    <td>
                      {(c.group_names?.filter(Boolean) || []).map((g) => (
                        <span key={g} className="badge badge-info" style={{ marginRight:4 }}>{g}</span>
                      ))}
                    </td>
                    <td>{new Date(c.starts_at).toLocaleDateString('ru-RU')}</td>
                    <td style={{ color:'var(--gray-500)', fontSize:'0.875rem' }}>
                      {new Date(c.starts_at).toLocaleTimeString('ru-RU', { hour:'2-digit', minute:'2-digit' })}–
                      {new Date(c.ends_at).toLocaleTimeString('ru-RU',   { hour:'2-digit', minute:'2-digit' })}
                    </td>
                    <td>{c.room || '—'}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm"
                        onClick={() => navigate(`/teacher/classes/${c.id}`)}>
                        Детали
                      </button>
                    </td>
                  </tr>
                ))}
                {list.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign:'center', color:'var(--gray-400)', padding:'3rem' }}>
                    Занятий пока нет
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
