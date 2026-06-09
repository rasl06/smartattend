import api from './axios';
export const attendanceAPI = {
  scan:               (data)    => api.post('/attendance/scan', data),
  getMy:              ()        => api.get('/attendance/my'),
  getClassAttendance: (classId) => api.get(`/classes/${classId}/attendance`),
};
