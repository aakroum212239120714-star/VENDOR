import api from './axios';

export const getMyStore = () =>
  api.get('/stores/mine');

export const createStore = (formData) =>
  api.post('/stores', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateMyStore = (formData) =>
  api.put('/stores/mine', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
