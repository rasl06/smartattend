import { useEffect } from 'react';
import { useParams }  from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClassAttendance } from '../../store/slices/attendanceSlice';
import QRDisplay        from '../../components/teacher/QRDisplay';
import AttendanceTable  from '../../components/teacher/AttendanceTable';

export default function ClassDetail() {
  const { id }   = useParams();
  const dispatch = useDispatch();
  const { classLogs, loading } = useSelector((s) => s.attendance);
  const { list }               = useSelector((s) => s.classes);
  const cls = list.find((c) => c.id === id);

  useEffect(() => { dispatch(fetchClassAttendance(id)); }, [dispatch, id]);

  const present = classLogs.filter((r) => r.status === 'present').length;
  const late    = classLogs.filter((r) => r.status === 'late').length;
  const total   = classLogs.length;

  return (
    <div>
      <h1 className="page-title">{cls?.subject_name || 'Занятие'}</h1>
      <p className="page-subtitle">
        {cls ? `${new Date(cls.starts_at).toLocaleDateString('ru-RU')} · Ауд. ${cls.room || '—'}` : id}
      </p>

      <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', gap:'1.5rem', alignItems:'start' }}>
        {/* QR column */}
        <div>
          <QRDisplay classId={id} />
          <div style={{ marginTop:'1rem', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0.5rem' }}>
            {[
              { label:'Присутствуют', value:present, color:'var(--success)' },
              { label:'Опоздали',     value:late,    color:'var(--warning)' },
              { label:'Всего',        value:total,   color:'var(--brand)'   },
            ].map((s) => (
              <div key={s.label} className="card card-sm" style={{ textAlign:'center' }}>
                <div style={{ fontSize:'1.5rem', fontWeight:700, color:s.color }}>{s.value}</div>
                <div style={{ fontSize:'0.7rem', color:'var(--gray-500)', marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance list */}
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid var(--gray-200)' }}>
            <h3 style={{ fontWeight:700 }}>Список посещаемости</h3>
          </div>
          {loading
            ? <div style={{ textAlign:'center', padding:'3rem' }}><div className="spinner" style={{ margin:'0 auto' }}/></div>
            : <AttendanceTable records={classLogs} />
          }
        </div>
      </div>
    </div>
  );
}
