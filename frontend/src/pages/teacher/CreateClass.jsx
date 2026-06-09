import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createClass } from '../../store/slices/classesSlice';
import { notify }      from '../../store/slices/notifySlice';
import { subjectsAPI } from '../../api/subjects';
const FALLBACK_SUBJECTS = [
  { id: 'sub-1', name: 'Программирование на Python',   code: 'CS101' },
  { id: 'sub-2', name: 'Базы данных',                  code: 'DB201' },
  { id: 'sub-3', name: 'Веб-разработка',               code: 'WEB301' },
  { id: 'sub-4', name: 'Операционные системы',         code: 'OS401' },
  { id: 'sub-5', name: 'Компьютерные сети',            code: 'NET501' },
  { id: 'sub-6', name: 'Алгоритмы и структуры данных', code: 'ALG601' },
  { id: 'sub-7', name: 'Математический анализ',        code: 'MA701' },
  { id: 'sub-8', name: 'Информационная безопасность',  code: 'SEC801' },
];

const FALLBACK_GROUPS = [
  { id: 'grp-1', name: 'КВТп 22-9'  },
  { id: 'grp-2', name: 'КВТп 22-10' },
  { id: 'grp-3', name: 'ИС 23-1'    },
  { id: 'grp-4', name: 'ИС 23-2'    },
  { id: 'grp-5', name: 'ВТ 21-5'    },
  { id: 'grp-6', name: 'ПО 22-3'    },
];

export default function CreateClass() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((s) => s.classes);

  const [subjects, setSubjects] = useState(FALLBACK_SUBJECTS);
  const [groups,   setGroups]   = useState(FALLBACK_GROUPS);
  const [form, setForm] = useState({
    subject_id: '', room: '', starts_at: '', ends_at: '',
    lat: '', lng: '', group_ids: [],
  });

 useEffect(() => {
  subjectsAPI.getAll()
    .then(({ data }) => { if (data.data?.length) setSubjects(data.data); })
    .catch(() => {}); // при ошибке остаются fallback-данные

  subjectsAPI.getGroups()
    .then(({ data }) => { if (data.data?.length) setGroups(data.data); })
    .catch(() => {});
}, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const toggleGroup = (id) => {
    setForm((f) => ({
      ...f,
      group_ids: f.group_ids.includes(id)
        ? f.group_ids.filter((g) => g !== id)
        : [...f.group_ids, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const action = await dispatch(createClass(form));
    if (action.meta.requestStatus === 'fulfilled') {
      dispatch(notify('Занятие создано!', 'success'));
      navigate('/teacher/classes');
    } else {
      dispatch(notify(action.payload || 'Ошибка создания', 'error'));
    }
  };

  return (
    <div>
      <h1 className="page-title">Новое занятие</h1>
      <p className="page-subtitle">Создайте занятие для генерации QR-кода</p>

      <div style={{ maxWidth: 600 }}>
        <form className="card" onSubmit={handleSubmit}
          style={{ display:'flex', flexDirection:'column', gap:'1.125rem' }}>

          <div className="form-group">
            <label className="form-label">Дисциплина</label>
            <select className="input" value={form.subject_id} required
              onChange={(e) => set('subject_id', e.target.value)}>
              <option value="">— Выберите дисциплину —</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <div className="form-group">
              <label className="form-label">Начало занятия</label>
              <input className="input" type="datetime-local" required
                value={form.starts_at} onChange={(e) => set('starts_at', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Конец занятия</label>
              <input className="input" type="datetime-local" required
                value={form.ends_at} onChange={(e) => set('ends_at', e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Аудитория</label>
            <input className="input" value={form.room} placeholder="A-301"
              onChange={(e) => set('room', e.target.value)} />
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <div className="form-group">
              <label className="form-label">Широта (для геолокации)</label>
              <input className="input" type="number" step="any" placeholder="43.238949"
                value={form.lat} onChange={(e) => set('lat', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Долгота</label>
              <input className="input" type="number" step="any" placeholder="76.889709"
                value={form.lng} onChange={(e) => set('lng', e.target.value)} />
            </div>
          </div>

          {groups.length > 0 && (
            <div className="form-group">
              <label className="form-label">Группы</label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'8px', marginTop:'4px' }}>
                {groups.map((g) => (
                  <label key={g.id} style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer',
                    padding:'4px 12px', border:'1px solid var(--gray-300)', borderRadius:'999px',
                    fontSize:'0.875rem', userSelect:'none',
                    background: form.group_ids.includes(g.id) ? 'var(--brand)' : '#fff',
                    color:      form.group_ids.includes(g.id) ? '#fff' : 'var(--gray-700)',
                  }}>
                    <input type="checkbox" style={{ display:'none' }}
                      checked={form.group_ids.includes(g.id)}
                      onChange={() => toggleGroup(g.id)} />
                    {g.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div style={{ display:'flex', gap:'0.75rem', marginTop:'0.5rem' }}>
            <button className="btn btn-primary" type="submit" disabled={loading}
              style={{ flex:1, justifyContent:'center' }}>
              {loading ? 'Создание...' : '+ Создать занятие'}
            </button>
            <button className="btn btn-ghost" type="button"
              onClick={() => navigate('/teacher/classes')}>
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
