import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const links = [
  { to: '/teacher',          label: 'Главная',    icon: '⌂' },
  { to: '/teacher/classes',  label: 'Занятия',    icon: '⊞' },
  { to: '/teacher/create',   label: 'Новое занятие', icon: '+' },
];

export default function TeacherLayout() {
  return (
    <div className="layout">
      <Sidebar links={links} title="Преподаватель" />
      <div className="main-content">
        <div className="page-content"><Outlet /></div>
      </div>
    </div>
  );
}
