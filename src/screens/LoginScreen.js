// src/screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { Button, ErrorMessage } from '../components';
import { COLORS, RADIUS, SPACING } from '../theme';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!form.username || !form.password) {
      setError('Remplis tous les champs.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(form);
      // navigation handled by AppNavigator (user state change)
    } catch (e) {
      const msg = e.response?.data?.detail || 'Identifiants incorrects.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>🐍</Text>
            <Text style={styles.title}>PyLearn</Text>
            <Text style={styles.subtitle}>Apprends Python, module par module</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.label}>Nom d'utilisateur</Text>
            <TextInput
              style={styles.input}
              placeholder="ton_pseudo"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              value={form.username}
              onChangeText={(v) => setForm((f) => ({ ...f, username: v }))}
            />

            <Text style={[styles.label, { marginTop: SPACING.md }]}>Mot de passe</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry
              value={form.password}
              onChangeText={(v) => setForm((f) => ({ ...f, password: v }))}
              onSubmitEditing={handleLogin}
            />

            <ErrorMessage message={error} />

            <Button
              label="Se connecter"
              onPress={handleLogin}
              loading={loading}
              style={{ marginTop: SPACING.sm }}
            />
          </View>

          {/* Footer */}
          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.footer}>
            <Text style={styles.footerText}>
              Pas encore de compte ?{' '}
              <Text style={{ color: COLORS.green, fontWeight: '700' }}>Créer un compte</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { flexGrow: 1, justifyContent: 'center', padding: SPACING.lg },
  header: { alignItems: 'center', marginBottom: SPACING.xl },
  logo: { fontSize: 56 },
  title: { color: COLORS.text, fontSize: 32, fontWeight: '900', marginTop: 8 },
  subtitle: { color: COLORS.textMuted, fontSize: 14, marginTop: 6, textAlign: 'center' },
  form: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
  },
  label: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: {
    backgroundColor: COLORS.bgInput,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    padding: 14,
    color: COLORS.text,
    fontSize: 15,
  },
  footer: { alignItems: 'center', marginTop: SPACING.lg },
  footerText: { color: COLORS.textMuted, fontSize: 14 },
});
