import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Html5Qrcode } from 'html5-qrcode';
import { scanAttendance, clearScanResult } from '../../store/slices/attendanceSlice';
import { notify } from '../../store/slices/notifySlice';

function extractClassId(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return '';
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.class_id || '';
  } catch {
    return '';
  }
}

export default function ScanPage() {
  const dispatch = useDispatch();
  const { loading, scanResult, error } = useSelector((s) => s.attendance);
  const [form, setForm] = useState({ token: '', classId: '' });
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const scannerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) scannerRef.current.stop().catch(() => {});
      dispatch(clearScanResult());
    };
  }, [dispatch]);

  const startScan = async () => {
    setCameraError('');
    setScanning(true);
    try {
      const html5Qrcode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5Qrcode;
      await html5Qrcode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          const classId = extractClassId(decodedText);
          setForm({ token: decodedText, classId });
          stopScan();
        },
        () => {}
      );
    } catch {
      setCameraError('Не удалось открыть камеру. Разрешите доступ в браузере.');
      setScanning(false);
    }
  };

  const stopScan = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {});
      scannerRef.current = null;
    }
    setScanning(false);
  };

  const handleScan = (e) => {
    e.preventDefault();
    dispatch(scanAttendance({ token: form.token, classId: form.classId }))
      .then((action) => {
        if (action.meta.requestStatus === 'fulfilled') {
          dispatch(notify('Посещаемость отмечена!', 'success'));
        }
      });
  };

  return (
    <div>
      <h1 className="page-title">Сканирование QR-кода</h1>
      <p className="page-subtitle">Наведите камеру на QR-код преподавателя</p>

      <div style={{ maxWidth: 520 }}>
        {scanResult && (
          <div style={{
            padding: '1.5rem', background: 'var(--success-bg)',
            border: '1px solid #6ee7b7', borderRadius: 'var(--radius-lg)',
            marginBottom: '1.5rem', textAlign: 'center',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>✓</div>
            <h3 style={{ color: '#065f46', fontWeight: 700 }}>Посещаемость отмечена!</h3>
            <p style={{ color: '#047857', marginTop: '4px' }}>
              Статус: <strong>{scanResult.status === 'present' ? 'Присутствует' : 'Опоздал'}</strong>
            </p>
          </div>
        )}

        {error && (
          <div style={{
            padding: '1rem', background: 'var(--danger-bg)',
            border: '1px solid #fca5a5', borderRadius: 'var(--radius-md)',
            color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.9rem',
          }}>
            {error}
          </div>
        )}

        <div className="card" style={{ marginBottom: '1rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>📷 Сканировать камерой</h3>
          {cameraError && (
            <div style={{ color: 'var(--danger)', fontSize: '0.875rem', marginBottom: '1rem' }}>
              {cameraError}
            </div>
          )}
          <div id="qr-reader" style={{ width: '100%', marginBottom: '1rem' }}></div>
          {!scanning ? (
            <button className="btn btn-primary" onClick={startScan}
              style={{ width: '100%', justifyContent: 'center' }}>
              Открыть камеру
            </button>
          ) : (
            <button className="btn" onClick={stopScan}
              style={{ width: '100%', justifyContent: 'center' }}>
              Остановить
            </button>
          )}
        </div>

        {form.token && (
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>✅ QR отсканирован</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginBottom: '1rem' }}>
              Занятие определено автоматически. Нажмите кнопку для подтверждения.
            </p>
            <form onSubmit={handleScan}>
              <button className="btn btn-primary" type="submit" disabled={loading}
                style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? 'Проверка...' : '⊡ Подтвердить присутствие'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}