import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");

type SlideCard = {
  title: string;
  value?: string;
  subtitle?: string;
  small?: string;
  tone?: "blue" | "purple" | "orange";
};

type Slide = {
  headline: string;
  subheadline: string;
  cards: SlideCard[];
  cta: string;
};

const slides: Slide[] = [
  {
    headline: "Hi, I’m Dara",
    subheadline: "I don’t just track — I predict and guide.",
    cta: "Next",
    cards: [
      {
        title: "Insight",
        value: "89%",
        subtitle: "Pattern confidence",
        tone: "orange",
      },
      {
        title: "Jan 25",
        subtitle: "Next pressure point",
        tone: "purple",
      },
      {
        title: "Balance",
        subtitle: "Signals becoming clearer",
        tone: "blue",
      },
    ],
  },
  {
    headline: "I see patterns early",
    subheadline: "Before small signals turn into real problems.",
    cta: "Next",
    cards: [
      {
        title: "Energy trend",
        subtitle: "Your current pace may lead to fatigue",
        tone: "blue",
      },
      {
        title: "Recovery",
        subtitle: "Rest is recommended this week",
        tone: "purple",
      },
      {
        title: "Burnout risk",
        value: "↑",
        subtitle: "Increasing by end of month",
        tone: "orange",
      },
    ],
  },
  {
    headline: "I connect life signals",
    subheadline: "Health, money and daily habits influence each other.",
    cta: "Next",
    cards: [
      {
        title: "Vitamin D",
        subtitle: "Below optimal levels",
        tone: "purple",
      },
      {
        title: "Income stability",
        subtitle: "Risk detected — consider diversifying sources",
        tone: "blue",
      },
      {
        title: "Nutrition",
        subtitle: "Small adjustments can improve your balance",
        tone: "orange",
      },
    ],
  },
  {
    headline: "I help you stay balanced",
    subheadline: "Clarity now means fewer problems later.",
    cta: "Get Started",
    cards: [
      {
        title: "Guidance",
        subtitle: "Sleep, activity and focus can be adjusted early",
        tone: "blue",
      },
      {
        title: "Forecast",
        subtitle: "See what is changing before it becomes urgent",
        tone: "purple",
      },
      {
        title: "Dara",
        subtitle: "Less noise. Better decisions.",
        tone: "orange",
      },
    ],
  },
];

function BlobVisual() {
  return (
    <View style={styles.blobWrap}>
      <View style={[styles.blobGlow, styles.blobGlowOne]} />
      <View style={[styles.blobGlow, styles.blobGlowTwo]} />

      <View style={styles.blobBase}>
        <View style={styles.blobLayerOne} />
        <View style={styles.blobLayerTwo} />
        <View style={styles.blobLayerThree} />
      </View>
    </View>
  );
}

function FloatingCard({ card, style }: { card: SlideCard; style?: any }) {
  const toneStyle = useMemo(() => {
    switch (card.tone) {
      case "orange":
        return styles.cardToneOrange;
      case "purple":
        return styles.cardTonePurple;
      default:
        return styles.cardToneBlue;
    }
  }, [card.tone]);

  return (
    <View style={[styles.floatCard, toneStyle, style]}>
      <Text style={styles.floatCardTitle}>{card.title}</Text>
      {!!card.value && <Text style={styles.floatCardValue}>{card.value}</Text>}
      {!!card.subtitle && <Text style={styles.floatCardSubtitle}>{card.subtitle}</Text>}
      {!!card.small && <Text style={styles.floatCardSmall}>{card.small}</Text>}
    </View>
  );
}

function OnboardingScreen({
  index,
  total,
  slide,
  onNext,
}: {
  index: number;
  total: number;
  slide: Slide;
  onNext: () => void;
}) {
  return (
    <SafeAreaView style={styles.onboardingContainer}>
      <View style={styles.onboardingBg}>
        <View style={styles.bgAuraTop} />
        <View style={styles.bgAuraBottom} />

        <View style={styles.visualArea}>
          <FloatingCard
            card={slide.cards[0]}
            style={{ top: 10, left: Math.max(10, width * 0.08) }}
          />
          <FloatingCard
            card={slide.cards[1]}
            style={{ top: 44, left: width * 0.27 }}
          />
          <FloatingCard
            card={slide.cards[2]}
            style={{ top: 18, right: Math.max(10, width * 0.08) }}
          />

          <BlobVisual />
        </View>

        <View style={styles.textArea}>
          <Text style={styles.heroTitle}>{slide.headline}</Text>
          <Text style={styles.heroSubtitle}>{slide.subheadline}</Text>

          <View style={styles.dotsRow}>
            {Array.from({ length: total }).map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === index && styles.dotActive]}
              />
            ))}
          </View>
        </View>

        <View style={styles.ctaArea}>
          <Pressable style={styles.heroButton} onPress={onNext}>
            <Text style={styles.heroButtonText}>{slide.cta}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function AuthScreen() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = () => {
    console.log({ mode, email, password, name });
  };

  return (
    <SafeAreaView style={styles.authContainer}>
      <View style={styles.bgGlowOne} />
      <View style={styles.bgGlowTwo} />

      <View style={styles.card}>
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

        <Text style={styles.title}>
          {mode === "login" ? "Welcome back" : "Create your account"}
        </Text>

        <Text style={styles.subtitle}>
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

        <Pressable style={styles.button} onPress={handleSubmit}>
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

export default function App() {
  const [screen, setScreen] = useState<"onboarding" | "auth">("onboarding");
  const [step, setStep] = useState(0);

  if (screen === "auth") {
    return <AuthScreen />;
  }

  const currentSlide = slides[step];

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep((prev) => prev + 1);
      return;
    }
    setScreen("auth");
  };

  return (
    <OnboardingScreen
      index={step}
      total={slides.length}
      slide={currentSlide}
      onNext={handleNext}
    />
  );
}

const styles = StyleSheet.create({
  onboardingContainer: {
    flex: 1,
    backgroundColor: "#050816",
  },
  onboardingBg: {
    flex: 1,
    backgroundColor: "#050816",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 26,
  },
  bgAuraTop: {
    position: "absolute",
    top: 40,
    left: 10,
    width: 260,
    height: 260,
    borderRadius: 999,
    backgroundColor: "rgba(73,87,255,0.16)",
  },
  bgAuraBottom: {
    position: "absolute",
    bottom: 120,
    right: 10,
    width: 260,
    height: 260,
    borderRadius: 999,
    backgroundColor: "rgba(52,193,255,0.14)",
  },
  visualArea: {
    height: 390,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  blobWrap: {
    width: 290,
    height: 290,
    alignItems: "center",
    justifyContent: "center",
  },
  blobGlow: {
    position: "absolute",
    borderRadius: 999,
  },
  blobGlowOne: {
    width: 280,
    height: 280,
    backgroundColor: "rgba(255,122,72,0.28)",
  },
  blobGlowTwo: {
    width: 320,
    height: 320,
    backgroundColor: "rgba(82,168,255,0.18)",
  },
  blobBase: {
    width: 250,
    height: 220,
    borderRadius: 90,
    backgroundColor: "#FFA35C",
    transform: [{ rotate: "12deg" }],
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  blobLayerOne: {
    position: "absolute",
    width: 220,
    height: 190,
    borderRadius: 80,
    backgroundColor: "#FF8A66",
    top: 4,
    left: 0,
  },
  blobLayerTwo: {
    position: "absolute",
    width: 190,
    height: 170,
    borderRadius: 76,
    backgroundColor: "#D65DFF",
    bottom: 22,
    left: 35,
    opacity: 0.92,
  },
  blobLayerThree: {
    position: "absolute",
    width: 150,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#72D8FF",
    right: 10,
    bottom: 18,
    opacity: 0.95,
  },
  floatCard: {
    position: "absolute",
    width: 150,
    minHeight: 100,
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  cardToneBlue: {
    backgroundColor: "rgba(29,48,112,0.88)",
  },
  cardTonePurple: {
    backgroundColor: "rgba(56,48,122,0.88)",
  },
  cardToneOrange: {
    backgroundColor: "rgba(63,59,115,0.9)",
  },
  floatCardTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  floatCardValue: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
  },
  floatCardSubtitle: {
    color: "rgba(255,255,255,0.84)",
    fontSize: 13,
    lineHeight: 18,
  },
  floatCardSmall: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 11,
    marginTop: 8,
  },
  textArea: {
    alignItems: "center",
    paddingHorizontal: 12,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.84)",
    fontSize: 17,
    lineHeight: 26,
    textAlign: "center",
    maxWidth: 320,
  },
  dotsRow: {
    flexDirection: "row",
    marginTop: 20,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.24)",
  },
  dotActive: {
    width: 22,
    backgroundColor: "#FFFFFF",
  },
  ctaArea: {
    alignItems: "center",
    paddingBottom: 8,
  },
  heroButton: {
    minWidth: 220,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    paddingVertical: 18,
    paddingHorizontal: 28,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#7FD2FF",
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
  bgGlowOne: {
    position: "absolute",
    top: 120,
    left: 30,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "rgba(123,110,246,0.18)",
  },
  bgGlowTwo: {
    position: "absolute",
    bottom: 120,
    right: 20,
    width: 200,
    height: 200,
    borderRadius: 999,
    backgroundColor: "rgba(56,189,248,0.14)",
  },
  card: {
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
  title: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 8,
  },
  subtitle: {
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
});
