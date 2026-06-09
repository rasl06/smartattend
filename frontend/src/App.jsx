import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe } from './store/slices/authSlice';

import LoginPage      from './pages/auth/LoginPage';
import StudentLayout  from './components/layout/StudentLayout';
import TeacherLayout  from './components/layout/TeacherLayout';
import AdminLayout    from './components/layout/AdminLayout';

import StudentDashboard  from './pages/student/Dashboard';
import StudentAttendance from './pages/student/Attendance';
import ScanPage          from './pages/student/ScanPage';

import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherClasses   from './pages/teacher/Classes';
import ClassDetail      from './pages/teacher/ClassDetail';
import CreateClass      from './pages/teacher/CreateClass';

import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers     from './pages/admin/Users';
import AdminClasses   from './pages/admin/Classes';

import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingScreen  from './components/common/LoadingScreen';

export default function App() {
  const dispatch = useDispatch();
  const { token, user, loading } = useSelector((s) => s.auth);

  useEffect(() => {
    if (token && !user) dispatch(fetchMe());
  }, [token, user, dispatch]);

  if (loading) return <LoadingScreen />;

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Student */}
        <Route path="/student" element={
          <ProtectedRoute role="student"><StudentLayout /></ProtectedRoute>
        }>
          <Route index          element={<StudentDashboard />} />
          <Route path="attendance" element={<StudentAttendance />} />
          <Route path="scan"    element={<ScanPage />} />
        </Route>

        {/* Teacher */}
        <Route path="/teacher" element={
          <ProtectedRoute role="teacher"><TeacherLayout /></ProtectedRoute>
        }>
          <Route index         element={<TeacherDashboard />} />
          <Route path="classes"   element={<TeacherClasses />} />
          <Route path="classes/:id" element={<ClassDetail />} />
          <Route path="create"   element={<CreateClass />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={
          <ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>
        }>
          <Route index        element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="classes" element={<AdminClasses />} />
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<RoleRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

function RoleRedirect() {
  const { user } = useSelector((s) => s.auth);
  if (!user) return <Navigate to="/login" replace />;
  const map = { student: '/student', teacher: '/teacher', admin: '/admin' };
  return <Navigate to={map[user.role] || '/login'} replace />;
}
