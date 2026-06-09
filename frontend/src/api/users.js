import api from './axios';
export const usersAPI = {
  getAll:    (role) => api.get('/users', { params: role ? { role } : {} }),
  create:    (data) => api.post('/users', data),
  getStats:  ()     => api.get('/users/stats'),
};
