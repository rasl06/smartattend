import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQR } from '../../store/slices/classesSlice';

const TTL = 90;

export default function QRDisplay({ classId }) {
  const dispatch  = useDispatch();
  const { qr }    = useSelector((s) => s.classes);
  const [remain, setRemain] = useState(TTL);

  const refresh = useCallback(() => {
    dispatch(fetchQR(classId));
    setRemain(TTL);
  }, [classId, dispatch]);

  // Первичная загрузка
  useEffect(() => { refresh(); }, [refresh]);

  // Таймер обратного отсчёта
  useEffect(() => {
    if (!qr) return;
    const interval = setInterval(() => {
      setRemain((prev) => {
        if (prev <= 1) { refresh(); return TTL; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [qr, refresh]);

  const pct     = Math.round((remain / TTL) * 100);
  const timerCls = remain <= 10 ? 'danger' : remain <= 25 ? 'warning' : '';

  if (!qr) return (
    <div className="qr-container">
      <div className="spinner" />
      <p style={{ marginTop: '1rem', color: 'var(--gray-500)' }}>Генерация QR-кода...</p>
    </div>
  );

  return (
    <div className="qr-container">
      <h3 style={{ marginBottom: '1rem', fontWeight: 700 }}>QR-код для занятия</h3>
      <img src={qr.qrImage} alt="QR код" className="qr-img" />

      <div style={{ marginTop: '1.25rem', width: '100%', textAlign: 'center' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)', marginBottom: '6px' }}>
          Обновится через <strong style={{ color: remain <= 10 ? 'var(--danger)' : 'var(--gray-700)' }}>
            {remain}с
          </strong>
        </p>
        <div className="qr-timer">
          <div className={`qr-timer-bar ${timerCls}`} style={{ width: `${pct}%` }} />
        </div>
      </div>

      <button className="btn btn-ghost btn-sm" onClick={refresh}
        style={{ marginTop: '1rem' }}>
        ↻ Обновить сейчас
      </button>
    </div>
  );
}
