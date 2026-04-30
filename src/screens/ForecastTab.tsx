import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";

export default function ForecastTab() {
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
