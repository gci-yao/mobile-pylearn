// src/screens/ProfileScreen.js
import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TextInput, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { LevelBadge, Button, Card, StatBox, ErrorMessage } from '../components';
import { COLORS, SPACING, RADIUS } from '../theme';

const XP_LEVELS = [
  { label: 'Débutant', min: 0, max: 79, color: COLORS.green },
  { label: 'Intermédiaire', min: 80, max: 199, color: COLORS.blue },
  { label: 'Avancé', min: 200, max: 499, color: COLORS.purple },
  { label: 'Expert', min: 500, max: Infinity, color: COLORS.orange },
];

function XpBar({ xp }) {
  const current = XP_LEVELS.findIndex((l) => xp >= l.min && xp <= l.max);
  const level = XP_LEVELS[current] || XP_LEVELS[0];
  const next = XP_LEVELS[current + 1];
  const pct = next
    ? Math.round(((xp - level.min) / (next.min - level.min)) * 100)
    : 100;

  return (
    <View style={{ marginTop: SPACING.md }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ color: level.color, fontWeight: '700' }}>{level.label}</Text>
        {next && <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>→ {next.label} ({next.min - xp} XP)</Text>}
      </View>
      <View style={{ height: 8, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 4 }}>
        <View style={{ width: `${pct}%`, height: 8, backgroundColor: level.color, borderRadius: 4 }} />
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const { user, logout, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    first_name: user?.first_name ?? '',
    last_name: user?.last_name ?? '',
    bio: user?.profile?.bio ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const profile = user?.profile;

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await authService.updateProfile(form);
      await refreshUser();
      setEditing(false);
    } catch {
      setError('Erreur lors de la sauvegarde.');
    }
    setSaving(false);
  };

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Tu veux vraiment te déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnecter', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Avatar + nom */}
        <View style={styles.hero}>
          <View style={styles.avatar}>
            <Text style={{ fontSize: 40 }}>🐍</Text>
          </View>
          <Text style={styles.name}>{user?.first_name || user?.username}</Text>
          <Text style={styles.username}>@{user?.username}</Text>
          {profile && <LevelBadge badge={profile.level_badge} style={{ marginTop: 8 }} />}
        </View>

        {/* XP bar */}
        <Card style={{ marginBottom: SPACING.md }}>
          <Text style={styles.cardTitle}>🏆 {profile?.xp_total ?? 0} XP gagnés</Text>
          <XpBar xp={profile?.xp_total ?? 0} />
        </Card>

        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: SPACING.md }}>
          <StatBox icon="🔥" value={profile?.streak_days ?? 0} label="Streak" color={COLORS.orange} />
          <StatBox icon="✅" value={user?.modules_completed ?? 0} label="Complétés" color={COLORS.green} />
          <StatBox icon="📅" value={
            profile?.created_at
              ? new Date(profile.created_at).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
              : '-'
          } label="Membre depuis" color={COLORS.blue} />
        </View>

        {/* Infos */}
        <Card style={{ marginBottom: SPACING.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={styles.cardTitle}>Informations</Text>
            <TouchableOpacity onPress={() => setEditing(!editing)}>
              <Text style={{ color: COLORS.green, fontWeight: '700' }}>{editing ? 'Annuler' : 'Modifier'}</Text>
            </TouchableOpacity>
          </View>

          {editing ? (
            <View>
              {[
                { label: 'Prénom', key: 'first_name' },
                { label: 'Nom', key: 'last_name' },
                { label: 'Bio', key: 'bio', multi: true },
              ].map(({ label, key, multi }) => (
                <View key={key} style={{ marginBottom: SPACING.sm }}>
                  <Text style={styles.label}>{label}</Text>
                  <TextInput
                    style={[styles.input, multi && { height: 80, textAlignVertical: 'top' }]}
                    value={form[key]}
                    onChangeText={(v) => setForm((f) => ({ ...f, [key]: v }))}
                    multiline={multi}
                    placeholderTextColor={COLORS.textMuted}
                    placeholder={label}
                  />
                </View>
              ))}
              <ErrorMessage message={error} />
              <Button label="Sauvegarder" onPress={handleSave} loading={saving} />
            </View>
          ) : (
            <View>
              <InfoRow label="Email" value={user?.email} />
              <InfoRow label="Nom complet" value={user?.full_name} />
              {profile?.bio ? <InfoRow label="Bio" value={profile.bio} /> : null}
            </View>
          )}
        </Card>

        {/* Logout */}
        <Button
          label="Se déconnecter"
          onPress={handleLogout}
          color="transparent"
          style={{ borderWidth: 1, borderColor: COLORS.red }}
          textStyle={{ color: COLORS.red }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
      <Text style={{ color: COLORS.textMuted, fontSize: 13 }}>{label}</Text>
      <Text style={{ color: COLORS.text, fontSize: 13, fontWeight: '600', maxWidth: '60%', textAlign: 'right' }}>
        {value || '—'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: SPACING.md, paddingBottom: 60 },
  hero: { alignItems: 'center', marginBottom: SPACING.lg },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.bgCard,
    borderWidth: 2,
    borderColor: COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  name: { color: COLORS.text, fontSize: 24, fontWeight: '900' },
  username: { color: COLORS.textMuted, fontSize: 14 },
  cardTitle: { color: COLORS.text, fontWeight: '700', fontSize: 15 },
  label: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600', marginBottom: 4 },
  input: {
    backgroundColor: COLORS.bgInput,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    padding: 12,
    color: COLORS.text,
    fontSize: 14,
  },
});
