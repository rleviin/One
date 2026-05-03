import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

type ExplanationScreenProps = {
  onDone: () => void;
};

export default function ExplanationScreen({ onDone }: ExplanationScreenProps) {
  return (
    <ImageBackground
      source={require("../../assets/onboarding-bg.png")}
      style={styles.screenBackgroundImage}
      imageStyle={styles.screenBackgroundImageInner}
      resizeMode="cover"
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
                  Sleep, activity, recovery, finances and environment become one
                  clear picture.
                </Text>
              </View>
            </View>

            <View style={styles.explainCard}>
              <View style={styles.explainIconPurple}>
                <Ionicons name="git-branch-outline" size={20} color="#FFFFFF" />
              </View>

              <View style={styles.explainTextBlock}>
                <Text style={styles.explainCardTitle}>
                  Finds hidden patterns
                </Text>
                <Text style={styles.explainCardText}>
                  Dara looks for combinations that are easy to miss, like poor
                  sleep plus rising workload.
                </Text>
              </View>
            </View>

            <View style={styles.explainCard}>
              <View style={styles.explainIconAmber}>
                <Ionicons name="compass-outline" size={20} color="#FFFFFF" />
              </View>

              <View style={styles.explainTextBlock}>
                <Text style={styles.explainCardTitle}>
                  Guides your next move
                </Text>
                <Text style={styles.explainCardText}>
                  It explains why it thinks so and suggests small actions for
                  today.
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

  explainContainer: {
    flex: 1,
    backgroundColor: "transparent",
    overflow: "hidden",
  },

  explainContent: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 28,
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
    fontSize: 26,
    lineHeight: 31,
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

  explainFooter: {
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
