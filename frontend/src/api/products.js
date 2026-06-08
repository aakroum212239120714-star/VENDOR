import api from './axios';

export const getMyProducts = () =>
  api.get('/products/mine');

export const createProduct = (formData) =>
  api.post('/products', formData, {
    headers: { 
      'Content-Type': undefined  // ✅ اتركه لـ browser يحدده تلقائياً
    },
  });

export const updateProduct = (id, formData) =>
  api.put(`/products/${id}`, formData, {
    headers: { 
      'Content-Type': undefined  // ✅ اتركه لـ browser يحدده تلقائياً
    },
  });
    
  

export const deleteProduct = (id) =>
  api.delete(`/products/${id}`);
