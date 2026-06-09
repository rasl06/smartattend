import api from './axios';
export const subjectsAPI = {
  getAll:    () => api.get('/subjects'),
  getGroups: () => api.get('/subjects/groups'),
};
