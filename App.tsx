import HomeTab from "./src/screens/HomeTab";
import ForecastTab from "./src/screens/ForecastTab";
import InsightsTab from "./src/screens/InsightsTab";
import ProfileTab from "./src/screens/ProfileTab";
import AuthScreen from "./src/screens/AuthScreen";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import ExplanationScreen from "./src/screens/ExplanationScreen";
import PersonalSetupScreen from "./src/screens/PersonalSetupScreen";
import React, { useEffect, useMemo, useRef, useState } from "react";
import DailyCheckInScreen from "./src/screens/DailyCheckInScreen";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Animated,
  Modal,
  Dimensions,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type {
  HomeData,
  MetricCardProps,
  RiskLevel,
  Screen,
  Tab,
  UserSignals,
} from "./src/types";

import {
  calculateRisk,
  getFinanceRecommendation,
  getRecoveryRecommendation,
  getSleepRecommendation,
  getWorkloadRecommendation,
} from "./src/logic";

type UserSignals = {
  sleepHours: number;
  workload: number;
  recovery: number;
  spendingPressure: number;
};

function MetricCard({ label, value, hint, tone }: MetricCardProps) {
  return (
    <View style={[styles.metricCard, styles[`metricCard_${tone}`]]}>
      <View style={styles.metricGlow} />

      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricHint}>{hint}</Text>

      <View style={styles.metricDots}>
        {Array.from({ length: 13 }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.metricDot,
              index === 8 && styles.metricDotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}
const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const IS_COMPACT_HOME = SCREEN_HEIGHT < 760;
const HOME_CARD_WIDTH = SCREEN_WIDTH - 88;

function MainApp() {
  const [tab, setTab] = useState<Tab>("home");
  const [showSetup, setShowSetup] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [dataVersion, setDataVersion] = useState(0);

if (showSetup) {
  return (
    <PersonalSetupScreen
      onDone={() => {
        setShowSetup(false);
        setDataVersion((current) => current + 1);
      }}
    />
  );
}
 
if (showCheckIn) {
  return (
    <DailyCheckInScreen
      onDone={() => {
        setShowCheckIn(false);
        setDataVersion((current) => current + 1);
      }}
    />
  );
}
  return (
    <SafeAreaView style={styles.mainAppContainer}>
      <View style={styles.mainContent}>
{tab === "home" && (
  <HomeTab
    dataVersion={dataVersion}
    onOpenCheckIn={() => setShowCheckIn(true)}
  />
)}

{tab === "forecast" && <ForecastTab dataVersion={dataVersion} />}

{tab === "insights" && <InsightsTab dataVersion={dataVersion} />}

{tab === "profile" && (
  <ProfileTab
    dataVersion={dataVersion}
    onOpenSetup={() => setShowSetup(true)}
  />
)}
      </View>
<View style={styles.tabBar}>
  <Pressable
    style={[styles.tabBarItem, tab === "home" && styles.tabBarItemActive]}
    onPress={() => setTab("home")}
  >
    <Ionicons
      name={tab === "home" ? "home" : "home-outline"}
      size={20}
      color={tab === "home" ? "#FFFFFF" : "rgba(255,255,255,0.62)"}
    />
    <Text style={[styles.tabBarText, tab === "home" && styles.tabBarTextActive]}>
      Home
    </Text>
  </Pressable>

  <Pressable
    style={[styles.tabBarItem, tab === "forecast" && styles.tabBarItemActive]}
    onPress={() => setTab("forecast")}
  >
    <Ionicons
      name={tab === "forecast" ? "analytics" : "analytics-outline"}
      size={20}
      color={tab === "forecast" ? "#FFFFFF" : "rgba(255,255,255,0.62)"}
    />
    <Text style={[styles.tabBarText, tab === "forecast" && styles.tabBarTextActive]}>
      Forecast
    </Text>
  </Pressable>

  <Pressable
    style={[styles.tabBarItem, tab === "insights" && styles.tabBarItemActive]}
    onPress={() => setTab("insights")}
  >
    <Ionicons
      name={tab === "insights" ? "bulb" : "bulb-outline"}
      size={20}
      color={tab === "insights" ? "#FFFFFF" : "rgba(255,255,255,0.62)"}
    />
    <Text style={[styles.tabBarText, tab === "insights" && styles.tabBarTextActive]}>
      Insights
    </Text>
  </Pressable>

  <Pressable
    style={[styles.tabBarItem, tab === "profile" && styles.tabBarItemActive]}
    onPress={() => setTab("profile")}
  >
    <Ionicons
      name={tab === "profile" ? "person" : "person-outline"}
      size={20}
      color={tab === "profile" ? "#FFFFFF" : "rgba(255,255,255,0.62)"}
    />
    <Text style={[styles.tabBarText, tab === "profile" && styles.tabBarTextActive]}>
      Profile
    </Text>
  </Pressable>
</View>

    </SafeAreaView>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("onboarding");

  if (screen === "onboarding") {
    return <OnboardingScreen onDone={() => setScreen("explanation")} />;
  }

  if (screen === "explanation") {
    return <ExplanationScreen onDone={() => setScreen("auth")} />;
  }

if (screen === "auth") {
  return <AuthScreen onDone={() => setScreen("setup")} />;
}

if (screen === "setup") {
  return <PersonalSetupScreen onDone={() => setScreen("app")} />;
}

return <MainApp />;
}

const styles = StyleSheet.create({

  screenBackgroundImage: {
  flex: 1,
  backgroundColor: "#050A14",
},

screenBackgroundImageInner: {
  resizeMode: "cover",
},

darkImageOverlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: "rgba(3, 7, 18, 0.34)",
},
  
welcomeContainer: {
  flex: 1,
  backgroundColor: "transparent",
  overflow: "hidden",
},

explainContainer: {
  flex: 1,
  backgroundColor: "transparent",
  overflow: "hidden",
},

explainGlowOne: {
  position: "absolute",
  width: 360,
  height: 360,
  borderRadius: 180,
  backgroundColor: "rgba(92, 130, 255, 0.22)",
  top: 160,
  right: -130,
},

explainGlowTwo: {
  position: "absolute",
  width: 340,
  height: 340,
  borderRadius: 170,
  backgroundColor: "rgba(190, 105, 255, 0.18)",
  bottom: 120,
  left: -150,
},

explainContent: {
  flex: 1,
  paddingHorizontal: 28,
  paddingTop: IS_COMPACT_HOME ? 28 : 46,
  justifyContent: "center",
},

explainBrand: {
  color: "rgba(255,255,255,0.58)",
  fontSize: 13,
  fontWeight: "800",
  letterSpacing: 3,
  marginBottom: 18,
},

explainTitle: {
  color: "#FFFFFF",
  fontSize: IS_COMPACT_HOME ? 26 : 31,
  lineHeight: IS_COMPACT_HOME ? 31 : 37,
  fontWeight: "900",
  letterSpacing: -1,
  marginBottom: 20,
},

explainCards: {
  gap: 10,
},

explainCard: {
  flexDirection: "row",
  alignItems: "flex-start",
  backgroundColor: "rgba(255,255,255,0.055)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.13)",
  borderRadius: 24,
  padding: 14,
  overflow: "hidden",
},

explainIcon: {
  width: 36,
  height: 36,
  borderRadius: 18,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(255,255,255,0.08)",
  borderWidth: 1,
  borderColor: "rgba(92, 220, 255, 0.28)",
  marginRight: 12,
},

explainIconPurple: {
  width: 36,
  height: 36,
  borderRadius: 18,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(255,255,255,0.08)",
  borderWidth: 1,
  borderColor: "rgba(190, 105, 255, 0.30)",
  marginRight: 12,
},

explainIconAmber: {
  width: 36,
  height: 36,
  borderRadius: 18,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(255,255,255,0.08)",
  borderWidth: 1,
  borderColor: "rgba(255, 180, 80, 0.30)",
  marginRight: 12,
},

explainTextBlock: {
  flex: 1,
},

explainCardTitle: {
  color: "#FFFFFF",
  fontSize: 15,
  lineHeight: 20,
  fontWeight: "800",
  marginBottom: 3,
},

explainCardText: {
  color: "rgba(255,255,255,0.62)",
  fontSize: 12,
  lineHeight: 17,
  fontWeight: "500",
},

explainInsightCard: {
  marginTop: 16,
  backgroundColor: "rgba(158,183,255,0.10)",
  borderWidth: 1,
  borderColor: "rgba(158,183,255,0.20)",
  borderRadius: 24,
  padding: 16,
},

explainInsightLabel: {
  color: "#B7C7FF",
  fontSize: 12,
  fontWeight: "800",
  marginBottom: 8,
  letterSpacing: 1.2,
  textTransform: "uppercase",
},

explainInsightTitle: {
  color: "#FFFFFF",
  fontSize: 17,
  lineHeight: 23,
  fontWeight: "800",
},

explainFooter: {
  paddingHorizontal: 28,
  paddingBottom: 34,
},

welcomeGlowOne: {
  position: "absolute",
  width: 320,
  height: 320,
  borderRadius: 160,
  backgroundColor: "rgba(92, 86, 255, 0.24)",
  top: 120,
  left: -90,
},

welcomeGlowTwo: {
  position: "absolute",
  width: 300,
  height: 300,
  borderRadius: 150,
  backgroundColor: "rgba(92, 220, 255, 0.14)",
  bottom: 80,
  right: -110,
},

welcomeContent: {
  flex: 1,
  paddingHorizontal: 28,
  paddingTop: IS_COMPACT_HOME ? 30 : 46,
  justifyContent: "center",
},

welcomeBrand: {
  color: "rgba(255,255,255,0.58)",
  fontSize: 14,
  fontWeight: "800",
  letterSpacing: 3,
  marginBottom: 24,
},

welcomeTitle: {
  color: "#FFFFFF",
  fontSize: IS_COMPACT_HOME ? 30 : 36,
  lineHeight: IS_COMPACT_HOME ? 35 : 41,
  fontWeight: "900",
  letterSpacing: -1.1,
  marginBottom: 16,
},

welcomeSubtitle: {
  color: "rgba(255,255,255,0.60)",
  fontSize: IS_COMPACT_HOME ? 14 : 15,
  lineHeight: IS_COMPACT_HOME ? 22 : 24,
  fontWeight: "500",
  marginBottom: 22,
},

welcomePreviewCard: {
  backgroundColor: "rgba(255,255,255,0.07)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.12)",
  borderRadius: 28,
  padding: 18,
  overflow: "hidden",
},

welcomePreviewTop: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 18,
},

welcomePreviewLabel: {
  color: "rgba(255,255,255,0.54)",
  fontSize: 14,
  fontWeight: "700",
},

welcomePreviewBadge: {
  paddingHorizontal: 11,
  paddingVertical: 7,
  borderRadius: 999,
  backgroundColor: "rgba(158,183,255,0.14)",
  borderWidth: 1,
  borderColor: "rgba(158,183,255,0.26)",
},

welcomePreviewBadgeText: {
  color: "#B7C7FF",
  fontSize: 12,
  fontWeight: "800",
},

welcomePreviewTitle: {
  color: "#FFFFFF",
  fontSize: 20,
  lineHeight: 25,
  fontWeight: "800",
  marginBottom: 8,
},

welcomePreviewText: {
  color: "rgba(255,255,255,0.64)",
  fontSize: 14,
  lineHeight: 20,
},

welcomeFooter: {
  paddingHorizontal: 28,
  paddingBottom: 34,
},

welcomeButton: {
  height: 58,
  borderRadius: 29,
  backgroundColor: "#FFFFFF",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 14,
},

welcomeButtonText: {
  color: "#07101F",
  fontSize: 18,
  fontWeight: "800",
},

welcomeFootnote: {
  color: "rgba(255,255,255,0.42)",
  fontSize: 13,
  lineHeight: 18,
  textAlign: "center",
},
  onboardingContainer: {
    flex: 1,
    backgroundColor: "#050816",
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 28,
    justifyContent: "space-between",
  },
  onboardingGlowOne: {
    position: "absolute",
    top: 70,
    left: 0,
    width: 260,
    height: 260,
    borderRadius: 999,
    backgroundColor: "rgba(74,93,255,0.12)",
  },
  onboardingGlowTwo: {
    position: "absolute",
    bottom: 120,
    right: 0,
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: "rgba(92,210,255,0.12)",
  },
  onboardingTop: {
    paddingTop: 10,
  },
  topCardsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  miniCard: {
    width: "31%",
    minHeight: 110,
    borderRadius: 22,
    padding: 12,
    justifyContent: "space-between",
  },
  miniCardPurple: {
    backgroundColor: "rgba(66,56,131,0.88)",
  },
  miniCardBlue: {
    backgroundColor: "rgba(44,61,140,0.88)",
  },
  miniCardIndigo: {
    backgroundColor: "rgba(42,55,122,0.88)",
  },
  miniCardTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  miniCardValue: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
  },
  miniCardText: {
    color: "rgba(255,255,255,0.84)",
    fontSize: 12,
    lineHeight: 16,
  },
  blobWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  blobAura: {
    position: "absolute",
    width: 290,
    height: 290,
    borderRadius: 999,
    backgroundColor: "rgba(117,188,255,0.16)",
  },
  blobOuter: {
    width: 240,
    height: 220,
    borderRadius: 88,
    backgroundColor: "#FF9B64",
    transform: [{ rotate: "10deg" }],
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  blobInner: {
    position: "absolute",
    width: 190,
    height: 176,
    borderRadius: 78,
    backgroundColor: "#C86BFF",
    top: 18,
    left: 22,
  },
  blobCore: {
    position: "absolute",
    width: 118,
    height: 104,
    borderRadius: 52,
    backgroundColor: "#9DE9FF",
    bottom: 24,
    right: 14,
  },
  onboardingBottom: {
    alignItems: "center",
  },
  eyebrow: {
    color: "rgba(255,255,255,0.56)",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
  },
  onboardingTitle: {
    color: "#FFFFFF",
    fontSize: 38,
    lineHeight: 44,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  onboardingSubtitle: {
    color: "rgba(255,255,255,0.84)",
    fontSize: 18,
    lineHeight: 27,
    textAlign: "center",
    maxWidth: 330,
    marginBottom: 26,
  },
  heroButton: {
    minWidth: 230,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    paddingVertical: 18,
    paddingHorizontal: 28,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(127,210,255,0.92)",
  },
  heroButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

authContainer: {
  flex: 1,
  justifyContent: "center",
  paddingHorizontal: 24,
},

authTopBrand: {
  alignItems: "center",
  marginBottom: 26,
},

authTopBrandText: {
  color: "rgba(255,255,255,0.88)",
  fontSize: 17,
  fontWeight: "600",
  letterSpacing: 8,
},

authCard: {
  backgroundColor: "rgba(10, 18, 44, 0.58)",
  borderRadius: 30,
  paddingHorizontal: 24,
  paddingTop: 28,
  paddingBottom: 24,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.22)",
  shadowColor: "#000",
  shadowOpacity: 0.22,
  shadowRadius: 24,
  shadowOffset: { width: 0, height: 10 },
},

  headerRow: {
    marginBottom: 18,
  },
  brand: {
    fontSize: 16,
    color: "#222",
    marginBottom: 14,
    fontWeight: "600",
  },
  switch: {
    flexDirection: "row",
    backgroundColor: "#EFEDE8",
    borderRadius: 14,
    padding: 4,
  },
  switchTab: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  switchTabActive: {
    backgroundColor: "#111827",
  },
  switchText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
  },
  switchTextActive: {
    color: "#FFFFFF",
  },
authTitle: {
  color: "#FFFFFF",
  fontSize: 34,
  fontWeight: "800",
  lineHeight: 40,
},

authSubtitle: {
  color: "rgba(255,255,255,0.72)",
  fontSize: 16,
  lineHeight: 24,
  marginTop: 10,
  marginBottom: 24,
},
authSwitch: {
  flexDirection: "row",
  backgroundColor: "rgba(255,255,255,0.06)",
  borderRadius: 18,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.12)",
  padding: 4,
  marginBottom: 24,
},

authSwitchTab: {
  flex: 1,
  borderRadius: 14,
  paddingVertical: 14,
  alignItems: "center",
  justifyContent: "center",
},

authSwitchTabActive: {
  backgroundColor: "rgba(107, 126, 255, 0.28)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.14)",
},

authSwitchText: {
  color: "rgba(255,255,255,0.6)",
  fontSize: 16,
  fontWeight: "600",
},

authSwitchTextActive: {
  color: "#FFFFFF",
},
authFieldBlock: {
  marginBottom: 20,
},

authFieldLabel: {
  color: "rgba(255,255,255,0.64)",
  fontSize: 13,
  fontWeight: "700",
  letterSpacing: 2.2,
  marginBottom: 10,
},

authInputWrap: {
  minHeight: 60,
  borderRadius: 18,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.20)",
  backgroundColor: "rgba(255,255,255,0.05)",
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 16,
},
authInput: {
  flex: 1,
  color: "#FFFFFF",
  fontSize: 18,
  marginLeft: 12,
},

authForgot: {
  color: "#B98DFF",
  fontSize: 15,
  textAlign: "right",
  marginTop: -2,
  marginBottom: 24,
},

authPrimaryButton: {
  marginTop: 6,
  backgroundColor: "#FFFFFF",
  minHeight: 64,
  borderRadius: 999,
  alignItems: "center",
  justifyContent: "center",
},

authPrimaryButtonText: {
  color: "#09132B",
  fontSize: 20,
  fontWeight: "800",
},

authFooterRow: {
  marginTop: 22,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
},

authFooterIcon: {
  width: 30,
  height: 30,
  borderRadius: 15,
  backgroundColor: "rgba(255,255,255,0.06)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.12)",
  alignItems: "center",
  justifyContent: "center",
  marginRight: 10,
},

authFooterText: {
  color: "rgba(255,255,255,0.68)",
  fontSize: 15,
},

  helperText: {
    alignSelf: "flex-end",
    color: "#6B7280",
    fontSize: 13,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#111827",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  footerText: {
    marginTop: 16,
    fontSize: 12,
    lineHeight: 18,
    color: "#6B7280",
    textAlign: "center",
  },

  mainAppContainer: {
    flex: 1,
    backgroundColor: "#060B18",
  },
  mainContent: {
    flex: 1,
  },
  homeGlowOne: {
    position: "absolute",
    top: 100,
    left: -20,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "rgba(93,98,255,0.1)",
  },
  homeGlowTwo: {
    position: "absolute",
    bottom: 160,
    right: -10,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "rgba(83,213,255,0.08)",
  },
  tabContent: {
    padding: 20,
    paddingBottom: 110,
  },
  homeTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 18,
  },
  segmentWrap: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    padding: 4,
    marginBottom: 18,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 12,
  },
  segmentBtnActive: {
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  segmentText: {
    color: "rgba(255,255,255,0.66)",
    fontSize: 13,
    fontWeight: "600",
  },
  segmentTextActive: {
    color: "#FFFFFF",
  },
  heroForecastCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 24,
    padding: 20,
    marginBottom: 22,
  },
  heroForecastTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "700",
    marginBottom: 8,
  },
  heroForecastSubtitle: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 15,
    lineHeight: 22,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
  },
  infoText: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 14,
    lineHeight: 21,
  },
quickActionsRow: {
  width: "100%",
  flexDirection: "row",
  gap: 10,
  marginTop: 18,
  marginBottom: 96,
},

quickBtn: {
  flex: 1,
  minHeight: 56,
  backgroundColor: "rgba(255,255,255,0.10)",
  borderRadius: 18,
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: 8,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.06)",
},

quickText: {
  color: "#FFFFFF",
  fontSize: 14,
  fontWeight: "700",
  textAlign: "center",
},
  tabBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    flexDirection: "row",
    backgroundColor: "rgba(14,20,39,0.96)",
    borderRadius: 22,
    padding: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
tabBarItem: {
  flex: 1,
  paddingVertical: 8,
  borderRadius: 16,
  alignItems: "center",
  gap: 3,
},
  tabBarItemActive: {
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  tabBarText: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 13,
    fontWeight: "600",
  },
  
  color: "#FFFFFF",tabBarTextActive: {
    color: "#FFFFFF",
  },

  signalGrid: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 10,
  marginBottom: 18,
},

signalCard: {
  width: "48%",
  backgroundColor: "rgba(255,255,255,0.07)",
  borderRadius: 18,
  padding: 14,
},

signalLabel: {
  color: "rgba(255,255,255,0.58)",
  fontSize: 12,
  marginBottom: 6,
},

signalValue: {
  color: "#FFFFFF",
  fontSize: 22,
  fontWeight: "700",
},

metricGrid: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 12,
  marginBottom: 18,
},

metricCard: {
  width: "48%",
  minHeight: 150,
  borderRadius: 30,
  padding: 18,
  overflow: "hidden",
  backgroundColor: "rgba(255,255,255,0.075)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.08)",
},

actionsSectionRow: {
  marginTop: 10,
},

metricCard_blue: {
  backgroundColor: "rgba(38, 70, 160, 0.32)",
},

metricCard_green: {
  backgroundColor: "rgba(36, 120, 86, 0.26)",
},

metricCard_amber: {
  backgroundColor: "rgba(210, 125, 42, 0.30)",
},

metricCard_red: {
  backgroundColor: "rgba(210, 64, 64, 0.30)",
},

metricCard_purple: {
  backgroundColor: "rgba(142, 75, 214, 0.30)",
},

metricGlow: {
  position: "absolute",
  left: -20,
  right: -20,
  bottom: -42,
  height: 92,
  borderRadius: 999,
  backgroundColor: "rgba(255,255,255,0.16)",
},

metricLabel: {
  color: "rgba(255,255,255,0.72)",
  fontSize: 15,
  fontWeight: "600",
  marginBottom: 10,
},

metricValue: {
  color: "#FFFFFF",
  fontSize: 34,
  lineHeight: 40,
  fontWeight: "800",
  marginBottom: 8,
},

metricHint: {
  color: "rgba(255,255,255,0.68)",
  fontSize: 12,
  lineHeight: 16,
  minHeight: 32,
},

metricDots: {
  flexDirection: "row",
  alignItems: "center",
  gap: 5,
  marginTop: "auto",
},

metricDot: {
  width: 4,
  height: 4,
  borderRadius: 999,
  backgroundColor: "rgba(255,255,255,0.36)",
},

metricDotActive: {
  width: 16,
  backgroundColor: "#FFFFFF",
},
brandEyebrow: {
  color: "rgba(255,255,255,0.72)",
  fontSize: 14,
  fontWeight: "700",
  letterSpacing: 1.1,
  textTransform: "uppercase",
  marginBottom: 12,
},

homeModernContent: {
  paddingTop: 10,
  paddingHorizontal: 20,
  paddingBottom: 130,
},

homeModernTitle: {
  color: "#FFFFFF",
  fontSize: 52,
  lineHeight: 56,
  fontWeight: "800",
  letterSpacing: -2,
  marginBottom: 18,
},

homeModernSubtitle: {
  color: "rgba(255,255,255,0.68)",
  fontSize: 17,
  lineHeight: 29,
  marginBottom: 28,
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
},riskBadgeText: {
  color: "rgba(255,255,255,0.78)",
  fontSize: 12,
  fontWeight: "700",
},

alertLabel: {
  color: "rgba(255,255,255,0.55)",
  fontSize: 13,
  fontWeight: "600",
  marginBottom: 6,
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

sectionRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: IS_COMPACT_HOME ? 6 : 8,
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
  marginBottom: 10,
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

carouselContent: {
  paddingRight: 6,
  marginRight: 14,
  minHeight: 180,
  borderRadius: 30,
  padding: 20,
  justifyContent: "space-between",
  overflow: "hidden",
  backgroundColor: "rgba(16, 22, 44, 0.88)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.08)",
},

cardGradient: {
  position: "absolute",
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  opacity: 1,
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

metricHeroGlow: {
  position: "absolute",
  width: 180,
  height: 180,
  borderRadius: 999,
  right: -55,
  bottom: -65,
  backgroundColor: "rgba(120,160,255,0.16)",
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
