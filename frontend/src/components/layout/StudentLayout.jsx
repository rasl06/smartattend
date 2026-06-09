import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const links = [
  { to: '/student',            label: 'Главная',      icon: '⌂' },
  { to: '/student/scan',       label: 'Сканировать',  icon: '⊡' },
  { to: '/student/attendance', label: 'Посещаемость', icon: '☑' },
];

export default function StudentLayout() {
  return (
    <div className="layout">
      <Sidebar links={links} title="Студент" />
      <div className="main-content">
        <div className="page-content"><Outlet /></div>
      </div>
    </div>
  );
}
