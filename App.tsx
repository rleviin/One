import AuthScreen from "./src/screens/AuthScreen";
import React, { useEffect, useMemo, useRef, useState } from "react";
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

function OnboardingScreen({ onDone }) {
  return (
    <ImageBackground
      source={require("./assets/onboarding-bg_0.png")}
      style={styles.screenBackgroundImage}
      imageStyle={styles.screenBackgroundImageInner}
      resizeMode="cover"
    >
      
      <View style={styles.darkImageOverlay} />

      <SafeAreaView style={styles.welcomeContainer}>
      <View style={styles.welcomeContent}>

<Text style={styles.welcomeBrand}>DARA AI</Text>

<Text style={styles.welcomeTitle}>
  Hi, I'm Dara.{"\n"}I don't just track —{"\n"}I predict and guide.
</Text>

<Text style={styles.welcomeSubtitle}>
  I connect signals from your sleep, activity, recovery, finances and
  environment to show what may happen next — and what to do today.
</Text>

        <View style={styles.welcomePreviewCard}>
          <View style={styles.welcomePreviewTop}>
            <Text style={styles.welcomePreviewLabel}>Active signal</Text>
            <View style={styles.welcomePreviewBadge}>
              <Text style={styles.welcomePreviewBadgeText}>Forecast</Text>
            </View>
          </View>

          <Text style={styles.welcomePreviewTitle}>
            Your balance is starting to shift
          </Text>

          <Text style={styles.welcomePreviewText}>
            Dara explains why, what may happen, and what to do today.
          </Text>
        </View>
      </View>

      <View style={styles.welcomeFooter}>
        <Pressable style={styles.welcomeButton} onPress={onDone}>
          <Text style={styles.welcomeButtonText}>Continue</Text>
        </Pressable>

        <Text style={styles.welcomeFootnote}>
          Built to turn scattered signals into clear guidance.
        </Text>
      </View>
    </SafeAreaView>
  </ImageBackground>
  );
}

function ExplanationScreen({ onDone }: { onDone: () => void }) {
  return (
    <ImageBackground
      source={require("./assets/onboarding-bg.png")}
      style={styles.screenBackgroundImage}
      imageStyle={styles.screenBackgroundImageInner}
    >
      <View style={styles.darkImageOverlay} />

      <SafeAreaView style={styles.explainContainer}>

      <View style={styles.explainContent}>
        <Text style={styles.explainBrand}>HOW DARA WORKS</Text>

        <Text style={styles.explainTitle}>
          Dara connects the dots before they become problems.
        </Text>

        <View style={styles.explainCards}>
          <View style={styles.explainCard}>
            <View style={styles.explainIcon}>
              <Ionicons name="analytics-outline" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.explainTextBlock}>
              <Text style={styles.explainCardTitle}>Reads your signals</Text>
              <Text style={styles.explainCardText}>
                Sleep, activity, recovery, finances and environment become one clear picture.
              </Text>
            </View>
          </View>

          <View style={styles.explainCard}>
            <View style={styles.explainIconPurple}>
              <Ionicons name="git-branch-outline" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.explainTextBlock}>
              <Text style={styles.explainCardTitle}>Finds hidden patterns</Text>
              <Text style={styles.explainCardText}>
                Dara looks for combinations that are easy to miss, like poor sleep plus rising workload.
              </Text>
            </View>
          </View>

          <View style={styles.explainCard}>
            <View style={styles.explainIconAmber}>
              <Ionicons name="compass-outline" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.explainTextBlock}>
              <Text style={styles.explainCardTitle}>Guides your next move</Text>
              <Text style={styles.explainCardText}>
                It explains why it thinks so and suggests small actions for today.
              </Text>
            </View>
          </View>
        </View>

      </View>

      <View style={styles.explainFooter}>
        <Pressable style={styles.welcomeButton} onPress={onDone}>
          <Text style={styles.welcomeButtonText}>Continue</Text>
        </Pressable>

        <Text style={styles.welcomeFootnote}>
          You stay in control. Dara only guides.
        </Text>
      </View>
    </SafeAreaView>
  </ImageBackground>
  );
}



function HomeTab() {
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
function ForecastTab() {
  return (
      <ScrollView contentContainerStyle={styles.tabContent}>
      <Text style={styles.homeTitle}>Forecast</Text>

      <View style={styles.heroForecastCard}>
        <Text style={styles.heroForecastTitle}>
          Future pressure map
        </Text>
        <Text style={styles.heroForecastSubtitle}>
          Dara estimates how today’s patterns may evolve over time.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Timeline</Text>

      <View style={styles.infoCard}>
        <Text style={styles.insightTitle}>7 days</Text>
        <Text style={styles.infoText}>
          Energy risk may increase if recovery remains unchanged.
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.insightTitle}>14 days</Text>
        <Text style={styles.infoText}>
          Focus quality may decline if workload keeps rising.
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.insightTitle}>30 days</Text>
        <Text style={styles.infoText}>
          Financial pressure may become noticeable if spending trend continues.
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.insightTitle}>60 days</Text>
        <Text style={styles.infoText}>
          Market changes, inflation or rate shifts may affect long-term stability.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Correction path</Text>

      <View style={styles.infoCard}>
        <Text style={styles.infoText}>
          • Improve recovery this week
        </Text>
        <Text style={styles.infoText}>
          • Reduce unnecessary spending
        </Text>
        <Text style={styles.infoText}>
          • Build financial buffer
        </Text>
        <Text style={styles.infoText}>
          • Avoid major commitments until risk is clearer
        </Text>
      </View>
    </ScrollView>
  );
}

function InsightsTab() {
  return (
    <ScrollView contentContainerStyle={styles.tabContent}>
      <Text style={styles.homeTitle}>Insights</Text>

      <View style={styles.heroForecastCard}>
        <Text style={styles.heroForecastTitle}>Patterns detected across multiple areas</Text>
        <Text style={styles.heroForecastSubtitle}>
          Dara combines internal signals and external context.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Health</Text>
      <View style={styles.infoCard}>
        <Text style={styles.infoText}>• Sleep recovery is uneven</Text>
        <Text style={styles.infoText}>• Energy stability depends on rest quality</Text>
        <Text style={styles.infoText}>• Nutrition adjustments may improve resilience</Text>
      </View>

      <Text style={styles.sectionTitle}>Finance</Text>
      <View style={styles.infoCard}>
        <Text style={styles.infoText}>• Spending pressure is rising</Text>
        <Text style={styles.infoText}>• Local inflation trends may affect stability</Text>
        <Text style={styles.infoText}>• Building a buffer is recommended</Text>
      </View>

      <Text style={styles.sectionTitle}>Growth</Text>
      <View style={styles.infoCard}>
        <Text style={styles.infoText}>• Consistency matters more than intensity</Text>
        <Text style={styles.infoText}>• Learning and routine upgrades compound over time</Text>
      </View>
    </ScrollView>
  );
}

function ProfileTab() {
  return (
    <ScrollView contentContainerStyle={styles.tabContent}>
      <Text style={styles.homeTitle}>Profile</Text>

      <View style={styles.heroForecastCard}>
        <Text style={styles.heroForecastTitle}>Roman</Text>
        <Text style={styles.heroForecastSubtitle}>
          Dara uses your routines, trends and environment to generate guidance.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Connected areas</Text>
      <View style={styles.infoCard}>
        <Text style={styles.infoText}>• Sleep and activity</Text>
        <Text style={styles.infoText}>• Nutrition and recovery</Text>
        <Text style={styles.infoText}>• Financial stability</Text>
        <Text style={styles.infoText}>• External market context</Text>
      </View>

      <Text style={styles.sectionTitle}>Preferences</Text>
      <View style={styles.infoCard}>
        <Text style={styles.infoText}>• Tone: balanced and direct</Text>
        <Text style={styles.infoText}>• Alerts: medium and high priority</Text>
        <Text style={styles.infoText}>• Focus: discipline, prediction, action</Text>
      </View>
    </ScrollView>
  );
}

function MainApp() {
  const [tab, setTab] = useState<Tab>("home");

  return (
    <SafeAreaView style={styles.mainAppContainer}>
      <View style={styles.mainContent}>
        {tab === "home" && <HomeTab />}
        {tab === "forecast" && <ForecastTab />}
        {tab === "insights" && <InsightsTab />}
        {tab === "profile" && <ProfileTab />}
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
    return <AuthScreen onDone={() => setScreen("app")} />;
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
