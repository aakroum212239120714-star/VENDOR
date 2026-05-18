import axios from 'axios';

const publicApi = axios.create({ baseURL: '/api/public' });

export const getPublicStore = (slug) =>
  publicApi.get(`/${slug}`);

export const getPublicProducts = (slug) =>
  publicApi.get(`/${slug}/products`);

export const placeOrder = (slug, data) =>
  publicApi.post(`/${slug}/order`, data);
