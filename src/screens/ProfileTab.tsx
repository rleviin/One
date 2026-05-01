import React from "react";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type ProfileTabProps = {
  onOpenSetup?: () => void;
};

const connectedAreas = [
  {
    title: "Health signals",
    text: "Sleep, activity, recovery and nutrition.",
    icon: "fitness-outline" as const,
    color: "#58E7FF",
  },
  {
    title: "Money pressure",
    text: "Income, spending range and financial load.",
    icon: "card-outline" as const,
    color: "#7DA2FF",
  },
  {
    title: "World context",
    text: "Country, inflation, markets and external risks.",
    icon: "earth-outline" as const,
    color: "#C96BFF",
  },
  {
    title: "Daily context",
    text: "Notes, events, meal photos and what changed today.",
    icon: "create-outline" as const,
    color: "#FF8A4C",
  },
];

const preferences = [
  "Tone: balanced and direct",
  "Alerts: medium and high priority",
  "Focus: prediction, context and action",
];

export default function ProfileTab({ onOpenSetup }: ProfileTabProps) {
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
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.eyebrow}>PROFILE</Text>
            <Text style={styles.title}>Roman</Text>
          </View>

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>R</Text>
          </View>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Ionicons name="sparkles-outline" size={24} color="#B9C6FF" />
          </View>

          <Text style={styles.heroTitle}>Your Dara baseline</Text>
          <Text style={styles.heroText}>
            Dara uses your routines, trends, environment and daily context to
            generate guidance that fits your life.
          </Text>
        </View>

        <Pressable style={styles.setupCard} onPress={onOpenSetup}>
          <View style={styles.setupIcon}>
            <Ionicons name="person-circle-outline" size={26} color="#FFFFFF" />
          </View>

          <View style={styles.setupTextBlock}>
            <Text style={styles.setupTitle}>Personal baseline</Text>
            <Text style={styles.setupText}>
              Edit country, age, sleep goal, work style and finance context.
            </Text>
          </View>

          <View style={styles.arrowCircle}>
            <Ionicons
              name="chevron-forward"
              size={22}
              color="rgba(255,255,255,0.86)"
            />
          </View>
        </Pressable>

        <Text style={styles.sectionTitle}>Connected areas</Text>

        <View style={styles.areaGrid}>
          {connectedAreas.map((area) => (
            <View key={area.title} style={styles.areaCard}>
              <View
                style={[
                  styles.areaIcon,
                  {
                    borderColor: `${area.color}66`,
                    backgroundColor: `${area.color}18`,
                  },
                ]}
              >
                <Ionicons name={area.icon} size={22} color={area.color} />
              </View>

              <Text style={styles.areaTitle}>{area.title}</Text>
              <Text style={styles.areaText}>{area.text}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Preferences</Text>

        <View style={styles.preferencesCard}>
          {preferences.map((item) => (
            <View key={item} style={styles.preferenceRow}>
              <View style={styles.preferenceDot} />
              <Text style={styles.preferenceText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.privacyCard}>
          <Ionicons name="lock-closed-outline" size={18} color="#B9C6FF" />
          <Text style={styles.privacyText}>
            Your data should stay transparent, editable and under your control.
          </Text>
        </View>
      </ScrollView>
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
    backgroundColor: "rgba(3, 7, 18, 0.54)",
  },

  content: {
    paddingTop: 22,
    paddingHorizontal: 20,
    paddingBottom: 140,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  eyebrow: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 3,
    marginBottom: 6,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 38,
    lineHeight: 42,
    fontWeight: "900",
    letterSpacing: -1.2,
  },

  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
  },

  heroCard: {
    borderRadius: 30,
    padding: 20,
    backgroundColor: "rgba(8, 16, 38, 0.56)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    marginBottom: 14,
  },

  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(120,150,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(185,198,255,0.28)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    lineHeight: 29,
    fontWeight: "900",
    marginBottom: 8,
  },

  heroText: {
    color: "rgba(255,255,255,0.66)",
    fontSize: 15,
    lineHeight: 22,
  },

  setupCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 28,
    padding: 16,
    backgroundColor: "rgba(120,150,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(185,198,255,0.26)",
    marginBottom: 24,
  },

  setupIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(120,150,255,0.24)",
    borderWidth: 1,
    borderColor: "rgba(185,198,255,0.34)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  setupTextBlock: {
    flex: 1,
  },

  setupTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "900",
    marginBottom: 4,
  },

  setupText: {
    color: "rgba(255,255,255,0.66)",
    fontSize: 14,
    lineHeight: 19,
  },

  arrowCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "900",
    letterSpacing: -0.5,
    marginBottom: 12,
  },

  areaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },

  areaCard: {
    width: "48%",
    minHeight: 160,
    borderRadius: 26,
    padding: 15,
    backgroundColor: "rgba(8, 16, 38, 0.54)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },

  areaIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  areaTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "900",
    marginBottom: 6,
  },

  areaText: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 13,
    lineHeight: 18,
  },

  preferencesCard: {
    borderRadius: 26,
    padding: 18,
    backgroundColor: "rgba(8, 16, 38, 0.54)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    marginBottom: 14,
  },

  preferenceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  preferenceDot: {
    width: 7,
    height: 7,
    borderRadius: 99,
    backgroundColor: "#B9C6FF",
    marginRight: 10,
  },

  preferenceText: {
    flex: 1,
    color: "rgba(255,255,255,0.72)",
    fontSize: 15,
    lineHeight: 21,
  },

  privacyCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 22,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  privacyText: {
    flex: 1,
    color: "rgba(255,255,255,0.62)",
    fontSize: 13,
    lineHeight: 18,
    marginLeft: 10,
  },
});
