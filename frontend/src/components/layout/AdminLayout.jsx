import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const links = [
  { to: '/admin',          label: 'Панель',       icon: '⌂' },
  { to: '/admin/users',    label: 'Пользователи', icon: '☺' },
  { to: '/admin/classes',  label: 'Занятия',      icon: '⊞' },
];

export default function AdminLayout() {
  return (
    <div className="layout">
      <Sidebar links={links} title="Администратор" />
      <div className="main-content">
        <div className="page-content"><Outlet /></div>
      </div>
    </div>
  );
}
