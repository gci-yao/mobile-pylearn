// src/screens/RegisterScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { Button, ErrorMessage } from '../components';
import { COLORS, RADIUS, SPACING } from '../theme';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [form, setForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password2: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const handleRegister = async () => {
    if (!form.username || !form.email || !form.password || !form.password2) {
      setError('Remplis tous les champs obligatoires.');
      return;
    }
    if (form.password !== form.password2) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register(form);
    } catch (e) {
      const data = e.response?.data;
      if (typeof data === 'object') {
        const msgs = Object.values(data).flat().join('\n');
        setError(msgs);
      } else {
        setError('Erreur lors de la création du compte.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.logo}>🐍</Text>
            <Text style={styles.title}>Créer un compte</Text>
            <Text style={styles.subtitle}>Rejoins PyLearn gratuitement</Text>
          </View>

          <View style={styles.form}>
            {[
              { label: "Nom d'utilisateur *", key: 'username', placeholder: 'charles_dev', autoCapitalize: 'none' },
              { label: 'Email *', key: 'email', placeholder: 'charles@mail.com', autoCapitalize: 'none', keyboardType: 'email-address' },
              { label: 'Prénom', key: 'first_name', placeholder: 'Charles' },
              { label: 'Nom', key: 'last_name', placeholder: 'Kouassi' },
              { label: 'Mot de passe *', key: 'password', placeholder: '••••••••', secure: true },
              { label: 'Confirmer le mot de passe *', key: 'password2', placeholder: '••••••••', secure: true },
            ].map(({ label, key, placeholder, autoCapitalize, keyboardType, secure }, i) => (
              <View key={key} style={i > 0 ? { marginTop: SPACING.md } : {}}>
                <Text style={styles.label}>{label}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={placeholder}
                  placeholderTextColor={COLORS.textMuted}
                  autoCapitalize={autoCapitalize || 'sentences'}
                  keyboardType={keyboardType}
                  secureTextEntry={secure}
                  autoCorrect={false}
                  value={form[key]}
                  onChangeText={set(key)}
                />
              </View>
            ))}

            <ErrorMessage message={error} />

            <Button
              label="Créer mon compte"
              onPress={handleRegister}
              loading={loading}
              style={{ marginTop: SPACING.sm }}
            />
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.footer}>
            <Text style={styles.footerText}>
              Déjà un compte ?{' '}
              <Text style={{ color: COLORS.green, fontWeight: '700' }}>Se connecter</Text>
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
  logo: { fontSize: 48 },
  title: { color: COLORS.text, fontSize: 28, fontWeight: '900', marginTop: 8 },
  subtitle: { color: COLORS.textMuted, fontSize: 14, marginTop: 4, textAlign: 'center' },
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
