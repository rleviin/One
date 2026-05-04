import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { lightTap, mediumTap } from "../haptics";
import AnimatedPressable from "../components/AnimatedPressable";
import AnimatedBottomSheet from "../components/AnimatedBottomSheet";

import type { RiskLevel, UserSignals } from "../types";
import {
  calculateRisk,
  getFinanceRecommendation,
  getRecoveryRecommendation,
  getSleepRecommendation,
  getWorkloadRecommendation,
} from "../logic";

import type { DailyCheckInData } from "../storage";
import { loadDailyCheckIn } from "../storage";
import { buildSummaryPoints, mapCheckInToSignals } from "../daraModel";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const IS_COMPACT_HOME = SCREEN_HEIGHT < 760;

type DetailKind = "summary" | "signal" | "action";

type DetailState = {
  kind: DetailKind;
  title: string;
  subtitle: string;
  points: string[];
  accent: "blue" | "purple" | "cyan" | "orange" | "green" | "red";
} | null;

type SignalCard = {
  key: "sleep" | "workload" | "recovery" | "finance";
  label: string;
  value: string;
  note: string;
  recommendation: string;
  status: string;
  icon: keyof typeof Ionicons.glyphMap;
  accent: "blue" | "purple" | "cyan" | "orange" | "green" | "red";
};

type ActionCard = {
  key: "recovery" | "finance" | "reset";
  title: string;
  text: string;
  icon: keyof typeof Ionicons.glyphMap;
  accent: "blue" | "purple" | "cyan" | "orange" | "green" | "red";
};

type HomeTabProps = {
  dataVersion?: number;
  onOpenCheckIn?: () => void;
};

function getRiskCopy(risk: RiskLevel) {
  if (risk === "high") {
    return {
      label: "High risk",
      title: "Your balance is starting to slip.",
      text: "Sleep, load and recovery are moving out of sync. Small shifts now can prevent a bigger dip later.",
      accent: "red" as const,
    };
  }

  if (risk === "medium") {
    return {
      label: "Watch",
      title: "Your balance needs attention.",
      text: "Signals are becoming less stable. A small recovery action today can keep things under control.",
      accent: "orange" as const,
    };
  }

  return {
    label: "Stable",
    title: "You are in a stable zone.",
    text: "Your current pattern looks stable. Keep protecting sleep, recovery and daily load.",
    accent: "green" as const,
  };
}

function getAccentColor(accent: DetailState["accent"] | SignalCard["accent"]) {
  switch (accent) {
    case "purple":
      return "#C96BFF";
    case "cyan":
      return "#58E7FF";
    case "orange":
      return "#FF8A4C";
    case "green":
      return "#4ADE80";
    case "red":
      return "#FF647C";
    case "blue":
    default:
      return "#7DA2FF";
  }
}

function Sparkline({ accent }: { accent: SignalCard["accent"] }) {
  const color = getAccentColor(accent);

  return (
    <View style={styles.sparkline}>
      {[22, 14, 26, 18, 30, 20, 34].map((height, index) => (
        <View key={index} style={styles.sparkColumn}>
          <View
            style={[
              styles.sparkDot,
              {
                height,
                backgroundColor:
                  index >= 5 ? color : "rgba(255,255,255,0.64)",
              },
            ]}
          />
        </View>
      ))}
    </View>
  );
}

export default function HomeTab({ dataVersion = 0, onOpenCheckIn }: HomeTabProps) {
  const [signals, setSignals] = useState<UserSignals>({
    sleepHours: 6.2,
    workload: 7,
    recovery: 4,
    spendingPressure: 5,
  });

  const [detail, setDetail] = useState<DetailState>(null);
  const [latestCheckIn, setLatestCheckIn] = useState<DailyCheckInData | null>(
    null
  );
const [refreshing, setRefreshing] = useState(false);

const loadHomeData = useCallback(async () => {
  const checkIn = await loadDailyCheckIn();

  if (!checkIn) {
    setLatestCheckIn(null);
    return;
  }

  setLatestCheckIn(checkIn);
  setSignals((current) => mapCheckInToSignals(current, checkIn));
}, []);

useEffect(() => {
  loadHomeData();
}, [loadHomeData, dataVersion]);

async function handleRefresh() {
  setRefreshing(true);
  await loadHomeData();
  setRefreshing(false);
}
  const risk = calculateRisk(signals);
  const riskCopy = getRiskCopy(risk);
  const checkInPressureScore = latestCheckIn
  ? latestCheckIn.stress * 1.2 +
    latestCheckIn.workload * 1.1 +
    latestCheckIn.spendingPressure * 0.8 -
    latestCheckIn.energy * 0.9
  : null;

const activeSignalCopy = latestCheckIn
  ? checkInPressureScore !== null && checkInPressureScore >= 14
    ? {
        badge: "High risk",
        title: "Your balance is starting to slip.",
        text: "Sleep, load and recovery are moving out of sync. Small shifts now can prevent a bigger dip later.",
        accent: "red" as const,
      }
    : checkInPressureScore !== null && checkInPressureScore >= 8
    ? {
        badge: "Watch",
        title: "Pressure is starting to build.",
        text: "Your check-in shows some load, but there is still room to correct the pattern today.",
        accent: "orange" as const,
      }
    : {
        badge: "Stable",
        title: "Your balance looks stable today.",
        text: "Your latest check-in shows enough energy and low pressure. Keep the rhythm steady.",
        accent: "green" as const,
      }
  : riskCopy;

  const activeSignalContext = latestCheckIn
  ? `Today: energy ${latestCheckIn.energy}/10, stress ${latestCheckIn.stress}/10, workload ${latestCheckIn.workload}/10.`
  : "Add a daily check-in to make this signal more personal.";
  const signalCards = useMemo<SignalCard[]>(
    () => [
      {
        key: "sleep",
        label: "Sleep",
        value: `${signals.sleepHours.toFixed(1)}h`,
        note: "Last night",
        recommendation: getSleepRecommendation(signals.sleepHours),
        status: signals.sleepHours < 6.8 ? "Below goal" : "Good range",
        icon: "moon-outline",
        accent: "purple",
      },
      {
        key: "workload",
        label: "Load",
        value: `${signals.workload}/10`,
        note: "Current load",
        recommendation: getWorkloadRecommendation(signals.workload),
        status: signals.workload >= 7 ? "Trending up" : "Controlled",
        icon: "trending-up-outline",
        accent: "orange",
      },
      {
        key: "recovery",
        label: "Recovery",
        value: `${signals.recovery}/10`,
        note: "Recovery state",
        recommendation: getRecoveryRecommendation(signals.recovery),
        status: signals.recovery <= 4 ? "Needs care" : "Compensating",
        icon: "leaf-outline",
        accent: "green",
      },
      {
        key: "finance",
        label: "Finance",
        value: `${signals.spendingPressure}/10`,
        note: "External pressure",
        recommendation: getFinanceRecommendation(signals.spendingPressure),
        status: signals.spendingPressure >= 5 ? "Pressure up" : "Stable",
        icon: "card-outline",
        accent: "cyan",
      },
    ],
    [signals]
  );

  const actions = useMemo<ActionCard[]>(
    () => [
      {
        key: "recovery",
        title: "Recovery",
        text: "Prioritize recovery today.",
        icon: "leaf-outline",
        accent: "green",
      },
      {
        key: "finance",
        title: "Finance",
        text: "Reduce external pressure.",
        icon: "cash-outline",
        accent: "cyan",
      },
      {
        key: "reset",
        title: "Reset",
        text: "A 10 min reset can help you recalibrate.",
        icon: "refresh-outline",
        accent: "orange",
      },
    ],
    []
  );

function openSummary() {
  setDetail({
    kind: "summary",
    title: activeSignalCopy.title,
    subtitle: activeSignalCopy.text,
    accent: activeSignalCopy.accent,
    points: buildSummaryPoints(signals, latestCheckIn),
  });
}
  function openSignal(card: SignalCard) {
    const extra =
      card.key === "sleep"
        ? [
            "Goal: aim for 7.5h tonight.",
            "Watch for 2–3 short nights in a row.",
            "Earlier wind-down has the highest impact today.",
          ]
        : card.key === "workload"
        ? [
            "High workload increases overload risk.",
            "Remove or postpone one non-critical task.",
            "Recovery becomes more important when load rises.",
          ]
        : card.key === "recovery"
        ? [
            "Low recovery means the body is compensating poorly.",
            "Keep intensity low today.",
            "Prioritize sleep, hydration and a calm evening.",
          ]
        : [
            "Financial pressure can increase cognitive load.",
            "Avoid major commitments today.",
            "Reduce unnecessary spending to lower background stress.",
          ];

    setDetail({
      kind: "signal",
      title: card.label,
      subtitle: `${card.value} · ${card.status}`,
      accent: card.accent,
      points: [card.recommendation, ...extra],
    });
  }

  function openAction(card: ActionCard) {
    const points =
      card.key === "recovery"
        ? [
            "Why: recovery is low while load is elevated.",
            "Do today: avoid hard training, add a walk or mobility session.",
            "Expected effect: reduce overload risk tomorrow.",
          ]
        : card.key === "finance"
        ? [
            "Why: external pressure is contributing to overall load.",
            "Do today: avoid major purchases or new commitments.",
            "Expected effect: lower background stress.",
          ]
        : [
            "Why: a short reset can interrupt the overload pattern.",
            "Do today: 10 minutes breathing, stretching or quiet walk.",
            "Expected effect: bring your system closer to baseline.",
          ];

    setDetail({
      kind: "action",
      title: card.title,
      subtitle: card.text,
      accent: card.accent,
      points,
    });
  }

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
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={handleRefresh}
      tintColor="#FFFFFF"
    />
  }
>
<View style={styles.headerRow}>
  <Text style={styles.brandTitle}>Dara</Text>

  <View style={styles.headerActions}>

<AnimatedPressable
  style={styles.checkInButton}
  pressedScale={0.96}
  onPress={() => {
    mediumTap();
    onOpenCheckIn?.();
  }}
>
      <Ionicons name="add-outline" size={18} color="#07101F" />
      <Text style={styles.checkInButtonText}>Check in</Text>
</AnimatedPressable>

    <Pressable style={styles.headerIcon}>
      <Ionicons name="pulse-outline" size={24} color="#FFFFFF" />
    </Pressable>
  </View>
</View>

{latestCheckIn && (
  <View style={styles.checkInSummaryCard}>
    <View style={styles.checkInSummaryIcon}>
      <Ionicons name="checkmark-circle-outline" size={20} color="#58E7FF" />
    </View>

    <Text style={styles.checkInSummaryText}>
      Check-in loaded · Energy {latestCheckIn.energy}/10 · Stress{" "}
      {latestCheckIn.stress}/10
    </Text>
  </View>
)}

<AnimatedPressable
  style={styles.heroCard}
  pressedScale={0.985}
  onPress={() => {
    mediumTap();
    openSummary();
  }}
>
          <LinearGradient
            colors={[
              "rgba(255,255,255,0.12)",
              "rgba(95,130,255,0.08)",
              "rgba(255,255,255,0.04)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          />

          <View style={styles.heroTop}>
            <View style={styles.heroIcon}>
              <Ionicons
                name="analytics-outline"
                size={24}
                color={getAccentColor(activeSignalCopy.accent)}
              />
            </View>

            <Text style={styles.heroLabel}>Active signal</Text>

            <View
              style={[
                styles.riskBadge,
                {
borderColor: `${getAccentColor(activeSignalCopy.accent)}66`,
backgroundColor: `${getAccentColor(activeSignalCopy.accent)}22`,
                },
              ]}
            >
              <Text
                style={[
                  styles.riskBadgeText,
{ color: getAccentColor(activeSignalCopy.accent) },
                ]}
              >
{activeSignalCopy.badge}
              </Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>{activeSignalCopy.title}</Text>
          <Text style={styles.heroText}>
{activeSignalCopy.text} {activeSignalContext}
</Text>
          <View style={styles.heroActionRow}>
            <Text style={styles.heroAction}>Tap to open details</Text>
            <Ionicons
              name="chevron-forward"
              size={18}
color={getAccentColor(activeSignalCopy.accent)}
            />
          </View>
         </AnimatedPressable>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Signals</Text>
          <Text style={styles.sectionLink}>View all</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.signalsRow}
        >

{signalCards.map((card) => (
  <AnimatedPressable
    key={card.key}
    style={styles.signalCard}
    pressedScale={0.97}
    onPress={() => {
      lightTap();
      openSignal(card);
    }}
  >
              <LinearGradient
                colors={[
                  `${getAccentColor(card.accent)}33`,
                  "rgba(255,255,255,0.06)",
                  "rgba(255,255,255,0.03)",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}
              />

              <View style={styles.signalTop}>
                <View
                  style={[
                    styles.signalIcon,
                    {
                      borderColor: `${getAccentColor(card.accent)}88`,
                      backgroundColor: `${getAccentColor(card.accent)}22`,
                    },
                  ]}
                >
                  <Ionicons
                    name={card.icon}
                    size={25}
                    color={getAccentColor(card.accent)}
                  />
                </View>

                <View
                  style={[
                    styles.signalStatus,
                    {
                      borderColor: `${getAccentColor(card.accent)}55`,
                      backgroundColor: `${getAccentColor(card.accent)}18`,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.signalStatusText,
                      { color: getAccentColor(card.accent) },
                    ]}
                  >
                    {card.status}
                  </Text>
                </View>
              </View>

              <View>
                <Text style={styles.signalLabel}>{card.label}</Text>
                <Text style={styles.signalValue}>{card.value}</Text>
                <Text style={styles.signalNote}>{card.note}</Text>
              </View>

              <Sparkline accent={card.accent} />

              <View style={styles.signalBottom}>
                <Text style={styles.signalRecommendation}>
                  {card.recommendation}
                </Text>

                <View style={styles.smallArrow}>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color="rgba(255,255,255,0.82)"
                  />
                </View>
              </View>
              </AnimatedPressable>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Actions</Text>
        </View>

        <View style={styles.actionsList}>
{actions.map((card) => (
  <AnimatedPressable
    key={card.key}
    style={styles.actionCard}
    pressedScale={0.975}
    onPress={() => {
      lightTap();
      openAction(card);
    }}
  >
              <LinearGradient
                colors={[
                  `${getAccentColor(card.accent)}26`,
                  "rgba(255,255,255,0.055)",
                  "rgba(255,255,255,0.035)",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}
              />

              <View
                style={[
                  styles.actionIcon,
                  {
                    borderColor: `${getAccentColor(card.accent)}88`,
                    backgroundColor: `${getAccentColor(card.accent)}18`,
                  },
                ]}
              >
                <Ionicons
                  name={card.icon}
                  size={25}
                  color={getAccentColor(card.accent)}
                />
              </View>

              <View style={styles.actionTextBlock}>
                <Text style={styles.actionTitle}>{card.title}</Text>
                <Text style={styles.actionText}>{card.text}</Text>
              </View>

              <View style={styles.actionArrow}>
                <Ionicons
                  name="chevron-forward"
                  size={22}
                  color="rgba(255,255,255,0.82)"
                />
              </View>
  </AnimatedPressable>
))}
        </View>
      </ScrollView>

<AnimatedBottomSheet
  visible={detail !== null}
  onClose={() => {
    lightTap();
    setDetail(null);
  }}
>

  {detail && (
    <>
      <View
        style={[
          styles.sheetIcon,
          {
            borderColor: `${getAccentColor(detail.accent)}77`,
            backgroundColor: `${getAccentColor(detail.accent)}18`,
          },
        ]}
      >
        <Ionicons
          name={
            detail.kind === "summary"
              ? "pulse-outline"
              : detail.kind === "signal"
              ? "analytics-outline"
              : "sparkles-outline"
          }
          size={25}
          color={getAccentColor(detail.accent)}
        />
      </View>

      <Text style={styles.sheetTitle}>{detail.title}</Text>
      <Text style={styles.sheetSubtitle}>{detail.subtitle}</Text>

      <View style={styles.sheetPoints}>
        {detail.points.map((point, index) => (
          <View key={index} style={styles.sheetPoint}>
            <View
              style={[
                styles.sheetPointDot,
                { backgroundColor: getAccentColor(detail.accent) },
              ]}
            />
            <Text style={styles.sheetPointText}>{point}</Text>
          </View>
        ))}
      </View>

      <AnimatedPressable
        style={styles.sheetButton}
        pressedScale={0.97}
        onPress={() => {
          lightTap();
          setDetail(null);
        }}
      >
        <Text style={styles.sheetButtonText}>Got it</Text>
      </AnimatedPressable>
    </>
  )}
</AnimatedBottomSheet>
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
    backgroundColor: "rgba(3, 7, 18, 0.48)",
  },

  content: {
    paddingTop: IS_COMPACT_HOME ? 10 : 18,
    paddingHorizontal: 20,
    paddingBottom: 190,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  brandTitle: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -1.2,
  },

  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },

  heroCard: {
    minHeight: IS_COMPACT_HOME ? 245 : 270,
    borderRadius: 30,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(8, 16, 38, 0.56)",
    overflow: "hidden",
    marginBottom: 24,
  },

  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },

  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  heroIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(255,138,76,0.7)",
    backgroundColor: "rgba(255,138,76,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  heroLabel: {
    flex: 1,
    color: "rgba(255,255,255,0.68)",
    fontSize: 16,
    fontWeight: "700",
  },

  riskBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },

  riskBadgeText: {
    fontSize: 14,
    fontWeight: "800",
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: IS_COMPACT_HOME ? 31 : 36,
    lineHeight: IS_COMPACT_HOME ? 36 : 42,
    fontWeight: "900",
    letterSpacing: -1.1,
    maxWidth: "82%",
    marginBottom: 12,
  },

  heroText: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 16,
    lineHeight: 23,
    maxWidth: "82%",
    marginBottom: 18,
  },

  heroActionRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  heroAction: {
    color: "#FF9A4D",
    fontSize: 16,
    fontWeight: "800",
    marginRight: 4,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "900",
    letterSpacing: -0.5,
  },

  sectionLink: {
    color: "#8FA8FF",
    fontSize: 15,
    fontWeight: "700",
  },

  signalsRow: {
    paddingRight: 20,
    gap: 14,
    marginBottom: 24,
  },

  signalCard: {
    width: SCREEN_WIDTH - 96,
    minHeight: IS_COMPACT_HOME ? 210 : 230,
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(8, 16, 38, 0.54)",
    overflow: "hidden",
  },

  cardGradient: {
    ...StyleSheet.absoluteFillObject,
  },

  signalTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },

  signalIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  signalStatus: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },

  signalStatusText: {
    fontSize: 12,
    fontWeight: "800",
  },

  signalLabel: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 18,
    fontWeight: "800",
  },

  signalValue: {
    color: "#FFFFFF",
    fontSize: 38,
    lineHeight: 44,
    fontWeight: "900",
    marginTop: 4,
  },

  signalNote: {
    color: "rgba(255,255,255,0.54)",
    fontSize: 14,
    marginTop: 2,
  },

  sparkline: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 42,
    marginTop: 10,
    marginBottom: 12,
  },

  sparkColumn: {
    flex: 1,
    height: 42,
    justifyContent: "flex-end",
  },

  sparkDot: {
    width: 4,
    borderRadius: 999,
    opacity: 0.9,
  },

  signalBottom: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.10)",
    paddingTop: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  signalRecommendation: {
    flex: 1,
    color: "rgba(255,255,255,0.76)",
    fontSize: 15,
    fontWeight: "700",
  },

  smallArrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },

  actionsList: {
    gap: 10,
  },

actionCard: {
  width: "100%",
  minHeight: 84,
  borderRadius: 24,
  padding: 14,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.16)",
  backgroundColor: "rgba(8, 16, 38, 0.54)",
  overflow: "hidden",
  flexDirection: "row",
  alignItems: "center",
},

  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  actionTextBlock: {
    flex: 1,
  },

  actionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 3,
  },

  actionText: {
    color: "rgba(255,255,255,0.66)",
    fontSize: 14,
    lineHeight: 19,
  },

  actionArrow: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
  },

headerActions: {
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
},

checkInButton: {
  height: 44,
  borderRadius: 22,
  backgroundColor: "#FFFFFF",
  paddingHorizontal: 14,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
},

checkInButtonText: {
  color: "#07101F",
  fontSize: 14,
  fontWeight: "900",
  marginLeft: 4,
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
    backgroundColor: "rgba(8, 16, 38, 0.96)",
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
    width: 52,
    height: 52,
    borderRadius: 26,
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
 
  checkInSummaryCard: {
  flexDirection: "row",
  alignItems: "center",
  borderRadius: 22,
  padding: 12,
  backgroundColor: "rgba(88,231,255,0.08)",
  borderWidth: 1,
  borderColor: "rgba(88,231,255,0.18)",
  marginBottom: 14,
},

checkInSummaryIcon: {
  width: 34,
  height: 34,
  borderRadius: 17,
  backgroundColor: "rgba(88,231,255,0.12)",
  borderWidth: 1,
  borderColor: "rgba(88,231,255,0.24)",
  alignItems: "center",
  justifyContent: "center",
  marginRight: 10,
},

checkInSummaryText: {
  flex: 1,
  color: "rgba(255,255,255,0.72)",
  fontSize: 13,
  lineHeight: 18,
  fontWeight: "700",
},
});
