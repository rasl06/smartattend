import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClasses } from '../../store/slices/classesSlice';

export default function AdminClasses() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((s) => s.classes);

  useEffect(() => { dispatch(fetchClasses()); }, [dispatch]);

  return (
    <div>
      <h1 className="page-title">Все занятия</h1>
      <p className="page-subtitle">Общий список занятий по всем преподавателям</p>

      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        {loading
          ? <div style={{ textAlign:'center', padding:'3rem' }}><div className="spinner" style={{ margin:'0 auto' }}/></div>
          : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Дисциплина</th>
                  <th>Преподаватель</th>
                  <th>Группы</th>
                  <th>Дата</th>
                  <th>Аудитория</th>
                </tr>
              </thead>
              <tbody>
                {list.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight:600 }}>{c.subject_name}</td>
                    <td style={{ color:'var(--gray-600)' }}>{c.teacher_name || '—'}</td>
                    <td>
                      {(c.group_names?.filter(Boolean) || []).map((g) => (
                        <span key={g} className="badge badge-info" style={{ marginRight:4 }}>{g}</span>
                      ))}
                    </td>
                    <td style={{ fontSize:'0.875rem', color:'var(--gray-500)' }}>
                      {new Date(c.starts_at).toLocaleDateString('ru-RU')}{' '}
                      {new Date(c.starts_at).toLocaleTimeString('ru-RU', { hour:'2-digit', minute:'2-digit' })}
                    </td>
                    <td>{c.room || '—'}</td>
                  </tr>
                ))}
                {list.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign:'center', color:'var(--gray-400)', padding:'3rem' }}>
                    Нет занятий
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
