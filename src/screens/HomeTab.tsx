import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Animated,
  Modal,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import type { HomeData, RiskLevel, UserSignals } from "../types";
import {
  calculateRisk,
  getFinanceRecommendation,
  getRecoveryRecommendation,
  getSleepRecommendation,
  getWorkloadRecommendation,
} from "../logic";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const IS_COMPACT_HOME = SCREEN_HEIGHT < 760;
const HOME_CARD_WIDTH = SCREEN_WIDTH - 88;

export default function HomeTab() {
  const [signals, setSignals] = useState<UserSignals>({
  sleepHours: 6.2,
  workload: 7,
  recovery: 4,
  spendingPressure: 6,
});

const heroFade = useRef(new Animated.Value(1)).current;

function updateSignals(nextSignals: UserSignals) {
  Animated.timing(heroFade, {
    toValue: 0.35,
    duration: 140,
    useNativeDriver: true,
  }).start(() => {
    setSignals(nextSignals);

    Animated.timing(heroFade, {
      toValue: 1,
      duration: 260,
      useNativeDriver: true,
    }).start();
  });
}

const risk = calculateRisk(signals);
const riskColor =
  risk === "high"
    ? "#FF6B6B"
    : risk === "medium"
    ? "#FFD166"
    : "#4ADE80";
const fade = useRef(new Animated.Value(1)).current;

useEffect(() => {
  fade.setValue(0.6);

  Animated.timing(fade, {
    toValue: 1,
    duration: 250,
    useNativeDriver: true,
  }).start();
}, [risk, fade]);
  const data = useMemo<HomeData & { consequence: string[] }>(() => {
    if (risk === "low") {
      return {
        hero: "Your system is stable",
        sub: "You are within safe limits. Keep the rhythm.",
        why: [
          "Sleep consistency is stable",
          "Workload is under control",
          "Recovery is sufficient",
        ],
        context: "No major external pressure signals detected right now.",
        actions: [
          "Keep your current routine",
          "Protect recovery time",
          "Avoid unnecessary overload",
        ],
        consequence: [
          "Low risk of fatigue",
          "Stable focus window",
          "Good recovery capacity",
        ],
      };
    }

    if (risk === "high") {
      return {
        hero: "You are moving toward overload",
        sub: "If nothing changes, fatigue is not a possibility — it is the likely outcome.",
        why: [
          "Sleep quality dropped",
          "Workload increased beyond recovery",
          "Stress signals are accumulating",
        ],
        context:
          "External pressure is rising: workload instability, inflation, and financial stress can amplify the risk.",
        actions: [
          "Stop non-essential tasks today",
          "Reduce cognitive load immediately",
          "Prioritize recovery over output",
        ],
        consequence: [
          "Performance drop",
          "Mood instability",
          "Higher burnout probability",
        ],
      };
    }

    return {
      hero: "You are approaching fatigue",
      sub: "A small correction now prevents a bigger problem later.",
      why: [
        "Sleep slightly decreased",
        "Workload is trending upward",
        "Recovery is not fully compensating",
      ],
      context:
        "Financial and workload pressure are rising. This can reduce mental bandwidth if ignored.",
      actions: [
        "Reduce load today",
        "Increase hydration and rest",
        "Add one recovery activity",
      ],
      consequence: [
        "Fatigue accumulation",
        "Lower focus in 5–7 days",
        "Reduced decision quality",
      ],
    };
  }, [risk]);
const [detailsVisible, setDetailsVisible] = useState(false);

const heroTitle =
  risk === "high"
    ? "You are moving toward overload"
    : risk === "medium"
    ? "Your balance is starting to slip"
    : "You are in a stable zone";

const heroSubtitle =
  risk === "high"
    ? "If nothing changes, fatigue is not a possibility — it is the likely outcome."
    : risk === "medium"
    ? "Signals are becoming less balanced. Small adjustments now can prevent overload."
    : "Your current pattern looks stable. Keep protecting sleep and recovery.";

const metricCards = [
  {
    key: "sleep",
    label: "Sleep",
    value: `${signals.sleepHours.toFixed(1)}h`,
    note: "Last night",
    recommendation: getSleepRecommendation(signals.sleepHours),
  },
  {
    key: "workload",
    label: "Workload",
    value: `${signals.workload}/10`,
    note: "Current load",
    recommendation: getWorkloadRecommendation(signals.workload),
  },
  {
    key: "recovery",
    label: "Recovery",
    value: `${signals.recovery}/10`,
    note: "Recovery state",
    recommendation: getRecoveryRecommendation(signals.recovery),
  },
  {
    key: "finance",
    label: "Finance",
    value: `${signals.spendingPressure}/10`,
    note: "External pressure",
    recommendation: getFinanceRecommendation(signals.spendingPressure),
  },
];

return (
  <>
      <ScrollView
      contentContainerStyle={styles.homeModernContent}
      showsVerticalScrollIndicator={false}
    >
<Animated.View style={{ opacity: heroFade }}>
  <Pressable
    style={styles.alertCard}
    onPress={() => setDetailsVisible(true)}
  >
    <View style={styles.alertTopRow}>
      <Text style={styles.alertLabel}>Active signal</Text>
      <View
        style={[
          styles.riskBadge,
          risk === "high"
            ? styles.riskBadgeHigh
            : risk === "medium"
            ? styles.riskBadgeMedium
            : styles.riskBadgeLow,
        ]}
      >
        <Text style={styles.riskBadgeText}>
          {risk === "high" ? "High risk" : risk === "medium" ? "Medium" : "Stable"}
        </Text>
      </View>
    </View>

<Text
  style={[
    styles.alertTitle,
    heroTitle.length > 34 && styles.alertTitleSmall,
  ]}
  numberOfLines={2}
>
  {heroTitle}
</Text>

<Text
  style={styles.alertText}
  numberOfLines={2}
>
  {heroSubtitle}
</Text>

    <Text style={styles.alertAction}>Tap to open details</Text>
  </Pressable>
</Animated.View>

      <View style={styles.sectionRow}>
        <Text style={styles.homeSectionTitle}>Signals</Text>
        <Text style={styles.sectionMuted}>Swipe</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={HOME_CARD_WIDTH + 14}
        decelerationRate="fast"
        snapToAlignment="start"
        style={styles.metricCarouselScroll}
        contentContainerStyle={styles.metricCarouselContent}      
      >
        {metricCards.map((card) => (
          <View
            key={card.key}
            style={[
              styles.metricHeroCard,
              styles[`metricHeroCard_${card.key}`],
              { width: HOME_CARD_WIDTH },
            ]}
          >
<LinearGradient
  colors={
    card.key === "sleep"
      ? ["rgba(92,130,255,0.34)", "rgba(92,130,255,0.08)", "rgba(92,130,255,0.00)"]
      : card.key === "workload"
      ? ["rgba(255,120,70,0.34)", "rgba(255,120,70,0.08)", "rgba(255,120,70,0.00)"]
      : card.key === "recovery"
      ? ["rgba(190,105,255,0.34)", "rgba(190,105,255,0.08)", "rgba(190,105,255,0.00)"]
      : ["rgba(92,220,255,0.32)", "rgba(92,220,255,0.08)", "rgba(92,220,255,0.00)"]
  }
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
  style={styles.cardGradient}
/>
<View>
  <Text style={styles.metricHeroLabel}>{card.label}</Text>
  <Text style={styles.metricHeroValue}>{card.value}</Text>
</View>

<View>
  <Text style={styles.metricHeroNote}>{card.note}</Text>
  <Text style={styles.metricHeroRecommendation}>
    {card.recommendation}
  </Text>
</View>
          </View>
        ))}
      </ScrollView>

<View style={[styles.sectionRow, styles.actionsSectionRow]}>
  <Text style={styles.homeSectionTitle}>Actions</Text>
</View>
<View style={styles.actionGrid}>
  <Pressable
    style={[styles.actionCard, styles.actionCardLarge, styles.actionRecovery]}
    onPress={() =>
      updateSignals({
        ...signals,
        recovery: Math.min(signals.recovery + 2, 10),
        workload: Math.max(signals.workload - 1, 0),
      })
    }
  >
    <LinearGradient
      colors={[
        "rgba(190,105,255,0.34)",
        "rgba(190,105,255,0.10)",
        "rgba(190,105,255,0.00)",
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.cardGradient}
    />

    <View style={styles.actionIcon}>
      <Ionicons name="leaf-outline" size={20} color="#FFFFFF" />
    </View>

    <View>
      <Text style={styles.actionCardTitle}>Recovery</Text>
      <Text style={styles.actionCardText}>
        Boost recovery and lower load.
      </Text>
    </View>

    <View style={styles.actionArrow}>
      <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
    </View>
  </Pressable>

        <View style={styles.actionCardStack}>
<Pressable
  style={[styles.actionCard, styles.actionCardSmall, styles.actionFinance]}
  onPress={() =>
    updateSignals({
      ...signals,
      spendingPressure: Math.max(signals.spendingPressure - 1, 0),
    })
  }
>
  <LinearGradient
    colors={[
      "rgba(92,220,255,0.30)",
      "rgba(92,220,255,0.08)",
      "rgba(92,220,255,0.00)",
    ]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.cardGradient}
  />

  <View style={styles.actionIconSmall}>
    <Ionicons name="cash-outline" size={17} color="#FFFFFF" />
  </View>

  <View>
    <Text style={styles.actionCardTitle}>Finance</Text>
    <Text style={styles.actionCardText}>
      Reduce external pressure.
    </Text>
  </View>

  <View style={styles.actionArrowSmall}>
    <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
  </View>
</Pressable>

<Pressable
  style={[styles.actionCard, styles.actionCardSmall, styles.actionReset]}
  onPress={() =>
    updateSignals({
      sleepHours: 7,
      workload: 5,
      recovery: 6,
      spendingPressure: 5,
    })
  }
>
  <LinearGradient
    colors={[
      "rgba(255,120,70,0.32)",
      "rgba(255,120,70,0.08)",
      "rgba(255,120,70,0.00)",
    ]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.cardGradient}
  />

  <View style={styles.actionIconSmall}>
    <Ionicons name="refresh-outline" size={17} color="#FFFFFF" />
  </View>

  <View>
    <Text style={styles.actionCardTitle}>Reset</Text>
    <Text style={styles.actionCardText}>
      Return to baseline.
    </Text>
  </View>

  <View style={styles.actionArrowSmall}>
    <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
  </View>
</Pressable>

        </View>
      </View>
    </ScrollView>

    <Modal
      visible={detailsVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setDetailsVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setDetailsVisible(false)}
        />

        <View style={styles.sheetCard}>
          <View style={styles.sheetHandle} />

          <Text style={styles.sheetTitle}>Why Dara thinks so</Text>

          <Text style={styles.sheetSectionTitle}>Why</Text>
          <View style={styles.sheetInfoCard}>
            {data.why.map((item, index) => (
              <Text key={index} style={styles.sheetInfoText}>
                • {item}
              </Text>
            ))}
          </View>

          <Text style={styles.sheetSectionTitle}>If ignored</Text>
          <View style={styles.sheetInfoCard}>
            {data.consequence.map((item, index) => (
              <Text key={index} style={styles.sheetInfoText}>
                → {item}
              </Text>
            ))}
          </View>

          <Text style={styles.sheetSectionTitle}>External context</Text>
          <View style={styles.sheetInfoCard}>
            <Text style={styles.sheetInfoText}>{data.context}</Text>
          </View>

          <Text style={styles.sheetSectionTitle}>Do today</Text>
          <View style={styles.sheetInfoCard}>
            {data.actions.map((item, index) => (
              <Text key={index} style={styles.sheetInfoText}>
                • {item}
              </Text>
            ))}
          </View>

          <Pressable
            style={styles.sheetCloseBtn}
            onPress={() => setDetailsVisible(false)}
          >
            <Text style={styles.sheetCloseText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  </>
);
}

const styles = StyleSheet.create({
homeModernContent: {
  paddingTop: 10,
  paddingHorizontal: 20,
  paddingBottom: 130,
},

alertCard: {
  minHeight: 158,
  backgroundColor: "rgba(255,255,255,0.06)",
  borderRadius: 26,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.10)",
  padding: IS_COMPACT_HOME ? 14 : 16,
  marginBottom: IS_COMPACT_HOME ? 10 : 14,
},

alertTopRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 8,
},

alertLabel: {
  color: "rgba(255,255,255,0.55)",
  fontSize: 13,
  fontWeight: "600",
  marginBottom: 6,
},

riskBadge: {
  paddingHorizontal: 10,
  paddingVertical: 6,
  borderRadius: 999,
  borderWidth: 1,
},

riskBadgeHigh: {
  backgroundColor: "rgba(255, 92, 92, 0.14)",
  borderColor: "rgba(255, 92, 92, 0.28)",
},

riskBadgeMedium: {
  backgroundColor: "rgba(255, 180, 80, 0.14)",
  borderColor: "rgba(255, 180, 80, 0.28)",
},

riskBadgeLow: {
  backgroundColor: "rgba(74, 222, 128, 0.12)",
  borderColor: "rgba(74, 222, 128, 0.24)",
},

riskBadgeText: {
  color: "rgba(255,255,255,0.78)",
  fontSize: 12,
  fontWeight: "700",
},

alertTitle: {
  color: "#FFFFFF",
  fontSize: IS_COMPACT_HOME ? 25 : 28,
  lineHeight: IS_COMPACT_HOME ? 30 : 33,
  fontWeight: "800",
  marginBottom: 6,
},

alertTitleSmall: {
  fontSize: IS_COMPACT_HOME ? 22 : 24,
  lineHeight: IS_COMPACT_HOME ? 26 : 29,
},

alertText: {
  color: "rgba(255,255,255,0.74)",
  fontSize: IS_COMPACT_HOME ? 14 : 15,
  lineHeight: IS_COMPACT_HOME ? 19 : 21,
  marginBottom: 8,
},

alertAction: {
  color: "#9EB7FF",
  fontSize: 14,
  fontWeight: "700",
  marginTop: 0,
},

sectionRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: IS_COMPACT_HOME ? 6 : 8,
},

actionsSectionRow: {
  marginTop: 10,
},

homeSectionTitle: {
  color: "#FFFFFF",
  fontSize: IS_COMPACT_HOME ? 18 : 19,
  fontWeight: "800",
},

sectionMuted: {
  color: "rgba(255,255,255,0.42)",
  fontSize: 14,
  fontWeight: "700",
},

metricCarouselScroll: {
  marginHorizontal: -20,
},

metricCarouselContent: {
  paddingLeft: 20,
  paddingRight: 44,
},

metricHeroCard: {
  marginRight: 14,
  minHeight: IS_COMPACT_HOME ? 142 : 158,
  borderRadius: 28,
  padding: IS_COMPACT_HOME ? 15 : 18,
  justifyContent: "space-between",
  overflow: "hidden",
  backgroundColor: "rgba(16, 22, 44, 0.88)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.08)",
},

metricHeroCard_sleep: {
  backgroundColor: "rgba(18, 28, 60, 0.92)",
  borderColor: "rgba(102, 153, 255, 0.24)",
},

metricHeroCard_workload: {
  backgroundColor: "rgba(46, 24, 18, 0.92)",
  borderColor: "rgba(255, 128, 80, 0.24)",
},

metricHeroCard_recovery: {
  backgroundColor: "rgba(32, 22, 58, 0.92)",
  borderColor: "rgba(190, 105, 255, 0.24)",
},

metricHeroCard_finance: {
  backgroundColor: "rgba(16, 36, 46, 0.92)",
  borderColor: "rgba(92, 220, 255, 0.22)",
},

cardGradient: {
  position: "absolute",
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  opacity: 1,
},

metricHeroLabel: {
  color: "rgba(255,255,255,0.68)",
  fontSize: IS_COMPACT_HOME ? 14 : 15,
  fontWeight: "700",
},

metricHeroValue: {
  color: "#FFFFFF",
  fontSize: IS_COMPACT_HOME ? 40 : 46,
  lineHeight: IS_COMPACT_HOME ? 44 : 50,
  fontWeight: "800",
  letterSpacing: -1.2,
  marginTop: 4,
},

metricHeroNote: {
  color: "rgba(255,255,255,0.50)",
  fontSize: 12,
  marginTop: 3,
},

metricHeroRecommendation: {
  color: "rgba(255,255,255,0.76)",
  fontSize: IS_COMPACT_HOME ? 12 : 13,
  lineHeight: IS_COMPACT_HOME ? 15 : 17,
  fontWeight: "600",
},

actionGrid: {
  flexDirection: "row",
  gap: IS_COMPACT_HOME ? 10 : 12,
  marginTop: 0,
},

actionCard: {
  backgroundColor: "rgba(255,255,255,0.06)",
  borderRadius: 24,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.08)",
  padding: IS_COMPACT_HOME ? 14 : 16,
  justifyContent: "space-between",
  overflow: "hidden",
  position: "relative",
},

actionCardLarge: {
  flex: 1.08,
  minHeight: IS_COMPACT_HOME ? 128 : 148,
  justifyContent: "space-between",
},

actionCardStack: {
  flex: 1,
  gap: 14,
},

actionCardSmall: {
  minHeight: IS_COMPACT_HOME ? 62 : 72,
},

actionRecovery: {
  backgroundColor: "rgba(48, 24, 78, 0.78)",
  borderColor: "rgba(190,105,255,0.38)",
},

actionFinance: {
  backgroundColor: "rgba(14, 46, 56, 0.78)",
  borderColor: "rgba(92,220,255,0.34)",
},

actionReset: {
  backgroundColor: "rgba(68, 30, 18, 0.78)",
  borderColor: "rgba(255,120,70,0.34)",
},

actionCardTitle: {
  color: "#FFFFFF",
  fontSize: IS_COMPACT_HOME ? 17 : 18,
  fontWeight: "800",
},

actionCardText: {
  color: "rgba(255,255,255,0.64)",
  fontSize: IS_COMPACT_HOME ? 12 : 13,
  lineHeight: IS_COMPACT_HOME ? 15 : 17,
  marginTop: 4,
},

actionIcon: {
  width: 42,
  height: 42,
  borderRadius: 21,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(255,255,255,0.10)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.10)",
  marginBottom: 0,
},

actionIconSmall: {
  width: 34,
  height: 34,
  borderRadius: 17,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(255,255,255,0.10)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.10)",
  marginBottom: 6,
},

actionArrow: {
  position: "absolute",
  right: 14,
  bottom: 14,
  width: 34,
  height: 34,
  borderRadius: 17,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(255,255,255,0.10)",
},

actionArrowSmall: {
  position: "absolute",
  right: 12,
  bottom: 12,
  width: 28,
  height: 28,
  borderRadius: 14,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(255,255,255,0.10)",
},

modalOverlay: {
  flex: 1,
  justifyContent: "flex-end",
},

modalBackdrop: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: "rgba(0,0,0,0.45)",
},

sheetCard: {
  backgroundColor: "#0D1430",
  borderTopLeftRadius: 28,
  borderTopRightRadius: 28,
  paddingHorizontal: 20,
  paddingTop: 12,
  paddingBottom: 28,
  maxHeight: "88%",
},

sheetHandle: {
  width: 42,
  height: 5,
  borderRadius: 999,
  backgroundColor: "rgba(255,255,255,0.18)",
  alignSelf: "center",
  marginBottom: 14,
},

sheetTitle: {
  color: "#FFFFFF",
  fontSize: 24,
  fontWeight: "800",
  marginBottom: 16,
},

sheetSectionTitle: {
  color: "#FFFFFF",
  fontSize: 18,
  fontWeight: "700",
  marginTop: 14,
  marginBottom: 10,
},

sheetInfoCard: {
  backgroundColor: "rgba(255,255,255,0.05)",
  borderRadius: 20,
  padding: 16,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.06)",
},

sheetInfoText: {
  color: "rgba(255,255,255,0.78)",
  fontSize: 15,
  lineHeight: 24,
  marginBottom: 6,
},

sheetCloseBtn: {
  marginTop: 18,
  backgroundColor: "#3B5BFF",
  borderRadius: 18,
  paddingVertical: 14,
  alignItems: "center",
},

sheetCloseText: {
  color: "#FFFFFF",
  fontSize: 16,
  fontWeight: "700",
},
});
