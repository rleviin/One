import React, { useEffect, useMemo, useState } from "react";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import type { DailyCheckInData } from "../storage";
import { loadDailyCheckIn } from "../storage";

type ForecastLevel = "stable" | "watch" | "risk";

function getForecastLevel(checkIn: DailyCheckInData | null): ForecastLevel {
  if (!checkIn) return "watch";

  const pressureScore =
    checkIn.stress * 1.2 +
    checkIn.workload * 1.1 +
    checkIn.spendingPressure * 0.8 -
    checkIn.energy * 0.9;

  if (pressureScore >= 14) return "risk";
  if (pressureScore >= 8) return "watch";
  return "stable";
}

function getForecastCopy(level: ForecastLevel) {
  if (level === "risk") {
    return {
      badge: "Rising risk",
      title: "If nothing changes, fatigue risk may rise in 3–5 days.",
      text: "Your current pressure pattern suggests that recovery may not fully compensate for load.",
      accent: "#FF647C",
      icon: "warning-outline" as const,
    };
  }

  if (level === "watch") {
    return {
      badge: "Watch zone",
      title: "Your balance may become unstable if pressure keeps building.",
      text: "Dara sees a pattern that is not urgent yet, but worth adjusting today.",
      accent: "#FF8A4C",
      icon: "pulse-outline" as const,
    };
  }

  return {
    badge: "Stable",
    title: "Your current pattern looks stable for the next few days.",
    text: "Keep protecting sleep, recovery and daily rhythm to maintain this trend.",
    accent: "#4ADE80",
    icon: "checkmark-circle-outline" as const,
  };
}

export default function ForecastTab() {
  const [checkIn, setCheckIn] = useState<DailyCheckInData | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      const data = await loadDailyCheckIn();

      if (mounted) {
        setCheckIn(data);
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const level = getForecastLevel(checkIn);
  const forecast = getForecastCopy(level);

  const whyPoints = useMemo(() => {
    if (!checkIn) {
      return [
        "No daily check-in saved yet.",
        "Dara is using a default baseline until you add today’s context.",
        "Check in from Home to make this forecast more personal.",
      ];
    }

    return [
      `Energy is ${checkIn.energy}/10.`,
      `Stress is ${checkIn.stress}/10.`,
      `Workload is ${checkIn.workload}/10.`,
      `Money pressure is ${checkIn.spendingPressure}/10.`,
      checkIn.note
        ? `Today context: ${checkIn.note}`
        : "No additional note added today.",
    ];
  }, [checkIn]);

  const changePoints =
    level === "risk"
      ? [
          "Reduce one non-critical task today.",
          "Protect sleep tonight as the highest-leverage action.",
          "Avoid major spending or commitment decisions today.",
        ]
      : level === "watch"
      ? [
          "Keep workload contained.",
          "Add one recovery action today.",
          "Use tomorrow’s check-in to confirm whether pressure is rising.",
        ]
      : [
          "Keep your current rhythm stable.",
          "Do not add unnecessary load.",
          "Maintain sleep and recovery consistency.",
        ];

  const timeline = [
    {
      day: "Today",
      title: checkIn ? "Pressure pattern detected" : "Baseline forecast",
      text: checkIn
        ? "Dara combines today’s check-in with your current signal model."
        : "Add a check-in to personalize the forecast.",
    },
    {
      day: "2–3 days",
      title: level === "stable" ? "Stable if rhythm holds" : "Balance may shift",
      text:
        level === "stable"
          ? "Recovery should remain sufficient if sleep and load stay consistent."
          : "If stress and load remain high, recovery may start lagging.",
    },
    {
      day: "5–7 days",
      title:
        level === "risk"
          ? "Fatigue risk may become visible"
          : "Outcome depends on recovery",
      text:
        level === "risk"
          ? "Low recovery plus high pressure can turn into fatigue or lower focus."
          : "Small actions today can keep the pattern from worsening.",
    },
  ];

  return (
    <ImageBackground
      source={require("../../assets/onboarding-bg.png")}
      style={styles.background}
      imageStyle={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.eyebrow}>FORECAST</Text>
            <Text style={styles.title}>What may happen next</Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons name="time-outline" size={24} color="#FFFFFF" />
          </View>
        </View>

        <View style={styles.heroCard}>
          <LinearGradient
            colors={[
              `${forecast.accent}28`,
              "rgba(255,255,255,0.07)",
              "rgba(255,255,255,0.035)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
          />

          <View style={styles.heroTop}>
            <View
              style={[
                styles.heroIcon,
                {
                  borderColor: `${forecast.accent}77`,
                  backgroundColor: `${forecast.accent}18`,
                },
              ]}
            >
              <Ionicons name={forecast.icon} size={25} color={forecast.accent} />
            </View>

            <View
              style={[
                styles.badge,
                {
                  borderColor: `${forecast.accent}66`,
                  backgroundColor: `${forecast.accent}18`,
                },
              ]}
            >
              <Text style={[styles.badgeText, { color: forecast.accent }]}>
                {forecast.badge}
              </Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>{forecast.title}</Text>
          <Text style={styles.heroText}>{forecast.text}</Text>
        </View>

        <Text style={styles.sectionTitle}>Forecast timeline</Text>

        <View style={styles.timelineCard}>
          {timeline.map((item, index) => (
            <View key={item.day} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View
                  style={[
                    styles.timelineDot,
                    index === 0 && { backgroundColor: forecast.accent },
                  ]}
                />
                {index < timeline.length - 1 && <View style={styles.timelineLine} />}
              </View>

              <View style={styles.timelineContent}>
                <Text style={styles.timelineDay}>{item.day}</Text>
                <Text style={styles.timelineTitle}>{item.title}</Text>
                <Text style={styles.timelineText}>{item.text}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Why Dara thinks so</Text>

        <View style={styles.infoCard}>
          {whyPoints.map((point, index) => (
            <View key={index} style={styles.infoRow}>
              <View style={[styles.infoDot, { backgroundColor: forecast.accent }]} />
              <Text style={styles.infoText}>{point}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>What can change the outcome</Text>

        <View style={styles.actionCard}>
          {changePoints.map((point, index) => (
            <View key={index} style={styles.actionRow}>
              <View style={styles.actionNumber}>
                <Text style={styles.actionNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.actionText}>{point}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footerCard}>
          <Ionicons name="sparkles-outline" size={19} color="#B9C6FF" />
          <Text style={styles.footerText}>
            Forecasts are guidance, not certainty. Dara updates them as your
            signals and context change.
          </Text>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#050A14",
  },

  backgroundImage: {
    resizeMode: "cover",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(3, 7, 18, 0.54)",
  },

  content: {
    paddingTop: 22,
    paddingHorizontal: 20,
    paddingBottom: 140,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  eyebrow: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 3,
    marginBottom: 6,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 34,
    lineHeight: 39,
    fontWeight: "900",
    letterSpacing: -1.1,
    maxWidth: 280,
  },

  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },

  heroCard: {
    borderRadius: 32,
    padding: 22,
    minHeight: 250,
    backgroundColor: "rgba(8, 16, 38, 0.56)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    overflow: "hidden",
    marginBottom: 24,
  },

  cardGradient: {
    ...StyleSheet.absoluteFillObject,
  },

  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },

  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  badge: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },

  badgeText: {
    fontSize: 13,
    fontWeight: "900",
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900",
    letterSpacing: -0.8,
    marginBottom: 12,
  },

  heroText: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 16,
    lineHeight: 23,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.4,
    marginBottom: 12,
  },

  timelineCard: {
    borderRadius: 28,
    padding: 18,
    backgroundColor: "rgba(8, 16, 38, 0.54)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    marginBottom: 24,
  },

  timelineItem: {
    flexDirection: "row",
  },

  timelineLeft: {
    width: 24,
    alignItems: "center",
  },

  timelineDot: {
    width: 11,
    height: 11,
    borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.28)",
    marginTop: 5,
  },

  timelineLine: {
    width: 1,
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.14)",
    marginTop: 7,
    marginBottom: 7,
  },

  timelineContent: {
    flex: 1,
    paddingBottom: 18,
  },

  timelineDay: {
    color: "rgba(255,255,255,0.52)",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.6,
    textTransform: "uppercase",
    marginBottom: 4,
  },

  timelineTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 5,
  },

  timelineText: {
    color: "rgba(255,255,255,0.64)",
    fontSize: 14,
    lineHeight: 20,
  },

  infoCard: {
    borderRadius: 28,
    padding: 18,
    backgroundColor: "rgba(8, 16, 38, 0.54)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    marginBottom: 24,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },

  infoDot: {
    width: 7,
    height: 7,
    borderRadius: 99,
    marginTop: 8,
    marginRight: 10,
  },

  infoText: {
    flex: 1,
    color: "rgba(255,255,255,0.72)",
    fontSize: 15,
    lineHeight: 21,
  },

  actionCard: {
    borderRadius: 28,
    padding: 18,
    backgroundColor: "rgba(8, 16, 38, 0.54)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    marginBottom: 16,
  },

  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  actionNumber: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  actionNumberText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },

  actionText: {
    flex: 1,
    color: "rgba(255,255,255,0.74)",
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "700",
  },

  footerCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 22,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  footerText: {
    flex: 1,
    color: "rgba(255,255,255,0.62)",
    fontSize: 13,
    lineHeight: 18,
    marginLeft: 10,
  },
});
