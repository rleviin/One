import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import ScreenBackground from "../components/ScreenBackground";

import { useDaraData } from "../useDaraData";
import { buildDaraBrain } from "../lib/dara-brain";

type ForecastTabProps = {
  dataVersion?: number;
};


export default function ForecastTab({ dataVersion = 0 }: ForecastTabProps) {
  const { data, isLoading, reload } = useDaraData(dataVersion);
  const daraBrain = useMemo(() => buildDaraBrain(data), [data]);
  const forecastView = daraBrain.forecastView;
  const forecastHero = forecastView.hero;

  const whyPoints = forecastView.reasons;
  const changePoints = forecastView.actions;
  const timeline = forecastView.timeline;

return (
  <ScreenBackground>
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
              `${forecastHero.accent}28`,
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
                  borderColor: `${forecastHero.accent}77`,
                  backgroundColor: `${forecastHero.accent}18`,
                },
              ]}
            >
              <Ionicons name={forecastHero.icon} size={25} color={forecastHero.accent} />
            </View>

            <View
              style={[
                styles.badge,
                {
                  borderColor: `${forecastHero.accent}66`,
                  backgroundColor: `${forecastHero.accent}18`,
                },
              ]}
            >
              <Text style={[styles.badgeText, { color: forecastHero.accent }]}>
                {forecastHero.badge}
              </Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>{forecastHero.title}</Text>
          <Text style={styles.heroText}>{forecastHero.summary}</Text>

          <Text style={styles.confidenceText}>
            Confidence {forecastHero.confidence}% · Risk {forecastHero.risk}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Forecast timeline</Text>

        <View style={styles.timelineCard}>
          {timeline.map((item, index) => (
            <View key={item.day} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View
                  style={[
                    styles.timelineDot,
                    index === 0 && { backgroundColor: forecastHero.accent },
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
              <View style={[styles.infoDot, { backgroundColor: forecastHero.accent }]} />
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
     </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  
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

  confidenceText: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginTop: 16,
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
