import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ URL de production Render — remplacer par ton URL réelle après déploiement
// export const API_BASE_URL = 'https://backend-pylearn.onrender.com/api';

// Pour le développement local, commenter la ligne ci-dessus et décommenter :
export const API_BASE_URL = 'http://192.168.1.73:8001/api';

const api = axios.create({ baseURL: API_BASE_URL });

export const TokenStore = {
  async getAccess() {
    try { return await SecureStore.getItemAsync('access_token'); }
    catch { return await AsyncStorage.getItem('access_token'); }
  },
  async getRefresh() {
    try { return await SecureStore.getItemAsync('refresh_token'); }
    catch { return await AsyncStorage.getItem('refresh_token'); }
  },
  async setTokens(access, refresh) {
    try {
      await SecureStore.setItemAsync('access_token', access);
      await SecureStore.setItemAsync('refresh_token', refresh);
    } catch {
      await AsyncStorage.setItem('access_token', access);
      await AsyncStorage.setItem('refresh_token', refresh);
    }
  },
  async clear() {
    try {
      await SecureStore.deleteItemAsync('access_token');
      await SecureStore.deleteItemAsync('refresh_token');
    } catch {}
    await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
  },
};

api.interceptors.request.use(async (cfg) => {
  const token = await TokenStore.getAccess();
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = await TokenStore.getRefresh();
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh/`, { refresh });
          await TokenStore.setTokens(data.access, refresh);
          original.headers.Authorization = `Bearer ${data.access}`;
          return api(original);
        } catch {
          await TokenStore.clear();
        }
      }
    }
    return Promise.reject(err);
  }
);

export const authService = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  me: () => api.get('/auth/me/'),
  updateProfile: (data) => api.patch('/auth/me/', data),
};

export const courseService = {
  getLevels: () => api.get('/levels/'),
  getModule: (id) => api.get(`/modules/${id}/`),
  toggleModule: (id) => api.post(`/modules/${id}/toggle/`),
  getProgress: () => api.get('/progress/'),
  getStats: () => api.get('/stats/'),
};

export default api;
