import React, { useMemo, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

type UserSnapshot = {
  income: number;
  expenses: number;
  activityHoursPerWeek: number;
  sleepHoursPerDay: number;
  nutritionScore: number;
  newConnectionsPerMonth: number;
};

type GlobalTrend = {
  key: string;
  impact: number;
  confidence: number;
};

type Scenario = {
  id: string;
  title: string;
  probability: number;
  summary: string;
};

const initialState: UserSnapshot = {
  income: 3000,
  expenses: 2200,
  activityHoursPerWeek: 4,
  sleepHoursPerDay: 7,
  nutritionScore: 6,
  newConnectionsPerMonth: 3
};

const trends: GlobalTrend[] = [
  { key: "job-market", impact: -0.15, confidence: 0.7 },
  { key: "ai-productivity", impact: 0.25, confidence: 0.9 },
  { key: "health-awareness", impact: 0.1, confidence: 0.8 }
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const normalize = (value: number, max: number) => clamp(value / max, 0, 1);

function buildScenarios(snapshot: UserSnapshot, globalTrends: GlobalTrend[]): Scenario[] {
  const savingsRate = snapshot.income > 0
    ? (snapshot.income - snapshot.expenses) / snapshot.income
    : 0;

  const trendScore = globalTrends.reduce((acc, trend) => acc + trend.impact * trend.confidence, 0);

  const finances = clamp(savingsRate * 100 + trendScore * 20, 0, 100);
  const energy = clamp(
    normalize(snapshot.activityHoursPerWeek, 10) * 40 +
      normalize(snapshot.sleepHoursPerDay, 8) * 40 +
      normalize(snapshot.nutritionScore, 10) * 20,
    0,
    100
  );
  const social = clamp(normalize(snapshot.newConnectionsPerMonth, 8) * 100, 0, 100);

  const balancedProbability = clamp((finances + energy + social) / 3, 0, 100);
  const growthProbability = clamp((finances * 0.5 + social * 0.5) * 0.95, 0, 100);
  const resetProbability = clamp(100 - balancedProbability * 0.8, 0, 100);

  return [
    {
      id: "balanced",
      title: "Стабильный рост",
      probability: Math.round(balancedProbability),
      summary: "Текущая траектория даёт устойчивый и предсказуемый прогресс."
    },
    {
      id: "growth",
      title: "Рывок в развитии",
      probability: Math.round(growthProbability),
      summary: "Фокус на навыках и контактах может ускорить рост."
    },
    {
      id: "reset",
      title: "Пауза и переоценка",
      probability: Math.round(resetProbability),
      summary: "Есть риск перегрузки — полезно пересобрать привычки и приоритеты."
    }
  ].sort((a, b) => b.probability - a.probability);
}

export default function App() {
  const [state, setState] = useState<UserSnapshot>(initialState);
  const scenarios = useMemo(() => buildScenarios(state, trends), [state]);

  const update = (key: keyof UserSnapshot, value: string) => {
    const numeric = Number(value.replace(",", "."));
    setState((prev) => ({ ...prev, [key]: Number.isFinite(numeric) ? numeric : 0 }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Future Path</Text>
        <Text style={styles.subtitle}>Простой прогноз будущих сценариев на основе ваших действий.</Text>

        {([
          ["income", "Доход в месяц"],
          ["expenses", "Расходы в месяц"],
          ["activityHoursPerWeek", "Активность (часов/неделя)"],
          ["sleepHoursPerDay", "Сон (часов/день)"],
          ["nutritionScore", "Питание (0-10)"],
          ["newConnectionsPerMonth", "Новые знакомства/месяц"]
        ] as [keyof UserSnapshot, string][]).map(([key, label]) => (
          <View key={key} style={styles.fieldWrap}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
              keyboardType="decimal-pad"
              value={String(state[key])}
              onChangeText={(text) => update(key, text)}
              style={styles.input}
            />
          </View>
        ))}

        <Text style={styles.sectionTitle}>Вероятные сценарии</Text>
        {scenarios.map((scenario) => (
          <View key={scenario.id} style={styles.card}>
            <Text style={styles.cardTitle}>{scenario.title}</Text>
            <Text style={styles.probability}>Вероятность: {scenario.probability}%</Text>
            <Text style={styles.summary}>{scenario.summary}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F7FB" },
  container: { padding: 16, gap: 12 },
  title: { fontSize: 28, fontWeight: "700", color: "#111827" },
  subtitle: { fontSize: 14, color: "#374151", marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginTop: 12, color: "#111827" },
  fieldWrap: { gap: 6 },
  label: { fontSize: 13, color: "#4B5563" },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 4
  },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#111827" },
  probability: { fontSize: 14, color: "#2563EB", fontWeight: "600" },
  summary: { fontSize: 14, color: "#374151" }
});
