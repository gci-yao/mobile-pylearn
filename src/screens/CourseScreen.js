// src/screens/CourseScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { courseService } from '../services/api';
import { ProgressBar, ModuleCard } from '../components';
import { COLORS, SPACING, RADIUS } from '../theme';

export default function CourseScreen({ navigation }) {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState({});

  const loadLevels = useCallback(async () => {
    try {
      const { data } = await courseService.getLevels();
      setLevels(data);
      // Auto-expand first level
      if (data.length > 0) setExpanded({ [data[0].id]: true });
    } catch {}
  }, []);

  useEffect(() => {
    loadLevels().finally(() => setLoading(false));
  }, [loadLevels]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLevels();
    setRefreshing(false);
  };

  const toggleLevel = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={COLORS.green} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.green} />}
      >
        <Text style={styles.pageTitle}>Cours Python</Text>
        <Text style={styles.pageSub}>Du débutant à l'expert</Text>

        {levels.map((level) => {
          const isOpen = !!expanded[level.id];
          return (
            <View key={level.id} style={[styles.levelBlock, { borderColor: `${level.accent}33` }]}>
              {/* Level header */}
              <TouchableOpacity
                onPress={() => toggleLevel(level.id)}
                activeOpacity={0.8}
                style={styles.levelHeader}
              >
                <View style={styles.levelLeft}>
                  <Text style={{ fontSize: 28 }}>{level.icon}</Text>
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={[styles.levelTitle, { color: level.text_color || COLORS.text }]}>
                      {level.title}
                    </Text>
                    <Text style={styles.levelDesc} numberOfLines={1}>{level.description}</Text>
                  </View>
                </View>
                <Text style={{ color: COLORS.textMuted, fontSize: 18 }}>{isOpen ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {/* Level progress */}
              <View style={styles.levelProgress}>
                <ProgressBar value={level.completion_pct} color={level.accent} height={4} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                  <Text style={styles.muted}>{level.completed_count}/{level.modules_count} modules</Text>
                  <Text style={[styles.muted, { color: level.accent }]}>{level.completion_pct}%</Text>
                </View>
              </View>

              {/* Modules list */}
              {isOpen && (
                <View style={{ paddingHorizontal: SPACING.md, paddingBottom: SPACING.md }}>
                  {level.modules.map((module) => (
                    <ModuleCard
                      key={module.id}
                      module={module}
                      accent={level.accent}
                      onPress={() => navigation.navigate('Module', { moduleId: module.id, levelAccent: level.accent, levelTitle: level.title })}
                    />
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: SPACING.md, paddingBottom: SPACING.xl },
  pageTitle: { color: COLORS.text, fontSize: 24, fontWeight: '900' },
  pageSub: { color: COLORS.textMuted, fontSize: 14, marginBottom: SPACING.lg },
  levelBlock: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  levelLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  levelTitle: { fontWeight: '800', fontSize: 17 },
  levelDesc: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  levelProgress: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  muted: { color: COLORS.textMuted, fontSize: 12 },
});
