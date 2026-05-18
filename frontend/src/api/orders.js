import api from './axios';

export const getMyOrders = () =>
  api.get('/orders/mine');

export const updateOrderStatus = (id, status) =>
  api.put(`/orders/${id}/status`, { status });
