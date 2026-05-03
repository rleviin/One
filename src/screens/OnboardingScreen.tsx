import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
type OnboardingScreenProps = {
  onDone: () => void;
};

export default function OnboardingScreen({ onDone }: OnboardingScreenProps) {
  return (
    <ImageBackground
      source={require("../../assets/onboarding-bg_0.png")}
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
    backgroundColor: "rgba(3, 7, 18, 0.42)",
  },

  welcomeContainer: {
    flex: 1,
    backgroundColor: "transparent",
    overflow: "hidden",
  },

  welcomeContent: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 30,
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
    fontSize: 30,
    lineHeight: 35,
    fontWeight: "900",
    letterSpacing: -1.1,
    marginBottom: 16,
  },

  welcomeSubtitle: {
    color: "rgba(255,255,255,0.60)",
    fontSize: 14,
    lineHeight: 22,
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
});
