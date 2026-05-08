import React from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ScreenBackground from "../components/ScreenBackground";
import AnimatedPressable from "../components/AnimatedPressable";
import { lightTap } from "../haptics";

type PremiumScreenProps = {
  onDone: () => void;
};

const premiumFeatures = [
  {
    title: "Full check-in history",
    text: "See long-term patterns across days, weeks and months.",
    icon: "calendar-outline" as const,
    color: "#58E7FF",
  },
  {
    title: "Unlimited context memory",
    text: "Add more notes, meals, events and daily changes.",
    icon: "sparkles-outline" as const,
    color: "#B9C6FF",
  },
  {
    title: "Context calendar",
    text: "Understand which days were affected by sleep, stress, food or events.",
    icon: "map-outline" as const,
    color: "#C96BFF",
  },
  {
    title: "Meal and photo analysis",
    text: "Later Dara will connect meals and photos with energy and recovery.",
    icon: "restaurant-outline" as const,
    color: "#FF8A4C",
  },
  {
    title: "PDF reports",
    text: "Export selected periods with check-ins, context and recommendations.",
    icon: "document-text-outline" as const,
    color: "#7DA2FF",
  },
  {
    title: "Deeper insights",
    text: "Dara will explain what may be influencing your patterns.",
    icon: "analytics-outline" as const,
    color: "#4FE18B",
  },
];

export default function PremiumScreen({ onDone }: PremiumScreenProps) {
  return (
    <ScreenBackground source={require("../../assets/onboarding-bg.png")}>
      <SafeAreaView style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.headerRow}>
            <AnimatedPressable
              style={styles.closeButton}
              pressedScale={0.94}
              onPress={() => {
                lightTap();
                onDone();
              }}
            >
              <Ionicons name="close-outline" size={26} color="#FFFFFF" />
            </AnimatedPressable>

            <Text style={styles.headerLabel}>DARA PREMIUM</Text>

            <View style={styles.closeButtonGhost} />
          </View>

          <View style={styles.heroCard}>
            <View style={styles.heroIcon}>
              <Ionicons name="diamond-outline" size={27} color="#FFFFFF" />
            </View>

            <Text style={styles.heroTitle}>Unlock Dara’s full memory</Text>

            <Text style={styles.heroText}>
              Premium will help Dara connect your check-ins, context, health
              signals and long-term patterns into clearer guidance.
            </Text>

            <View style={styles.pricePill}>
              <Text style={styles.priceText}>Premium preview</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>What Premium unlocks</Text>

          <View style={styles.featuresList}>
            {premiumFeatures.map((feature) => (
              <View key={feature.title} style={styles.featureCard}>
                <View
                  style={[
                    styles.featureIcon,
                    {
                      borderColor: `${feature.color}66`,
                      backgroundColor: `${feature.color}18`,
                    },
                  ]}
                >
                  <Ionicons
                    name={feature.icon}
                    size={22}
                    color={feature.color}
                  />
                </View>

                <View style={styles.featureTextBlock}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureText}>{feature.text}</Text>
                </View>
              </View>
            ))}
          </View>

          <AnimatedPressable
            style={styles.primaryButton}
            pressedScale={0.97}
            onPress={() => {
              lightTap();
            }}
          >
            <Text style={styles.primaryButtonText}>Start Premium later</Text>
          </AnimatedPressable>

          <Text style={styles.hintText}>
            Payments are not connected yet. This screen is a placeholder for the
            future App Store subscription flow.
          </Text>

          <Pressable style={styles.skipButton} onPress={onDone}>
            <Text style={styles.skipButtonText}>Maybe later</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    paddingTop: 18,
    paddingHorizontal: 20,
    paddingBottom: 140,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },

  closeButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },

  closeButtonGhost: {
    width: 54,
    height: 54,
  },

  headerLabel: {
    color: "rgba(255,255,255,0.74)",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 4,
  },

  heroCard: {
    borderRadius: 34,
    padding: 22,
    backgroundColor: "rgba(8, 16, 38, 0.62)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    marginBottom: 24,
  },

  heroIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 38,
    lineHeight: 43,
    fontWeight: "900",
    letterSpacing: -1.2,
    marginBottom: 10,
  },

  heroText: {
    color: "rgba(255,255,255,0.66)",
    fontSize: 17,
    lineHeight: 25,
    marginBottom: 18,
  },

  pricePill: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "rgba(185,198,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(185,198,255,0.28)",
  },

  priceText: {
    color: "#DDE5FF",
    fontSize: 13,
    fontWeight: "900",
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.5,
    marginBottom: 14,
  },

  featuresList: {
    gap: 12,
    marginBottom: 22,
  },

  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 24,
    padding: 14,
    backgroundColor: "rgba(8, 16, 38, 0.54)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },

  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  featureTextBlock: {
    flex: 1,
  },

  featureTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 4,
  },

  featureText: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 14,
    lineHeight: 20,
  },

  primaryButton: {
    height: 62,
    borderRadius: 31,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonText: {
    color: "#07101F",
    fontSize: 18,
    fontWeight: "900",
  },

  hintText: {
    color: "rgba(255,255,255,0.56)",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 12,
  },

  skipButton: {
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  skipButtonText: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 16,
    fontWeight: "900",
  },
});
