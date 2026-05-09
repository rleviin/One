import React, { useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import type { DailyContextEvent } from "../storage";
import { useDaraData } from "../useDaraData";
import AnimatedPressable from "../components/AnimatedPressable";
import ScreenBackground from "../components/ScreenBackground";
import { lightTap } from "../haptics";

type ContextMemoryScreenProps = {
  dataVersion?: number;
  onDone: () => void;
};

function getDayKey(date: Date | string) {
  const parsedDate = typeof date === "string" ? new Date(date) : date;
  return parsedDate.toISOString().slice(0, 10);
}

function formatDayLabel(dayKey: string) {
  const date = new Date(`${dayKey}T12:00:00`);
  const todayKey = getDayKey(new Date());

  if (dayKey === todayKey) {
    return "Today";
  }

  return date.toLocaleDateString("en-US", {
    weekday: "short",
  });
}

function formatFullDate(dayKey: string) {
  const date = new Date(`${dayKey}T12:00:00`);

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
}

function getLastSevenDays() {
  return Array.from({ length: 7 }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - index);
    return getDayKey(date);
  });
}

function getNutritionScore(events: DailyContextEvent[]) {
  const mealCount = events.filter((event) => event.type === "meal").length;

  if (mealCount >= 3) {
    return 82;
  }

  if (mealCount === 2) {
    return 68;
  }

  if (mealCount === 1) {
    return 52;
  }

  return 24;
}

function getContextScore(events: DailyContextEvent[]) {
  return Math.min(100, events.length * 18);
}

function getScoreTone(score: number) {
  if (score >= 75) {
    return "#4FE18B";
  }

  if (score >= 50) {
    return "#FF8A4C";
  }

  return "#FF647C";
}

function buildDaySummary(events: DailyContextEvent[]) {
  const mealCount = events.filter((event) => event.type === "meal").length;
  const noteCount = events.filter((event) => event.type === "note").length;
  const eventCount = events.filter((event) => event.type === "event").length;

  if (events.length === 0) {
    return "No context signals saved for this day yet.";
  }

  const parts: string[] = [];

  if (mealCount > 0) {
    parts.push(`${mealCount} meal signal${mealCount === 1 ? "" : "s"}`);
  }

  if (noteCount > 0) {
    parts.push(`${noteCount} note${noteCount === 1 ? "" : "s"}`);
  }

  if (eventCount > 0) {
    parts.push(`${eventCount} event${eventCount === 1 ? "" : "s"}`);
  }

  return `Dara compressed this day into ${parts.join(", ")}.`;
}

export default function ContextMemoryScreen({
  dataVersion = 0,
  onDone,
}: ContextMemoryScreenProps) {
  const { data, isLoading, reload } = useDaraData(dataVersion);
  const days = useMemo(() => getLastSevenDays(), []);
  const [selectedDayKey, setSelectedDayKey] = useState(days[0]);

  const eventsByDay = useMemo(() => {
    return data.dailyContextEvents.reduce<Record<string, DailyContextEvent[]>>(
      (acc, event) => {
        const dayKey = getDayKey(event.createdAt);

        if (!acc[dayKey]) {
          acc[dayKey] = [];
        }

        acc[dayKey].push(event);
        return acc;
      },
      {}
    );
  }, [data.dailyContextEvents]);

  const selectedEvents = eventsByDay[selectedDayKey] || [];
  const mealEvents = selectedEvents.filter((event) => event.type === "meal");
  const noteEvents = selectedEvents.filter((event) => event.type === "note");
  const dayEvents = selectedEvents.filter((event) => event.type === "event");

  const nutritionScore = getNutritionScore(selectedEvents);
  const contextScore = getContextScore(selectedEvents);
  const nutritionTone = getScoreTone(nutritionScore);
  const contextTone = getScoreTone(contextScore);

  return (
    <ScreenBackground source={require("../../assets/onboarding-bg.png")}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={reload}
            tintColor="#FFFFFF"
          />
        }
      >
        <View style={styles.topRow}>
          <AnimatedPressable
            style={styles.closeButtonWrap}
            contentStyle={styles.closeButton}
            pressedScale={0.94}
            onPress={() => {
              lightTap();
              onDone();
            }}
          >
            <Ionicons name="close-outline" size={34} color="#FFFFFF" />
          </AnimatedPressable>

          <Text style={styles.kicker}>DARA MEMORY</Text>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons name="sparkles-outline" size={34} color="#B9C6FF" />
          </View>

          <Text style={styles.heroTitle}>Context summary</Text>
          <Text style={styles.heroText}>
            Dara compresses meals, notes and events into daily signals instead
            of showing a long raw feed.
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{data.dailyContextEvents.length}</Text>
              <Text style={styles.statLabel}>signals</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statValue}>{selectedEvents.length}</Text>
              <Text style={styles.statLabel}>selected day</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Signal calendar</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.calendarRow}
        >
          {days.map((dayKey) => {
            const events = eventsByDay[dayKey] || [];
            const isActive = selectedDayKey === dayKey;
            const score = getContextScore(events);
            const tone = getScoreTone(score);

            return (
              <AnimatedPressable
                key={dayKey}
                contentStyle={[
                  styles.dayPill,
                  isActive && styles.dayPillActive,
                ]}
                pressedScale={0.96}
                onPress={() => {
                  lightTap();
                  setSelectedDayKey(dayKey);
                }}
              >
                <Text
                  style={[
                    styles.dayPillLabel,
                    isActive && styles.dayPillLabelActive,
                  ]}
                >
                  {formatDayLabel(dayKey)}
                </Text>

                <View
                  style={[
                    styles.daySignalDot,
                    {
                      backgroundColor:
                        events.length > 0 ? tone : "rgba(255,255,255,0.18)",
                    },
                  ]}
                />

                <Text
                  style={[
                    styles.dayPillCount,
                    isActive && styles.dayPillCountActive,
                  ]}
                >
                  {events.length}
                </Text>
              </AnimatedPressable>
            );
          })}
        </ScrollView>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryKicker}>{formatFullDate(selectedDayKey)}</Text>
          <Text style={styles.summaryTitle}>Daily compressed memory</Text>
          <Text style={styles.summaryText}>{buildDaySummary(selectedEvents)}</Text>

          <View style={styles.scoreGrid}>
            <View style={styles.scoreCard}>
              <View style={styles.scoreHeader}>
                <Ionicons name="restaurant-outline" size={20} color={nutritionTone} />
                <Text style={styles.scoreLabel}>Nutrition quality</Text>
              </View>

              <Text style={[styles.scoreValue, { color: nutritionTone }]}>
                {nutritionScore}
              </Text>

              <View style={styles.scoreTrack}>
                <View
                  style={[
                    styles.scoreFill,
                    {
                      width: `${nutritionScore}%`,
                      backgroundColor: nutritionTone,
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.scoreCard}>
              <View style={styles.scoreHeader}>
                <Ionicons name="pulse-outline" size={20} color={contextTone} />
                <Text style={styles.scoreLabel}>Context density</Text>
              </View>

              <Text style={[styles.scoreValue, { color: contextTone }]}>
                {contextScore}
              </Text>

              <View style={styles.scoreTrack}>
                <View
                  style={[
                    styles.scoreFill,
                    {
                      width: `${contextScore}%`,
                      backgroundColor: contextTone,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Signal breakdown</Text>

        <View style={styles.compactGrid}>
          <View style={styles.compactCard}>
            <Ionicons name="restaurant-outline" size={22} color="#FF8A4C" />
            <Text style={styles.compactValue}>{mealEvents.length}</Text>
            <Text style={styles.compactLabel}>Meal signals</Text>
            <Text style={styles.compactText}>
              {mealEvents.length > 0
                ? "Meal photo input saved for future nutrition analysis."
                : "No meal signal saved for this day."}
            </Text>
          </View>

          <View style={styles.compactCard}>
            <Ionicons name="create-outline" size={22} color="#B9C6FF" />
            <Text style={styles.compactValue}>{noteEvents.length}</Text>
            <Text style={styles.compactLabel}>Notes</Text>
            <Text style={styles.compactText}>
              {noteEvents.length > 0
                ? "Notes compressed into context memory."
                : "No notes saved for this day."}
            </Text>
          </View>

          <View style={styles.compactCard}>
            <Ionicons name="calendar-outline" size={22} color="#7DA2FF" />
            <Text style={styles.compactValue}>{dayEvents.length}</Text>
            <Text style={styles.compactLabel}>Events</Text>
            <Text style={styles.compactText}>
              {dayEvents.length > 0
                ? "Events saved as daily pressure signals."
                : "No events saved for this day."}
            </Text>
          </View>
        </View>

        <View style={styles.reportCard}>
          <Ionicons name="document-text-outline" size={22} color="#4FE18B" />
          <View style={styles.reportTextBlock}>
            <Text style={styles.reportTitle}>PDF summary coming next</Text>
            <Text style={styles.reportText}>
              Later Dara will export weekly or monthly context reports with
              nutrition quality, key events and compressed recommendations.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 18,
    paddingTop: 54,
    paddingBottom: 42,
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 28,
  },
  closeButtonWrap: {
    width: 58,
    height: 58,
  },
  closeButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  kicker: {
    flex: 1,
    marginRight: 58,
    textAlign: "center",
    color: "rgba(255,255,255,0.70)",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 8,
  },
  heroCard: {
    borderRadius: 34,
    padding: 28,
    backgroundColor: "rgba(8,16,38,0.58)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    marginBottom: 20,
  },
  heroIcon: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(185,198,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(185,198,255,0.35)",
    marginBottom: 28,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 42,
    lineHeight: 46,
    fontWeight: "900",
    letterSpacing: -1.2,
  },
  heroText: {
    color: "rgba(255,255,255,0.64)",
    fontSize: 20,
    lineHeight: 30,
    marginTop: 16,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  statBox: {
    flex: 1,
    borderRadius: 22,
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
  },
  statLabel: {
    color: "rgba(255,255,255,0.56)",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 2,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900",
    letterSpacing: -0.7,
    marginTop: 18,
    marginBottom: 14,
  },
  calendarRow: {
    gap: 10,
    paddingBottom: 12,
  },
  dayPill: {
    width: 76,
    minHeight: 96,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(8,16,38,0.54)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  dayPillActive: {
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  dayPillLabel: {
    color: "rgba(255,255,255,0.66)",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 10,
  },
  dayPillLabelActive: {
    color: "#07101F",
  },
  daySignalDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginBottom: 9,
  },
  dayPillCount: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
  dayPillCountActive: {
    color: "#07101F",
  },
  summaryCard: {
    borderRadius: 32,
    padding: 22,
    backgroundColor: "rgba(8,16,38,0.58)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    marginTop: 6,
  },
  summaryKicker: {
    color: "#B9C6FF",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2.4,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  summaryTitle: {
    color: "#FFFFFF",
    fontSize: 27,
    lineHeight: 32,
    fontWeight: "900",
    letterSpacing: -0.7,
  },
  summaryText: {
    color: "rgba(255,255,255,0.64)",
    fontSize: 17,
    lineHeight: 25,
    fontWeight: "600",
    marginTop: 10,
  },
  scoreGrid: {
    gap: 12,
    marginTop: 18,
  },
  scoreCard: {
    borderRadius: 24,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  scoreHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  scoreLabel: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 14,
    fontWeight: "900",
  },
  scoreValue: {
    fontSize: 34,
    fontWeight: "900",
    marginTop: 8,
  },
  scoreTrack: {
    height: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
    overflow: "hidden",
    marginTop: 10,
  },
  scoreFill: {
    height: 7,
    borderRadius: 999,
  },
  compactGrid: {
    gap: 12,
  },
  compactCard: {
    borderRadius: 28,
    padding: 18,
    backgroundColor: "rgba(8,16,38,0.58)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  compactValue: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
    marginTop: 12,
  },
  compactLabel: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 2,
  },
  compactText: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600",
    marginTop: 8,
  },
  reportCard: {
    flexDirection: "row",
    gap: 12,
    borderRadius: 24,
    padding: 18,
    backgroundColor: "rgba(79,225,139,0.10)",
    borderWidth: 1,
    borderColor: "rgba(79,225,139,0.22)",
    marginTop: 18,
  },
  reportTextBlock: {
    flex: 1,
  },
  reportTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 4,
  },
  reportText: {
    color: "rgba(255,255,255,0.66)",
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "700",
  },
});
