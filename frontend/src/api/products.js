import api from './axios';

export const getMyProducts = () =>
  api.get('/products/mine');

export const createProduct = (formData) =>
  api.post('/products', formData, );

export const updateProduct = (id, formData) =>
  api.put(`/products/${id}`, formData, );
    
  

export const deleteProduct = (id) =>
  api.delete(`/products/${id}`);
