import { useSelector, useDispatch } from 'react-redux';
import { removeToast } from '../../store/slices/notifySlice';

export default function ToastContainer() {
  const toasts   = useSelector((s) => s.notify.toasts);
  const dispatch = useDispatch();
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}
          onClick={() => dispatch(removeToast(t.id))} style={{ cursor: 'pointer' }}>
          <span>{t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}</span>
          {t.message}
        </div>
      ))}
    </div>
  );
}
