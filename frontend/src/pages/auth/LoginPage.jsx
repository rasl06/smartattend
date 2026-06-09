import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginThunk, clearError } from '../../store/slices/authSlice';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((s) => s.auth);

  const [form, setForm] = useState({ email: '', password: '' });

  const roleMap = { student: '/student', teacher: '/teacher', admin: '/admin' };
  useEffect(() => {
    if (user) navigate(roleMap[user.role] || '/login', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    dispatch(loginThunk(form));
  };

  const fillDemo = (role) => {
    const creds = {
      admin:   { email: 'admin@smartattend.kz',   password: 'Admin123!'    },
      teacher: { email: 'teacher@smartattend.kz', password: 'Teacher123!'  },
      student: { email: 'student@smartattend.kz', password: 'Student123!'  },
    };
    setForm(creds[role]);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--gray-50)', padding: '1rem',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 56, height: 56, background: 'var(--brand)',
            borderRadius: 'var(--radius-lg)', display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.75rem',
          }}>SA</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--gray-900)' }}>
            SmartAttend
          </h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', marginTop: '4px' }}>
            Система контроля посещаемости
          </p>
        </div>

        {/* Card */}
        <div className="card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.5rem' }}>
            Вход в систему
          </h2>

          {error && (
            <div style={{
              padding: '0.75rem 1rem', background: 'var(--danger-bg)',
              border: '1px solid #fca5a5', borderRadius: 'var(--radius-md)',
              color: 'var(--danger)', fontSize: '0.875rem', marginBottom: '1rem',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="input" type="email" placeholder="email@example.com"
                value={form.email} required
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Пароль</label>
              <input className="input" type="password" placeholder="••••••••"
                value={form.password} required
                onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          {/* Demo quick-fill */}
          <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--gray-200)', paddingTop: '1.25rem' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: '0.75rem', textAlign: 'center' }}>
              Демо-аккаунты (нажмите для заполнения)
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['admin','teacher','student'].map((r) => (
                <button key={r} className="btn btn-ghost btn-sm"
                  onClick={() => fillDemo(r)}
                  style={{ flex: 1, justifyContent: 'center', textTransform: 'capitalize' }}>
                  {r === 'admin' ? 'Админ' : r === 'teacher' ? 'Преп.' : 'Студент'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
