import { useEffect, useState } from 'react';
import { usersAPI } from '../../api/users';
import StatCard from '../../components/common/StatCard';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#0ea96e', '#d97706', '#dc2626'];

export default function AdminDashboard() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersAPI.getStats()
      .then(({ data }) => setStats(data.data))
      .finally(() => setLoading(false));
  }, []);

  const pieData = stats ? [
    { name: 'Присутствовали', value: parseInt(stats.present_count) },
    { name: 'Опоздали',       value: parseInt(stats.late_count)    },
    { name: 'Отсутствовали',  value: parseInt(stats.absent_count)  },
  ] : [];

  const barData = stats ? [
    { name: 'Студенты',  value: parseInt(stats.students)  },
    { name: 'Преп-ли',   value: parseInt(stats.teachers)  },
    { name: 'Занятия',   value: parseInt(stats.classes)   },
    { name: 'Записей',   value: parseInt(stats.attendance_records) },
  ] : [];

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>
      <div className="spinner" style={{ margin: '0 auto' }} />
    </div>
  );

  return (
    <div>
      <h1 className="page-title">Панель администратора</h1>
      <p className="page-subtitle">Общая статистика системы SmartAttend</p>

      <div className="stats-grid">
        <StatCard label="Студентов"   value={stats?.students  || 0} color="var(--brand)"   sub="зарегистрировано" />
        <StatCard label="Преподавателей" value={stats?.teachers || 0} color="var(--gray-700)" />
        <StatCard label="Занятий"     value={stats?.classes   || 0} color="var(--success)" />
        <StatCard label="Записей посещ." value={stats?.attendance_records || 0} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '0.5rem' }}>

        {/* Bar chart */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Обзор системы</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--gray-500)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--gray-500)' }} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid var(--gray-200)', fontSize: 13 }}
              />
              <Bar dataKey="value" fill="var(--brand)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Статусы посещаемости</h3>
          {pieData.every((d) => d.value === 0) ? (
            <p style={{ color: 'var(--gray-400)', textAlign: 'center', padding: '3rem 0' }}>Нет данных</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid var(--gray-200)', fontSize: 13 }}
                />
                <Legend wrapperStyle={{ fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
