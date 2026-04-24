import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
type RiskLevel = "low" | "medium" | "high";
type Screen = "onboarding" | "auth" | "app";
type Tab = "home" | "forecast" | "insights" | "profile";
type HomeData = {
  hero: string;
  sub: string;
  why: string[];
  context: string;
  actions: string[];
};

function OnboardingScreen({ onDone }: { onDone: () => void }) {
  return (
    <SafeAreaView style={styles.onboardingContainer}>
      <View style={styles.onboardingGlowOne} />
      <View style={styles.onboardingGlowTwo} />

      <View style={styles.onboardingTop}>
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
  const [risk, setRisk] = useState<RiskLevel>("medium");

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

  return (
    <ScrollView contentContainerStyle={styles.tabContent}>
      <Text style={styles.homeTitle}>Dara Forecast</Text>

      <View style={styles.segmentWrap}>
        {(["low", "medium", "high"] as RiskLevel[]).map((level) => (
          <Pressable
            key={level}
            style={[styles.segmentBtn, risk === level && styles.segmentBtnActive]}
            onPress={() => setRisk(level)}
          >
            <Text style={[styles.segmentText, risk === level && styles.segmentTextActive]}>
              {level}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.heroForecastCard}>
        <Text style={styles.heroForecastTitle}>{data.hero}</Text>
        <Text style={styles.heroForecastSubtitle}>{data.sub}</Text>
      </View>

      <Text style={styles.sectionTitle}>Why Dara thinks so</Text>
      <View style={styles.infoCard}>
        {data.why.map((item, i) => (
          <Text key={i} style={styles.infoText}>
            • {item}
          </Text>
        ))}
      </View>

      <Text style={styles.sectionTitle}>If ignored</Text>
      <View style={styles.infoCard}>
        {data.consequence.map((item, i) => (
          <Text key={i} style={styles.infoText}>
            → {item}
          </Text>
        ))}
      </View>

      <Text style={styles.sectionTitle}>External context</Text>
      <View style={styles.infoCard}>
        <Text style={styles.infoText}>{data.context}</Text>
      </View>

      <Text style={styles.sectionTitle}>Do today</Text>
      <View style={styles.infoCard}>
        {data.actions.map((item, i) => (
          <Text key={i} style={styles.infoText}>
            • {item}
          </Text>
        ))}
      </View>

      <View style={styles.quickActionsRow}>
        <Pressable style={styles.quickBtn}>
          <Text style={styles.quickText}>Recovery</Text>
        </Pressable>
        <Pressable style={styles.quickBtn}>
          <Text style={styles.quickText}>Finance</Text>
        </Pressable>
        <Pressable style={styles.quickBtn}>
          <Text style={styles.quickText}>Reset</Text>
        </Pressable>
      </View>
    </ScrollView>
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
      <View style={styles.homeGlowOne} />
      <View style={styles.homeGlowTwo} />

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
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },
  quickBtn: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  quickText: {
    color: "#FFFFFF",
    fontWeight: "600",
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
  tabBarTextActive: {
    color: "#FFFFFF",
  },
});
