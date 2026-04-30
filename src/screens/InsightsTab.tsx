import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";

export default function InsightsTab() {
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
