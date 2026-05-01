import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"

type ProfileTabProps = {
  onOpenSetup?: () => void;
};
 
export default function ProfileTab({ onOpenSetup }: ProfileTabProps) {
  return (
    <ScrollView contentContainerStyle={styles.tabContent}>
      <Text style={styles.homeTitle}>Profile</Text>
      
      <View style={styles.heroForecastCard}>
        <Text style={styles.heroForecastTitle}>Roman</Text>
        <Text style={styles.heroForecastSubtitle}>
          Dara uses your routines, trends and environment to generate guidance.
        </Text>
      </View>

      <Pressable style={styles.profileSetupCard} onPress={onOpenSetup}>
        <View style={styles.profileSetupIcon}>
          <Ionicons name="person-circle-outline" size={24} color="#B9C6FF" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.profileSetupTitle}>Personal baseline</Text>
          <Text style={styles.profileSetupText}>
            Edit country, sleep goal, work style and finance context.
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={22}
          color="rgba(255,255,255,0.68)"
        />
      </Pressable>
      
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

profileSetupCard: {
  flexDirection: "row",
  alignItems: "center",
  borderRadius: 24,
  padding: 16,
  backgroundColor: "rgba(255,255,255,0.06)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.12)",
  marginTop: 14,
  marginBottom: 20,
},

profileSetupIcon: {
  width: 46,
  height: 46,
  borderRadius: 23,
  backgroundColor: "rgba(120,150,255,0.16)",
  borderWidth: 1,
  borderColor: "rgba(185,198,255,0.28)",
  alignItems: "center",
  justifyContent: "center",
  marginRight: 14,
},

profileSetupTitle: {
  color: "#FFFFFF",
  fontSize: 18,
  fontWeight: "800",
  marginBottom: 4,
},

profileSetupText: {
  color: "rgba(255,255,255,0.62)",
  fontSize: 14,
  lineHeight: 19,
},
});
