import React, { useEffect, useMemo, useState } from "react";
import {
  ImageBackground,
  Modal,
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
import type { DaraInsight } from "../daraModel";
import { buildInsights } from "../daraModel";

type InsightsTabProps = {
  dataVersion?: number;
};

export default function InsightsTab({ dataVersion = 0 }: InsightsTabProps) {
  const [checkIn, setCheckIn] = useState<DailyCheckInData | null>(null);
  const [selectedInsight, setSelectedInsight] = useState<DaraInsight | null>(null);

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
  }, [dataVersion]);

  const insights = useMemo(() => buildInsights(checkIn), [checkIn]);

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
            <Text style={styles.eyebrow}>INSIGHTS</Text>
            <Text style={styles.title}>Patterns Dara is noticing</Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons name="analytics-outline" size={24} color="#FFFFFF" />
          </View>
        </View>

        <View style={styles.heroCard}>
          <LinearGradient
            colors={[
              "rgba(201,107,255,0.22)",
              "rgba(88,231,255,0.08)",
              "rgba(255,255,255,0.04)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
          />

          <View style={styles.heroIcon}>
            <Ionicons name="git-network-outline" size={25} color="#B9C6FF" />
          </View>

          <Text style={styles.heroTitle}>
            Dara connects repeated signals into patterns.
          </Text>

          <Text style={styles.heroText}>
            Insights explain why your body, work, money and daily context may be
            moving together.
          </Text>
        </View>

        {checkIn && (
          <View style={styles.checkInCard}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#58E7FF" />
            <Text style={styles.checkInText}>
              Latest check-in · Energy {checkIn.energy}/10 · Stress{" "}
              {checkIn.stress}/10 · Workload {checkIn.workload}/10
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Current insights</Text>

        <View style={styles.insightList}>
          {insights.map((insight) => (
            <Pressable
              key={insight.id}
              style={styles.insightCard}
              onPress={() => setSelectedInsight(insight)}
            >
              <LinearGradient
                colors={[
                  `${insight.accent}22`,
                  "rgba(255,255,255,0.055)",
                  "rgba(255,255,255,0.035)",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}
              />

              <View
                style={[
                  styles.insightIcon,
                  {
                    borderColor: `${insight.accent}77`,
                    backgroundColor: `${insight.accent}18`,
                  },
                ]}
              >
                <Ionicons name={insight.icon} size={23} color={insight.accent} />
              </View>

              <View style={styles.insightTextBlock}>
                <Text style={[styles.insightLabel, { color: insight.accent }]}>
                  {insight.label}
                </Text>
                <Text style={styles.insightTitle}>{insight.title}</Text>
                <Text style={styles.insightText}>{insight.text}</Text>
              </View>

              <View style={styles.arrowCircle}>
                <Ionicons
                  name="chevron-forward"
                  size={21}
                  color="rgba(255,255,255,0.8)"
                />
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.footerCard}>
          <Ionicons name="time-outline" size={19} color="#B9C6FF" />
          <Text style={styles.footerText}>
            Insights improve as Dara sees more history. For now, they use your
            latest check-in and saved context.
          </Text>
        </View>
      </ScrollView>

      <Modal
        visible={selectedInsight !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedInsight(null)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setSelectedInsight(null)}
        />

        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />

          {selectedInsight && (
            <>
              <View
                style={[
                  styles.sheetIcon,
                  {
                    borderColor: `${selectedInsight.accent}77`,
                    backgroundColor: `${selectedInsight.accent}18`,
                  },
                ]}
              >
                <Ionicons
                  name={selectedInsight.icon}
                  size={25}
                  color={selectedInsight.accent}
                />
              </View>

              <Text style={styles.sheetTitle}>{selectedInsight.title}</Text>
              <Text style={styles.sheetSubtitle}>{selectedInsight.text}</Text>

              <View style={styles.sheetPoints}>
                {selectedInsight.points.map((point, index) => (
                  <View key={index} style={styles.sheetPoint}>
                    <View
                      style={[
                        styles.sheetPointDot,
                        { backgroundColor: selectedInsight.accent },
                      ]}
                    />
                    <Text style={styles.sheetPointText}>{point}</Text>
                  </View>
                ))}
              </View>

              <Pressable
                style={styles.sheetButton}
                onPress={() => setSelectedInsight(null)}
              >
                <Text style={styles.sheetButtonText}>Got it</Text>
              </Pressable>
            </>
          )}
        </View>
      </Modal>
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
    maxWidth: 285,
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
    minHeight: 230,
    backgroundColor: "rgba(8, 16, 38, 0.56)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    overflow: "hidden",
    marginBottom: 14,
  },

  cardGradient: {
    ...StyleSheet.absoluteFillObject,
  },

  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "rgba(185,198,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(185,198,255,0.30)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 29,
    lineHeight: 35,
    fontWeight: "900",
    letterSpacing: -0.8,
    marginBottom: 10,
  },

  heroText: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 16,
    lineHeight: 23,
  },

  checkInCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 22,
    padding: 12,
    backgroundColor: "rgba(88,231,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(88,231,255,0.18)",
    marginBottom: 24,
  },

  checkInText: {
    flex: 1,
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    marginLeft: 10,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.4,
    marginBottom: 12,
  },

  insightList: {
    gap: 12,
    marginBottom: 18,
  },

  insightCard: {
    minHeight: 128,
    borderRadius: 28,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(8, 16, 38, 0.56)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    overflow: "hidden",
  },

  insightIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  insightTextBlock: {
    flex: 1,
  },

  insightLabel: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 5,
  },

  insightTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "900",
    marginBottom: 5,
  },

  insightText: {
    color: "rgba(255,255,255,0.64)",
    fontSize: 14,
    lineHeight: 19,
  },

  arrowCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
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

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.48)",
  },

  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 34,
    backgroundColor: "rgba(8, 16, 38, 0.97)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },

  sheetHandle: {
    alignSelf: "center",
    width: 44,
    height: 5,
    borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.24)",
    marginBottom: 20,
  },

  sheetIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  sheetTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900",
    letterSpacing: -0.8,
    marginBottom: 8,
  },

  sheetSubtitle: {
    color: "rgba(255,255,255,0.66)",
    fontSize: 16,
    lineHeight: 23,
    marginBottom: 18,
  },

  sheetPoints: {
    gap: 12,
    marginBottom: 22,
  },

  sheetPoint: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  sheetPointDot: {
    width: 7,
    height: 7,
    borderRadius: 99,
    marginTop: 8,
    marginRight: 10,
  },

  sheetPointText: {
    flex: 1,
    color: "rgba(255,255,255,0.76)",
    fontSize: 15,
    lineHeight: 22,
  },

  sheetButton: {
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  sheetButtonText: {
    color: "#07101F",
    fontSize: 17,
    fontWeight: "900",
  },
});
