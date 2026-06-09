import api from './axios';
export const classesAPI = {
  getAll:    ()         => api.get('/classes'),
  getOne:    (id)       => api.get(`/classes/${id}`),
  create:    (data)     => api.post('/classes', data),
  getQR:     (id)       => api.get(`/classes/${id}/qr`),
  getAttend: (id)       => api.get(`/classes/${id}/attendance`),
};
