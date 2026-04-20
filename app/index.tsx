import React, { useMemo, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

type Snapshot = {
  income: number;
  expenses: number;
  activityHoursPerWeek: number;
  sleepHoursPerDay: number;
  nutritionScore: number;
  newConnectionsPerMonth: number;
};

type Scenario = {
  id: string;
  title: string;
  probability: number;
  summary: string;
};

const initialState: Snapshot = {
  income: 3000,
  expenses: 2200,
  activityHoursPerWeek: 4,
  sleepHoursPerDay: 7,
  nutritionScore: 6,
  newConnectionsPerMonth: 3
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const norm = (v: number, max: number) => clamp(v / max, 0, 1);

function buildScenarios(s: Snapshot): Scenario[] {
  const savingsRate = s.income > 0 ? (s.income - s.expenses) / s.income : 0;

  const finances = clamp(savingsRate * 100, 0, 100);
  const energy = clamp(
    norm(s.activityHoursPerWeek, 10) * 40 +
      norm(s.sleepHoursPerDay, 8) * 40 +
      norm(s.nutritionScore, 10) * 20,
    0,
    100
  );
  const social = clamp(norm(s.newConnectionsPerMonth, 8) * 100, 0, 100);

  const balanced = clamp((finances + energy + social) / 3, 0, 100);
  const growth = clamp((finances * 0.45 + social * 0.55), 0, 100);
  const reset = clamp(100 - balanced * 0.8, 0, 100);

  return [
    {
      id: "balanced",
      title: "Стабильный рост",
      probability: Math.round(balanced),
      summary: "Текущая траектория даёт устойчивый и предсказуемый прогресс."
    },
    {
      id: "growth",
      title: "Рывок в развитии",
      probability: Math.round(growth),
      summary: "Фокус на навыках и новых связях может ускорить результаты."
    },
    {
      id: "reset",
      title: "Пауза и переоценка",
      probability: Math.round(reset),
      summary: "Если ритм сохранится, есть риск перегрузки — полезно пересобрать режим."
    }
  ].sort((a, b) => b.probability - a.probability);
}

export default function HomeScreen() {
  const [state, setState] = useState<Snapshot>(initialState);
  const scenarios = useMemo(() => buildScenarios(state), [state]);

  const update = (key: keyof Snapshot, value: string) => {
    const n = Number(value.replace(",", "."));
    setState((prev) => ({ ...prev, [key]: Number.isFinite(n) ? n : 0 }));
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
        ] as [keyof Snapshot, string][]).map(([key, label]) => (
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
        {scenarios.map((sc) => (
          <View key={sc.id} style={styles.card}>
            <Text style={styles.cardTitle}>{sc.title}</Text>
            <Text style={styles.probability}>Вероятность: {sc.probability}%</Text>
            <Text style={styles.summary}>{sc.summary}</Text>
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
