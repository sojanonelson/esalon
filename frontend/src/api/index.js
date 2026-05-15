import axios from 'axios';

const api = axios.create({
  baseURL: 'https://esalon-artx.onrender.com/api'
});

export const fetchServices = () => api.get('/services');
export const createService = (data) => api.post('/services', data);
export const fetchStaff = () => api.get('/staff');
export const createStaff = (data) => api.post('/staff', data);
export const fetchAppointments = () => api.get('/appointments');
export const fetchUserAppointments = (userId) => api.get(`/appointments/user/${userId}`);
export const createAppointment = (data) => api.post('/appointments', data);
export const updateAppointmentStatus = (id, status) => api.patch(`/appointments/${id}/status`, { status });
export const fetchDashboardData = () => api.get('/admin/dashboard');

export const loginUser = (data) => api.post('/auth/login', data);
export const registerUser = (data) => api.post('/auth/register', data);

export const createRazorpayOrder = (amount) => api.post('/payment/create-order', { amount });
export const verifyPayment = (paymentData) => api.post('/payment/verify', paymentData);

export default api;
