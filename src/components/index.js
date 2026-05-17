// src/components/index.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../theme';

// ─── ProgressBar ─────────────────────────────────────────────
export function ProgressBar({ value = 0, color = COLORS.green, height = 6, style }) {
  return (
    <View style={[{ height, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: height / 2 }, style]}>
      <View
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          height,
          backgroundColor: color,
          borderRadius: height / 2,
        }}
      />
    </View>
  );
}

// ─── LevelBadge ──────────────────────────────────────────────
const BADGE_MAP = {
  Débutant: { color: COLORS.green, bg: 'rgba(34,197,94,0.15)' },
  Intermédiaire: { color: COLORS.blue, bg: 'rgba(59,130,246,0.15)' },
  Avancé: { color: COLORS.purple, bg: 'rgba(168,85,247,0.15)' },
  Expert: { color: COLORS.orange, bg: 'rgba(249,115,22,0.15)' },
};

export function LevelBadge({ badge, style }) {
  const theme = BADGE_MAP[badge] || BADGE_MAP['Débutant'];
  return (
    <View style={[{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: theme.bg }, style]}>
      <Text style={{ color: theme.color, fontSize: 12, fontWeight: '700' }}>{badge}</Text>
    </View>
  );
}

// ─── Button ──────────────────────────────────────────────────
export function Button({ label, onPress, color = COLORS.green, loading = false, style, textStyle, disabled }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[{
        backgroundColor: color,
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        opacity: disabled || loading ? 0.6 : 1,
      }, style]}
    >
      {loading
        ? <ActivityIndicator color="#fff" />
        : <Text style={[{ color: '#fff', fontWeight: '700', fontSize: 16 }, textStyle]}>{label}</Text>
      }
    </TouchableOpacity>
  );
}

// ─── Card ─────────────────────────────────────────────────────
export function Card({ children, style }) {
  return (
    <View style={[{
      backgroundColor: COLORS.bgCard,
      borderRadius: RADIUS.lg,
      borderWidth: 1,
      borderColor: COLORS.border,
      padding: SPACING.md,
    }, style]}>
      {children}
    </View>
  );
}

// ─── StatBox ──────────────────────────────────────────────────
export function StatBox({ icon, value, label, color = COLORS.green }) {
  return (
    <View style={{
      flex: 1,
      backgroundColor: COLORS.bgCard,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: COLORS.border,
      padding: SPACING.md,
      alignItems: 'center',
    }}>
      <Text style={{ fontSize: 22 }}>{icon}</Text>
      <Text style={{ color, fontSize: 22, fontWeight: '800', marginTop: 4 }}>{value}</Text>
      <Text style={{ color: COLORS.textMuted, fontSize: 11, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

// ─── ModuleCard ──────────────────────────────────────────────
export function ModuleCard({ module, onPress, accent = COLORS.green }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        backgroundColor: COLORS.bgCard,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: module.is_completed ? `${accent}44` : COLORS.border,
        padding: SPACING.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 10,
      }}
    >
      <View style={{
        width: 44,
        height: 44,
        borderRadius: 10,
        backgroundColor: module.is_completed ? `${accent}22` : 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Text style={{ fontSize: 20 }}>{module.icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: COLORS.text, fontWeight: '700', fontSize: 14 }} numberOfLines={1}>
          {module.title}
        </Text>
        <Text style={{ color: COLORS.textMuted, fontSize: 12, marginTop: 2 }} numberOfLines={1}>
          {module.description}
        </Text>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
          <Text style={{ color: COLORS.textMuted, fontSize: 11 }}>⏱ {module.duration_min} min</Text>
          <Text style={{ color: accent, fontSize: 11 }}>+{module.xp_reward} XP</Text>
        </View>
      </View>
      {module.is_completed && (
        <View style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: `${accent}22`,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Text style={{ color: accent, fontSize: 14 }}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── ErrorMessage ────────────────────────────────────────────
export function ErrorMessage({ message }) {
  if (!message) return null;
  return (
    <View style={{
      backgroundColor: 'rgba(239,68,68,0.12)',
      borderWidth: 1,
      borderColor: 'rgba(239,68,68,0.3)',
      borderRadius: RADIUS.sm,
      padding: SPACING.sm,
      marginBottom: SPACING.sm,
    }}>
      <Text style={{ color: '#ef4444', fontSize: 13 }}>{message}</Text>
    </View>
  );
}
