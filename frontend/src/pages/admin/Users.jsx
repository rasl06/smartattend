import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { usersAPI }  from '../../api/users';
import { notify }    from '../../store/slices/notifySlice';

const ROLES = ['student', 'teacher', 'admin'];
const ROLE_LABELS = { student: 'Студент', teacher: 'Преподаватель', admin: 'Администратор' };
const ROLE_BADGE  = { student: 'badge-info', teacher: 'badge-success', admin: 'badge-warning' };

export default function AdminUsers() {
  const dispatch = useDispatch();
  const [users,   setUsers]   = useState([]);
  const [filter,  setFilter]  = useState('');
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [form, setForm] = useState({ email: '', password: '', full_name: '', role: 'student' });
  const [saving, setSaving]   = useState(false);

  const load = (role = '') => {
    setLoading(true);
    usersAPI.getAll(role).then(({ data }) => setUsers(data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleFilter = (r) => { setFilter(r); load(r); };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await usersAPI.create(form);
      dispatch(notify('Пользователь создан!', 'success'));
      setModal(false);
      setForm({ email: '', password: '', full_name: '', role: 'student' });
      load(filter);
    } catch (err) {
      dispatch(notify(err.response?.data?.error || 'Ошибка', 'error'));
    } finally { setSaving(false); }
  };

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <h1 className="page-title">Пользователи</h1>
          <p className="page-subtitle">Управление учётными записями</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>+ Добавить</button>
      </div>

      {/* Role filter */}
      <div style={{ display:'flex', gap:'8px', marginBottom:'1.25rem', flexWrap:'wrap' }}>
        {['', ...ROLES].map((r) => (
          <button key={r} onClick={() => handleFilter(r)}
            className={`btn btn-sm ${filter === r ? 'btn-primary' : 'btn-ghost'}`}>
            {r ? ROLE_LABELS[r] : 'Все'}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow:'hidden' }}>
        {loading
          ? <div style={{ textAlign:'center', padding:'3rem' }}><div className="spinner" style={{ margin:'0 auto' }}/></div>
          : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Имя</th><th>Email</th><th>Роль</th><th>Дата регистр.</th><th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight:600 }}>{u.full_name}</td>
                    <td style={{ color:'var(--gray-500)' }}>{u.email}</td>
                    <td><span className={`badge ${ROLE_BADGE[u.role]}`}>{ROLE_LABELS[u.role]}</span></td>
                    <td style={{ color:'var(--gray-500)', fontSize:'0.875rem' }}>
                      {new Date(u.created_at).toLocaleDateString('ru-RU')}
                    </td>
                    <td>
                      <span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>
                        {u.is_active ? 'Активен' : 'Заблокирован'}
                      </span>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign:'center', color:'var(--gray-400)', padding:'3rem' }}>Нет пользователей</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create modal */}
      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'1rem' }}>
          <div className="card" style={{ width:'100%', maxWidth:440, position:'relative' }}>
            <button onClick={() => setModal(false)}
              style={{ position:'absolute', top:12, right:12, background:'none', border:'none', fontSize:'1.25rem', color:'var(--gray-400)', cursor:'pointer' }}>✕</button>
            <h3 style={{ fontWeight:700, marginBottom:'1.25rem' }}>Новый пользователь</h3>
            <form onSubmit={handleCreate} style={{ display:'flex', flexDirection:'column', gap:'0.875rem' }}>
              <div className="form-group">
                <label className="form-label">Полное имя</label>
                <input className="input" required value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="input" type="email" required value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Пароль</label>
                <input className="input" type="password" required minLength={6} value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Роль</label>
                <select className="input" value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                </select>
              </div>
              <div style={{ display:'flex', gap:'0.75rem', marginTop:'0.25rem' }}>
                <button className="btn btn-primary" type="submit" disabled={saving}
                  style={{ flex:1, justifyContent:'center' }}>
                  {saving ? 'Сохранение...' : 'Создать'}
                </button>
                <button className="btn btn-ghost" type="button" onClick={() => setModal(false)}>
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
