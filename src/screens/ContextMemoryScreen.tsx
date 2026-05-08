import React, { useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import type { DailyContextEvent, DailyContextEventType } from "../storage";
import { useDaraData } from "../useDaraData";
import AnimatedPressable from "../components/AnimatedPressable";
import ScreenBackground from "../components/ScreenBackground";
import { lightTap } from "../haptics";

type ContextMemoryScreenProps = {
  dataVersion?: number;
  onDone: () => void;
};

type ContextFilter = "all" | DailyContextEventType;

const filters: { key: ContextFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "meal", label: "Meals" },
  { key: "note", label: "Notes" },
  { key: "event", label: "Events" },
];

function getDayKey(createdAt: string) {
  return createdAt.slice(0, 10);
}

function formatGroupTitle(dayKey: string) {
  const date = new Date(`${dayKey}T12:00:00`);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const todayKey = today.toISOString().slice(0, 10);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);

  if (dayKey === todayKey) {
    return "Today";
  }

  if (dayKey === yesterdayKey) {
    return "Yesterday";
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(createdAt: string) {
  return new Date(createdAt).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getEventMeta(type: DailyContextEventType) {
  if (type === "meal") {
    return {
      label: "MEAL SIGNAL",
      icon: "restaurant-outline" as const,
      color: "#FF8A4C",
    };
  }

  if (type === "event") {
    return {
      label: "DAY EVENT",
      icon: "calendar-outline" as const,
      color: "#7DA2FF",
    };
  }

  return {
    label: "NOTE",
    icon: "create-outline" as const,
    color: "#B9C6FF",
  };
}

function getEventText(event: DailyContextEvent) {
  if (event.type === "meal") {
    return (
      event.text ||
      "Meal photo added for future analysis. Dara will later connect meals with energy and recovery."
    );
  }

  return event.text || event.title;
}

export default function ContextMemoryScreen({
  dataVersion = 0,
  onDone,
}: ContextMemoryScreenProps) {
  const [activeFilter, setActiveFilter] = useState<ContextFilter>("all");
  const { data, isLoading, reload } = useDaraData(dataVersion);

  const filteredEvents = useMemo(() => {
    return data.dailyContextEvents.filter((event) => {
      if (activeFilter === "all") {
        return true;
      }

      return event.type === activeFilter;
    });
  }, [activeFilter, data.dailyContextEvents]);

  const groupedEvents = useMemo(() => {
    const groups = filteredEvents.reduce<Record<string, DailyContextEvent[]>>(
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

    return Object.entries(groups).sort(
      ([dayA], [dayB]) =>
        new Date(dayB).getTime() - new Date(dayA).getTime()
    );
  }, [filteredEvents]);

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

          <Text style={styles.heroTitle}>Context memory</Text>
          <Text style={styles.heroText}>
            Dara keeps your notes, meals and daily events as signals for future
            insights.
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{data.dailyContextEvents.length}</Text>
              <Text style={styles.statLabel}>saved</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statValue}>{filteredEvents.length}</Text>
              <Text style={styles.statLabel}>shown</Text>
            </View>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {filters.map((filter) => {
            const isActive = activeFilter === filter.key;

            return (
              <AnimatedPressable
                key={filter.key}
                contentStyle={[
                  styles.filterPill,
                  isActive && styles.filterPillActive,
                ]}
                pressedScale={0.96}
                onPress={() => {
                  lightTap();
                  setActiveFilter(filter.key);
                }}
              >
                <Text
                  style={[
                    styles.filterText,
                    isActive && styles.filterTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </AnimatedPressable>
            );
          })}
        </ScrollView>

        <Text style={styles.sectionTitle}>Saved context</Text>

        {groupedEvents.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="file-tray-outline" size={28} color="#B9C6FF" />
            <Text style={styles.emptyTitle}>No context yet</Text>
            <Text style={styles.emptyText}>
              Add notes, meals or events during the day. They will appear here
              as Dara’s memory grows.
            </Text>
          </View>
        ) : (
          groupedEvents.map(([dayKey, events]) => (
            <View key={dayKey} style={styles.dayGroup}>
              <Text style={styles.dayTitle}>{formatGroupTitle(dayKey)}</Text>

              {events.map((event) => {
                const meta = getEventMeta(event.type);

                return (
                  <View key={event.id} style={styles.eventCard}>
                    <View
                      style={[
                        styles.eventIcon,
                        {
                          borderColor: `${meta.color}66`,
                          backgroundColor: `${meta.color}18`,
                        },
                      ]}
                    >
                      <Ionicons name={meta.icon} size={22} color={meta.color} />
                    </View>

                    <View style={styles.eventTextBlock}>
                      <Text style={[styles.eventLabel, { color: meta.color }]}>
                        {meta.label} · {formatTime(event.createdAt)}
                      </Text>

                      <Text style={styles.eventTitle}>{event.title}</Text>
                      <Text style={styles.eventText}>{getEventText(event)}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ))
        )}

        <View style={styles.footerCard}>
          <Ionicons name="lock-open-outline" size={20} color="#4FE18B" />
          <Text style={styles.footerText}>
            Premium memory is ready for context calendar, deeper analysis and PDF
            reports later.
          </Text>
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
  filterRow: {
    gap: 10,
    paddingBottom: 10,
  },
  filterPill: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  filterPillActive: {
    backgroundColor: "rgba(255,255,255,0.92)",
  },
  filterText: {
    color: "rgba(255,255,255,0.70)",
    fontSize: 15,
    fontWeight: "900",
  },
  filterTextActive: {
    color: "#07101F",
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900",
    letterSpacing: -0.7,
    marginTop: 22,
    marginBottom: 14,
  },
  emptyCard: {
    borderRadius: 28,
    padding: 24,
    backgroundColor: "rgba(8,16,38,0.58)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    marginTop: 14,
  },
  emptyText: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 17,
    lineHeight: 25,
    fontWeight: "600",
    marginTop: 8,
  },
  dayGroup: {
    marginBottom: 22,
  },
  dayTitle: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 3,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  eventCard: {
    flexDirection: "row",
    gap: 16,
    borderRadius: 28,
    padding: 18,
    backgroundColor: "rgba(8,16,38,0.58)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    marginBottom: 12,
  },
  eventIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  eventTextBlock: {
    flex: 1,
  },
  eventLabel: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2.4,
    marginBottom: 7,
  },
  eventTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    lineHeight: 26,
    fontWeight: "900",
  },
  eventText: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 16,
    lineHeight: 23,
    fontWeight: "600",
    marginTop: 7,
  },
  footerCard: {
    flexDirection: "row",
    gap: 12,
    borderRadius: 24,
    padding: 18,
    backgroundColor: "rgba(79,225,139,0.10)",
    borderWidth: 1,
    borderColor: "rgba(79,225,139,0.22)",
  },
  footerText: {
    flex: 1,
    color: "rgba(255,255,255,0.66)",
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "700",
  },
});
