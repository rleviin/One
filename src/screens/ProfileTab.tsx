import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";

export default function ProfileTab() {
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

const styles = StyleSheet.create({
heroForecastCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 24,
    padding: 20,
    marginBottom: 22,
  },

heroForecastSubtitle: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 15,
    lineHeight: 22,
  },

heroForecastTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "700",
    marginBottom: 8,
  },

homeTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 18,
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

sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },

tabContent: {
    padding: 20,
    paddingBottom: 110,
  },
});
