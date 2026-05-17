# PyLearn Mobile — React Native + Expo

Application mobile connectée **au même backend Django** que le frontend web.

## Structure

```
mobile/
├── App.js                        ← Point d'entrée, navigation
├── src/
│   ├── theme.js                  ← Couleurs, espacements
│   ├── context/
│   │   └── AuthContext.js        ← Auth JWT (miroir du web, SecureStore)
│   ├── services/
│   │   └── api.js                ← Axios + intercepteurs (même API Django)
│   ├── components/
│   │   └── index.js              ← ProgressBar, LevelBadge, Button, Card…
│   └── screens/
│       ├── LoginScreen.js
│       ├── RegisterScreen.js
│       ├── HomeScreen.js         ← Dashboard XP / streak / progression
│       ├── CourseScreen.js       ← Liste niveaux + modules
│       ├── ModuleScreen.js       ← Détail + toggle completion
│       └── ProfileScreen.js     ← Profil + édition + logout
```

## Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer l'app
npx expo start

# → QR code : scanner avec Expo Go (iOS / Android)
# → Appuyer sur 'a' pour l'émulateur Android
# → Appuyer sur 'i' pour le simulateur iOS
```

## ⚠️ Configuration réseau

Éditer **`src/services/api.js`** et modifier `API_BASE_URL` :

| Contexte | URL |
|---|---|
| Émulateur Android | `http://10.0.2.2:8000/api` |
| Device physique | `http://192.168.X.X:8000/api` (IP WiFi) |
| Expo Web | `http://localhost:8000/api` |
| Production | `https://api.votre-domaine.com/api` |

## CORS Django

Dans `backend/core/settings.py`, autoriser les origines Expo :

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",     # React web
    "http://localhost:19006",    # Expo Web
    "http://10.0.2.2:8000",      # Émulateur Android
]

# En développement, tu peux aussi utiliser :
# CORS_ALLOW_ALL_ORIGINS = True
```

## Même base de données Django

L'app mobile utilise **exactement les mêmes endpoints** que le frontend web :

| Endpoint | Méthode | Description |
|---|---|---|
| `/api/auth/register/` | POST | Créer un compte |
| `/api/auth/login/` | POST | Obtenir les tokens JWT |
| `/api/auth/refresh/` | POST | Rafraîchir l'access token |
| `/api/auth/me/` | GET/PATCH | Profil utilisateur |
| `/api/levels/` | GET | Tous les niveaux + modules |
| `/api/modules/:id/` | GET | Détail d'un module |
| `/api/modules/:id/toggle/` | POST | Marquer complété/non-complété |
| `/api/progress/` | GET | Progression de l'utilisateur |
| `/api/stats/` | GET | Stats globales de la plateforme |

## Sécurité

Les tokens JWT sont stockés dans **SecureStore** (Keychain iOS / Keystore Android),
pas dans AsyncStorage. Fallback AsyncStorage automatique si SecureStore n'est pas disponible.
