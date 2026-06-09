import api from './axios';
export const authAPI = {
  login:   (creds)  => api.post('/auth/login', creds),
  refresh: (token)  => api.post('/auth/refresh', { refreshToken: token }),
  logout:  ()       => api.post('/auth/logout'),
  me:      ()       => api.get('/auth/me'),
};
