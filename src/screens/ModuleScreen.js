// src/screens/ModuleScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { courseService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button, Card } from '../components';
import { COLORS, SPACING, RADIUS } from '../theme';

export default function ModuleScreen({ route, navigation }) {
  const { moduleId, levelAccent = COLORS.green, levelTitle } = route.params;
  const { refreshUser } = useAuth();
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [result, setResult] = useState(null); // { xp_total, level_badge, completed }
  const [activeTab, setActiveTab] = useState('concept'); // concept | code | exercises

  const loadModule = useCallback(async () => {
    try {
      const { data } = await courseService.getModule(moduleId);
      setModule(data);
    } catch {}
    setLoading(false);
  }, [moduleId]);

  useEffect(() => { loadModule(); }, [loadModule]);

  const handleToggle = async () => {
    setToggling(true);
    try {
      const { data } = await courseService.toggleModule(moduleId);
      setResult(data);
      setModule((m) => ({ ...m, is_completed: data.completed }));
      await refreshUser();
    } catch {}
    setToggling(false);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={levelAccent} size="large" />
      </View>
    );
  }

  if (!module) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: COLORS.textMuted }}>Module introuvable.</Text>
      </View>
    );
  }

  const TABS = [
    { key: 'concept', label: '📖 Concept' },
    { key: 'code', label: '💻 Code' },
    { key: 'exercises', label: `✏️ Exercices (${module.exercises?.length ?? 0})` },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Back button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
        <Text style={{ color: levelAccent, fontSize: 16 }}>← Retour</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconBox, { backgroundColor: `${levelAccent}22` }]}>
            <Text style={{ fontSize: 32 }}>{module.icon}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.levelLabel}>{levelTitle}</Text>
            <Text style={styles.title}>{module.title}</Text>
            <View style={{ flexDirection: 'row', gap: 14, marginTop: 4 }}>
              <Text style={styles.meta}>⏱ {module.duration_min} min</Text>
              <Text style={[styles.meta, { color: levelAccent }]}>+{module.xp_reward} XP</Text>
            </View>
          </View>
        </View>

        <Text style={styles.description}>{module.description}</Text>

        {/* Tabs */}
        <View style={styles.tabs}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[styles.tab, activeTab === tab.key && { borderBottomColor: levelAccent, borderBottomWidth: 2 }]}
            >
              <Text style={[styles.tabLabel, activeTab === tab.key && { color: levelAccent }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Concept */}
        {activeTab === 'concept' && (
          <Card>
            <Text style={styles.conceptText}>{module.concept}</Text>
          </Card>
        )}

        {/* Code */}
        {activeTab === 'code' && (
          <View style={styles.codeBlock}>
            <Text style={styles.codeText}>{module.code_example}</Text>
          </View>
        )}

        {/* Exercises */}
        {activeTab === 'exercises' && (
          <View>
            {module.exercises?.map((ex, i) => (
              <Card key={ex.id} style={{ marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={[styles.exNumber, { backgroundColor: `${levelAccent}22` }]}>
                    <Text style={{ color: levelAccent, fontWeight: '800', fontSize: 13 }}>{i + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.exText}>{ex.text}</Text>
                    {ex.hint ? (
                      <Text style={styles.hint}>💡 {ex.hint}</Text>
                    ) : null}
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Feedback after toggle */}
        {result && (
          <View style={[styles.feedback, { borderColor: `${levelAccent}44` }]}>
            <Text style={{ fontSize: 28 }}>{result.completed ? '🎉' : '↩️'}</Text>
            <Text style={{ color: COLORS.text, fontWeight: '700', marginTop: 6 }}>
              {result.completed ? 'Module complété !' : 'Module retiré de ta progression'}
            </Text>
            <Text style={{ color: levelAccent, fontSize: 18, fontWeight: '800', marginTop: 4 }}>
              {result.xp_total} XP · {result.level_badge}
            </Text>
            <Text style={{ color: COLORS.textMuted, fontSize: 13, marginTop: 4 }}>
              {result.completed_modules}/{result.total_modules} modules — {result.global_pct}%
            </Text>
          </View>
        )}

        {/* CTA */}
        <Button
          label={module.is_completed ? '✓ Marquer comme non terminé' : `Marquer comme terminé (+${module.xp_reward} XP)`}
          onPress={handleToggle}
          loading={toggling}
          color={module.is_completed ? COLORS.bgInput : levelAccent}
          style={{ marginTop: SPACING.md }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  back: { paddingHorizontal: SPACING.md, paddingVertical: 10 },
  container: { padding: SPACING.md, paddingBottom: 60 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  iconBox: { width: 64, height: 64, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  levelLabel: { color: COLORS.textMuted, fontSize: 12 },
  title: { color: COLORS.text, fontWeight: '900', fontSize: 20 },
  meta: { color: COLORS.textMuted, fontSize: 13 },
  description: { color: COLORS.textMuted, fontSize: 14, lineHeight: 20, marginBottom: SPACING.md },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  tabLabel: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
  conceptText: { color: COLORS.text, fontSize: 14, lineHeight: 22 },
  codeBlock: {
    backgroundColor: '#0d1117',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  codeText: {
    fontFamily: 'monospace',
    color: '#e6edf3',
    fontSize: 13,
    lineHeight: 20,
  },
  exNumber: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  exText: { color: COLORS.text, fontSize: 14, lineHeight: 20 },
  hint: { color: COLORS.textMuted, fontSize: 12, marginTop: 6, fontStyle: 'italic' },
  feedback: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.lg,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
});
