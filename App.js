// App.js — PyLearn Mobile
// React Native + Expo — connecté au même backend Django que le frontend web
//
// ─── INSTALLATION ──────────────────────────────────────────
//   1. npm install
//   2. npx expo start
//   3. Scanner le QR avec Expo Go (iOS/Android)
//      ou   npx expo start --android   (émulateur)
//
// ─── CONFIGURATION RÉSEAU ──────────────────────────────────
//   Éditer src/services/api.js → API_BASE_URL
//   • Émulateur Android  : http://10.0.2.2:8000/api
//   • Device physique    : http://<IP_WIFI>:8000/api
//   • Expo Web           : http://localhost:8000/api
//
// ─── CORS DJANGO ───────────────────────────────────────────
//   CORS_ALLOWED_ORIGINS doit inclure l'origine Expo.
//   Pour le dev, CORS_ALLOW_ALL_ORIGINS = True suffit.
// ──────────────────────────────────────────────────────────

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import CourseScreen from './src/screens/CourseScreen';
import ModuleScreen from './src/screens/ModuleScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { COLORS } from './src/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

// ─── Tab bar icons ────────────────────────────────────────
const ICONS = {
  Accueil: { active: '⌂', inactive: '⌂' },
  Cours: { active: '📚', inactive: '📖' },
  Profil: { active: '👤', inactive: '👤' },
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.bgCard,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: COLORS.green,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, focused }) => (
          <Text style={{ fontSize: 20, color }}>{focused ? ICONS[route.name]?.active : ICONS[route.name]?.inactive}</Text>
        ),
      })}
    >
      <Tab.Screen name="Accueil" component={HomeScreen} />
      <Tab.Screen name="Cours" component={CourseScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// ─── Stack principal (inclut ModuleScreen en modal) ───────
function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={MainTabs} />
      <Stack.Screen
        name="Module"
        component={ModuleScreen}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
}

// ─── Auth stack ───────────────────────────────────────────
function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

// ─── Root (switche auth / app selon user) ─────────────────
function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 48, marginBottom: 20 }}>🐍</Text>
        <Text style={{ color: COLORS.text, fontSize: 28, fontWeight: '900', marginBottom: 8 }}>PyLearn</Text>
        <ActivityIndicator color={COLORS.green} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <MainStack /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </AuthProvider>
  );
}
