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

type RiskLevel = "low" | "medium" | "high";
type Screen = "onboarding" | "auth" | "home";

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

function HomeScreen() {
  const [risk, setRisk] = useState<RiskLevel>("medium");

  const data = useMemo<HomeData>(() => {
    if (risk === "low") {
      return {
        hero: "Your system is stable",
        sub: "Current patterns support balance. Maintain your rhythm.",
        why: [
          "Sleep consistency is stable",
          "Workload is within limits",
          "Recovery is sufficient",
        ],
        context: "No major external pressure signals detected right now.",
        actions: [
          "Keep your routine consistent",
          "Maintain current activity level",
          "Avoid unnecessary overload",
        ],
      };
    }

    if (risk === "high") {
      return {
        hero: "You are pushing beyond sustainable limits",
        sub: "If nothing changes, fatigue is highly likely.",
        why: [
          "Sleep quality dropped significantly",
          "Workload increased beyond recovery",
          "Stress signals are accumulating",
        ],
        context: "External pressure is increasing, including inflation and workload instability.",
        actions: [
          "Stop non-essential tasks today",
          "Prioritize recovery over output",
          "Reduce cognitive load immediately",
        ],
      };
    }

    return {
      hero: "Your current pace may lead to fatigue",
      sub: "A small adjustment now will keep your balance stable.",
      why: [
        "Sleep slightly decreased",
        "Workload is trending upward",
        "Recovery is not fully compensating",
      ],
      context: "Financial pressure trends are rising in your environment.",
      actions: [
        "Reduce workload slightly",
        "Increase hydration and rest",
        "Add a short recovery activity",
      ],
    };
  }, [risk]);

  return (
    <SafeAreaView style={styles.homeContainer}>
      <View style={styles.homeGlowOne} />
      <View style={styles.homeGlowTwo} />

      <ScrollView contentContainerStyle={styles.homeContent}>
        <View style={styles.homeHeader}>
          <View>
            <Text style={styles.homeEyebrow}>Dara forecast</Text>
            <Text style={styles.homeWelcome}>Good evening</Text>
          </View>
        </View>

        <View style={styles.segmentWrap}>
          <Pressable
            style={[styles.segmentBtn, risk === "low" && styles.segmentBtnActive]}
            onPress={() => setRisk("low")}
          >
            <Text
              style={[
                styles.segmentText,
                risk === "low" && styles.segmentTextActive,
              ]}
            >
              Stable
            </Text>
          </Pressable>

          <Pressable
            style={[styles.segmentBtn, risk === "medium" && styles.segmentBtnActive]}
            onPress={() => setRisk("medium")}
          >
            <Text
              style={[
                styles.segmentText,
                risk === "medium" && styles.segmentTextActive,
              ]}
            >
              Attention
            </Text>
          </Pressable>

          <Pressable
            style={[styles.segmentBtn, risk === "high" && styles.segmentBtnActive]}
            onPress={() => setRisk("high")}
          >
            <Text
              style={[
                styles.segmentText,
                risk === "high" && styles.segmentTextActive,
              ]}
            >
              Critical
            </Text>
          </Pressable>
        </View>

        <View style={styles.heroForecastCard}>
          <Text style={styles.heroForecastTitle}>{data.hero}</Text>
          <Text style={styles.heroForecastSubtitle}>{data.sub}</Text>
        </View>

        <Text style={styles.sectionTitle}>Why</Text>
        <View style={styles.insightCard}>
          {data.why.map((item, i) => (
            <Text key={i} style={styles.insightText}>
              • {item}
            </Text>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Context</Text>
        <View style={styles.insightCard}>
          <Text style={styles.insightText}>{data.context}</Text>
        </View>

        <Text style={styles.sectionTitle}>Today</Text>
        <View style={styles.focusCard}>
          {data.actions.map((item, i) => (
            <Text key={i} style={styles.focusItem}>
              • {item}
            </Text>
          ))}
        </View>

        <Pressable style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Adjust my plan</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("onboarding");

  if (screen === "onboarding") {
    return <OnboardingScreen onDone={() => setScreen("auth")} />;
  }

  if (screen === "auth") {
    return <AuthScreen onDone={() => setScreen("home")} />;
  }

  return <HomeScreen />;
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

  homeContainer: {
    flex: 1,
    backgroundColor: "#060B18",
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
  homeContent: {
    padding: 20,
    paddingBottom: 40,
  },
  homeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  homeEyebrow: {
    color: "rgba(255,255,255,0.54)",
    fontSize: 13,
    marginBottom: 4,
  },
  homeWelcome: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
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
  insightCard: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
  },
  insightTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
  },
  insightText: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 14,
    lineHeight: 21,
  },
  focusCard: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
  },
  focusItem: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 24,
  },
  primaryButton: {
    backgroundColor: "#1E40FF",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
