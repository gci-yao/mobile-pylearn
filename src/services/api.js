// src/services/api.js
// ─── Même logique que frontend/src/services/api.js
// ─── Remplace localStorage → AsyncStorage / SecureStore
// ─── URL de base : mettre l'IP de votre machine sur le réseau local
//     (pas "localhost" depuis un device physique)

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️  CONFIGURER selon votre environnement :
//   - Émulateur Android  : http://10.0.2.2:8000/api
//   - Device physique    : http://<IP_LOCALE>:8000/api  (ex: http://192.168.1.42:8000/api)
//   - Expo Web           : http://localhost:8000/api
//   - Prod               : https://api.votre-domaine.com/api
export const API_BASE_URL = 'http://192.168.1.67:8001/api';

const api = axios.create({ baseURL: API_BASE_URL });

// ─── Helpers token (SecureStore pour les tokens sensibles) ────
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

// ─── Intercepteur : injection du token Bearer ─────────────────
api.interceptors.request.use(async (cfg) => {
  const token = await TokenStore.getAccess();
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// ─── Intercepteur : auto-refresh sur 401 ─────────────────────
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
          // L'AuthContext détectera l'absence de token au prochain appel
        }
      }
    }
    return Promise.reject(err);
  }
);

// ─── Services (miroir exact du frontend) ─────────────────────
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
