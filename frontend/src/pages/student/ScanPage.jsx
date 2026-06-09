import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { scanAttendance, clearScanResult } from '../../store/slices/attendanceSlice';
import { notify } from '../../store/slices/notifySlice';

export default function ScanPage() {
  const dispatch = useDispatch();
  const { loading, scanResult, error } = useSelector((s) => s.attendance);
  const [form, setForm] = useState({ token: '', classId: '' });

  useEffect(() => {
    return () => { dispatch(clearScanResult()); };
  }, [dispatch]);

  const handleScan = (e) => {
    e.preventDefault();
    dispatch(scanAttendance({
      token:   form.token,
      classId: form.classId,
    })).then((action) => {
      if (action.meta.requestStatus === 'fulfilled') {
        dispatch(notify('Посещаемость отмечена!', 'success'));
      }
    });
  };

  return (
    <div>
      <h1 className="page-title">Сканирование QR-кода</h1>
      <p className="page-subtitle">Введите данные QR-кода для отметки посещаемости</p>

      <div style={{ maxWidth: 520 }}>
        {/* Success */}
        {scanResult && (
          <div style={{
            padding: '1.5rem', background: 'var(--success-bg)',
            border: '1px solid #6ee7b7', borderRadius: 'var(--radius-lg)',
            marginBottom: '1.5rem', textAlign: 'center',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✓</div>
            <h3 style={{ color: '#065f46', fontWeight: 700 }}>Посещаемость отмечена!</h3>
            <p style={{ color: '#047857', marginTop: '4px' }}>
              Статус: <strong>
                {scanResult.status === 'present' ? 'Присутствует' : 'Опоздал'}
              </strong>
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            padding: '1rem', background: 'var(--danger-bg)',
            border: '1px solid #fca5a5', borderRadius: 'var(--radius-md)',
            color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.9rem',
          }}>
            {error}
          </div>
        )}

        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Ввести данные вручную</h3>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            В реальном приложении QR-код сканируется камерой. Здесь введите токен и ID занятия.
          </p>
          <form onSubmit={handleScan} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">ID занятия (classId)</label>
              <input className="input" value={form.classId}
                onChange={(e) => setForm({ ...form, classId: e.target.value })}
                placeholder="UUID занятия" required />
            </div>
            <div className="form-group">
              <label className="form-label">QR-токен</label>
              <textarea className="input" value={form.token} rows={3}
                onChange={(e) => setForm({ ...form, token: e.target.value })}
                placeholder="eyJ..." required
                style={{ resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}
              style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? 'Проверка...' : '⊡ Подтвердить присутствие'}
            </button>
          </form>
        </div>

        <div className="card card-sm" style={{ marginTop: '1rem', background: 'var(--brand-light)' }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--brand-dark)', lineHeight: '1.6' }}>
            <strong>ℹ В мобильном приложении:</strong> студент открывает экран сканирования,
            направляет камеру на QR-код, и система автоматически отмечает посещаемость с
            проверкой геолокации и привязкой к устройству.
          </p>
        </div>
      </div>
    </div>
  );
}
