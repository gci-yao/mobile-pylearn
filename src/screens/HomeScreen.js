// src/screens/HomeScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  RefreshControl, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { courseService } from '../services/api';
import { ProgressBar, LevelBadge, StatBox, Card } from '../components';
import { COLORS, SPACING, RADIUS } from '../theme';

export default function HomeScreen({ navigation }) {
  const { user, refreshUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [progress, setProgress] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [statsRes, progressRes] = await Promise.all([
        courseService.getStats(),
        courseService.getProgress(),
      ]);
      setStats(statsRes.data);
      setProgress(progressRes.data);
    } catch {}
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshUser(), loadData()]);
    setRefreshing(false);
  };

  const profile = user?.profile;
  const pct = progress?.stats?.percentage ?? 0;
  const recentModules = progress?.progress?.slice(0, 5) ?? [];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.green} />}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroLeft}>
            <Text style={styles.greeting}>
              Bonjour, {user?.first_name || user?.username} 👋
            </Text>
            <Text style={styles.heroSub}>Continue ta progression Python</Text>
            {profile && <LevelBadge badge={profile.level_badge} style={{ marginTop: 8, alignSelf: 'flex-start' }} />}
          </View>
          <View style={styles.avatar}>
            <Text style={{ fontSize: 32 }}>🐍</Text>
          </View>
        </View>

        {/* XP & Progression globale */}
        <Card style={{ marginBottom: SPACING.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <Text style={styles.cardTitle}>Progression globale</Text>
            <Text style={{ color: COLORS.green, fontWeight: '800', fontSize: 16 }}>{pct}%</Text>
          </View>
          <ProgressBar value={pct} color={COLORS.green} height={8} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
            <Text style={styles.muted}>
              {progress?.stats?.completed ?? 0} / {progress?.stats?.total ?? 0} modules
            </Text>
            <Text style={{ color: COLORS.green, fontSize: 12 }}>
              {profile?.xp_total ?? 0} XP total
            </Text>
          </View>
        </Card>

        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: SPACING.md }}>
          <StatBox icon="🔥" value={profile?.streak_days ?? 0} label="Jours consécutifs" color={COLORS.orange} />
          <StatBox icon="⚡" value={profile?.xp_total ?? 0} label="Points XP" color={COLORS.green} />
          <StatBox icon="✅" value={progress?.stats?.completed ?? 0} label="Modules" color={COLORS.blue} />
        </View>

        {/* Stats globales plateforme */}
        {stats && (
          <Card style={{ marginBottom: SPACING.md }}>
            <Text style={styles.cardTitle}>La communauté PyLearn</Text>
            <View style={{ flexDirection: 'row', gap: 16, marginTop: 10 }}>
              <View style={styles.statItem}>
                <Text style={{ color: COLORS.green, fontSize: 20, fontWeight: '800' }}>{stats.total_users}</Text>
                <Text style={styles.muted}>Apprenants</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={{ color: COLORS.blue, fontSize: 20, fontWeight: '800' }}>{stats.total_completions}</Text>
                <Text style={styles.muted}>Modules complétés</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={{ color: COLORS.purple, fontSize: 20, fontWeight: '800' }}>{stats.levels_count}</Text>
                <Text style={styles.muted}>Niveaux</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Modules récents */}
        {recentModules.length > 0 && (
          <Card>
            <Text style={styles.cardTitle}>Derniers modules complétés</Text>
            {recentModules.map((p) => (
              <View key={p.id} style={styles.recentItem}>
                <View style={[styles.recentDot, { backgroundColor: p.level_color || COLORS.green }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.recentTitle} numberOfLines={1}>{p.module_title}</Text>
                  <Text style={styles.muted}>{p.level_title}</Text>
                </View>
                <Text style={{ color: COLORS.green, fontSize: 12 }}>✓</Text>
              </View>
            ))}
            <TouchableOpacity
              style={{ marginTop: 12 }}
              onPress={() => navigation.navigate('Cours')}
            >
              <Text style={{ color: COLORS.green, fontWeight: '700', textAlign: 'center' }}>
                Voir tous les cours →
              </Text>
            </TouchableOpacity>
          </Card>
        )}

        {recentModules.length === 0 && (
          <Card style={{ alignItems: 'center', paddingVertical: SPACING.xl }}>
            <Text style={{ fontSize: 40 }}>🚀</Text>
            <Text style={{ color: COLORS.text, fontWeight: '700', fontSize: 16, marginTop: 12 }}>
              Prêt à commencer ?
            </Text>
            <Text style={{ color: COLORS.textMuted, textAlign: 'center', marginTop: 6 }}>
              Explore les cours et complète ton premier module Python.
            </Text>
            <TouchableOpacity
              style={{ marginTop: 16, backgroundColor: COLORS.greenDim, borderRadius: RADIUS.md, paddingHorizontal: 20, paddingVertical: 10 }}
              onPress={() => navigation.navigate('Cours')}
            >
              <Text style={{ color: COLORS.green, fontWeight: '700' }}>Explorer les cours</Text>
            </TouchableOpacity>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: SPACING.md, paddingBottom: SPACING.xl },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  heroLeft: { flex: 1 },
  greeting: { color: COLORS.text, fontSize: 22, fontWeight: '800' },
  heroSub: { color: COLORS.textMuted, fontSize: 13, marginTop: 2 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { color: COLORS.text, fontWeight: '700', fontSize: 15 },
  muted: { color: COLORS.textMuted, fontSize: 12 },
  statItem: { flex: 1, alignItems: 'center' },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 8,
  },
  recentDot: { width: 8, height: 8, borderRadius: 4 },
  recentTitle: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
});
