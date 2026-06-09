import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutThunk } from '../../store/slices/authSlice';
import ToastContainer from '../common/ToastContainer';

function NavItem({ to, label, icon }) {
  return (
    <NavLink to={to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
      <span style={{ fontSize: '1rem' }}>{icon}</span>
      {label}
    </NavLink>
  );
}

export default function Sidebar({ links, title }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    navigate('/login');
  };

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">SA</div>
          <div>
            <div className="sidebar-logo-text">SmartAttend</div>
            <div className="sidebar-logo-sub">{title}</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {links.map((l) => (
            <NavItem key={l.to} to={l.to} label={l.label} icon={l.icon} />
          ))}
        </nav>
        <div className="sidebar-footer">
          <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginBottom: '0.5rem' }}>
            {user?.full_name}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}
            style={{ width: '100%', color: 'var(--gray-400)', borderColor: 'rgba(255,255,255,.15)' }}>
            Выйти
          </button>
        </div>
      </aside>
      <ToastContainer />
    </>
  );
}
