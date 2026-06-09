import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProtectedRoute({ children, role }) {
  const { token, user } = useSelector((s) => s.auth);
  if (!token) return <Navigate to="/login" replace />;
  if (user && role && user.role !== role) {
    const map = { student: '/student', teacher: '/teacher', admin: '/admin' };
    return <Navigate to={map[user.role] || '/login'} replace />;
  }
  return children;
}
