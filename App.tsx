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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
type RiskLevel = "low" | "medium" | "high";
type Screen = "onboarding" | "auth" | "app";
type Tab = "home" | "forecast" | "insights" | "profile";
type UserSignals = {
  sleepHours: number;
  workload: number;
  recovery: number;
  spendingPressure: number;
};
type HomeData = {
  hero: string;
  sub: string;
  why: string[];
  context: string;
  actions: string[];
  consequence: string[];
};
type MetricCardProps = {
  label: string;
  value: string;
  hint: string;
  tone: "blue" | "green" | "amber" | "red" | "purple";
};
function calculateRisk(signals: UserSignals): RiskLevel {
  const score =
    (8 - signals.sleepHours) * 1.2 +
    signals.workload * 1.1 -
    signals.recovery * 0.9 +
    signals.spendingPressure * 0.8;

  if (score >= 10) return "high";
  if (score >= 5) return "medium";
  return "low";
}

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
function getSleepRecommendation(hours: number) {
  if (hours < 6) return "Add 1.5–2h tonight";
  if (hours < 7) return "Aim for 7.5h tonight";
  if (hours < 8) return "Good range. Keep it stable";
  return "Sleep is supporting recovery";
}

function getWorkloadRecommendation(workload: number) {
  if (workload >= 8) return "Reduce non-essential tasks";
  if (workload >= 6) return "Keep load under control";
  return "Workload is manageable";
}

function getRecoveryRecommendation(recovery: number) {
  if (recovery <= 4) return "Prioritize recovery today";
  if (recovery <= 6) return "Add one recovery activity";
  return "Recovery is compensating well";
}

function getFinanceRecommendation(pressure: number) {
  if (pressure >= 7) return "Avoid major commitments";
  if (pressure >= 5) return "Reduce unnecessary spending";
  return "Financial pressure is stable";
}

function OnboardingScreen({ onDone }: { onDone: () => void }) {
  return (
    <SafeAreaView style={styles.onboardingContainer}>
      <View style={styles.onboardingGlowOne} />
      <View style={styles.onboardingGlowTwo} />

      <View style={styles.onboardingTop}>
      <Text style={styles.brandEyebrow}>Dara AI</Text>
        <View style={styles.topCardsRow}>
          <View style={[styles.miniCard, styles.miniCardPurple]}>
            <Text style={styles.miniCardTitle}>Insight</Text>
            <Text style={styles.miniCardValue}>89%</Text>
            <Text style={styles.miniCardText}>Pattern confidence</Text>
          </View>

          <View style={[styles.miniCard, styles.miniCardBlue, { marginTop: 18 }]}>
            <Text style={styles.miniCardTitle}>Jan 25</Text>
            <Text style={styles.miniCardText}>Next pressure point</Text>
          </View>

          <View style={[styles.miniCard, styles.miniCardIndigo]}>
            <Text style={styles.miniCardTitle}>Balance</Text>
            <Text style={styles.miniCardText}>Signals becoming clearer</Text>
          </View>
        </View>

        <View style={styles.blobWrap}>
          <View style={styles.blobAura} />
          <View style={styles.blobOuter}>
            <View style={styles.blobInner} />
            <View style={styles.blobCore} />
          </View>
        </View>
      </View>

      <View style={styles.onboardingBottom}>
        <Text style={styles.eyebrow}>Dara</Text>
        <Text style={styles.onboardingTitle}>Hi, I’m Dara</Text>
        <Text style={styles.onboardingSubtitle}>
          I don’t just track — I predict and guide.
        </Text>

        <Pressable style={styles.heroButton} onPress={onDone}>
          <Text style={styles.heroButtonText}>Get Started</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function AuthScreen({ onDone }: { onDone: () => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  return (
    <SafeAreaView style={styles.authContainer}>
      <View style={styles.authBgGlowOne} />
      <View style={styles.authBgGlowTwo} />

      <View style={styles.authCard}>
        <View style={styles.headerRow}>
          <Text style={styles.brand}>Dara</Text>

          <View style={styles.switch}>
            <Pressable
              style={[styles.switchTab, mode === "login" && styles.switchTabActive]}
              onPress={() => setMode("login")}
            >
              <Text
                style={[
                  styles.switchText,
                  mode === "login" && styles.switchTextActive,
                ]}
              >
                Log in
              </Text>
            </Pressable>

            <Pressable
              style={[styles.switchTab, mode === "signup" && styles.switchTabActive]}
              onPress={() => setMode("signup")}
            >
              <Text
                style={[
                  styles.switchText,
                  mode === "signup" && styles.switchTextActive,
                ]}
              >
                Sign up
              </Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.authTitle}>
          {mode === "login" ? "Welcome back" : "Create your account"}
        </Text>

        <Text style={styles.authSubtitle}>
          {mode === "login"
            ? "Log in to continue with Dara"
            : "Start your journey with Dara"}
        </Text>

        {mode === "signup" && (
          <TextInput
            placeholder="Full name"
            placeholderTextColor="#8A8A8F"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />
        )}

        <TextInput
          placeholder="Email"
          placeholderTextColor="#8A8A8F"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#8A8A8F"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />

        {mode === "login" && (
          <Text style={styles.helperText}>Forgot password?</Text>
        )}

        <Pressable style={styles.button} onPress={onDone}>
          <Text style={styles.buttonText}>
            {mode === "login" ? "Log in" : "Create account"}
          </Text>
        </Pressable>

        <Text style={styles.footerText}>
          By continuing, you agree to our Terms and Privacy Policy.
        </Text>
      </View>
    </SafeAreaView>
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

      <Text style={styles.homeSectionTitle}>Actions</Text>

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
          <Text style={styles.actionCardTitle}>Recovery</Text>
          <Text style={styles.actionCardText}>
            Boost recovery and lower load.
          </Text>
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
            <Text style={styles.actionCardTitle}>Finance</Text>
            <Text style={styles.actionCardText}>
              Reduce external pressure.
            </Text>
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
            <Text style={styles.actionCardTitle}>Reset</Text>
            <Text style={styles.actionCardText}>
              Return to baseline.
            </Text>
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
    return <OnboardingScreen onDone={() => setScreen("auth")} />;
  }

  if (screen === "auth") {
    return <AuthScreen onDone={() => setScreen("app")} />;
  }

  return <MainApp />;
}

const styles = StyleSheet.create({
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
    backgroundColor: "#0B1020",
    justifyContent: "center",
    padding: 20,
  },
  authBgGlowOne: {
    position: "absolute",
    top: 120,
    left: 30,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "rgba(123,110,246,0.18)",
  },
  authBgGlowTwo: {
    position: "absolute",
    bottom: 120,
    right: 20,
    width: 200,
    height: 200,
    borderRadius: 999,
    backgroundColor: "rgba(56,189,248,0.14)",
  },
  authCard: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 28,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
    maxWidth: 460,
    width: "100%",
    alignSelf: "center",
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
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#5B6472",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#F5F4F1",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#111111",
    marginBottom: 12,
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
  paddingTop: IS_COMPACT_HOME ? 8 : 14,
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
  minHeight: IS_COMPACT_HOME ? 150 : 166,
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
},

actionCardLarge: {
  flex: 1.08,
  minHeight: IS_COMPACT_HOME ? 128 : 148,
},

actionCardStack: {
  flex: 1,
  gap: 14,
},

actionCardSmall: {
  minHeight: IS_COMPACT_HOME ? 62 : 72,
},

actionRecovery: {
  backgroundColor: "rgba(32, 22, 58, 0.92)",
  borderColor: "rgba(190, 105, 255, 0.24)",
},

actionFinance: {
  backgroundColor: "rgba(16, 36, 46, 0.92)",
  borderColor: "rgba(92, 220, 255, 0.22)",
},

actionReset: {
  backgroundColor: "rgba(46, 24, 18, 0.92)",
  borderColor: "rgba(255, 128, 80, 0.22)",
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
