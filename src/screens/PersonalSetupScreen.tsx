import React, { useState } from "react";
import {
  ImageBackground,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type PersonalSetupScreenProps = {
  onDone: () => void;
};

type WorkType = "office" | "active" | "creative" | "student" | "business";

const workTypes: { key: WorkType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "office", label: "Office", icon: "briefcase-outline" },
  { key: "active", label: "Active", icon: "walk-outline" },
  { key: "creative", label: "Creative", icon: "color-palette-outline" },
  { key: "student", label: "Student", icon: "school-outline" },
  { key: "business", label: "Business", icon: "trending-up-outline" },
];

export default function PersonalSetupScreen({ onDone }: PersonalSetupScreenProps) {
  const [country, setCountry] = useState("");
  const [age, setAge] = useState("");
  const [sleepGoal, setSleepGoal] = useState("7.5");
  const [workType, setWorkType] = useState<WorkType>("office");
  const [incomeRange, setIncomeRange] = useState("");
  const [spendingRange, setSpendingRange] = useState("");
  const [dailyContext, setDailyContext] = useState("");

  return (
    <ImageBackground
      source={require("../../assets/onboarding-bg_0.png")}
      style={styles.background}
      imageStyle={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <SafeAreaView style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.header}>
            <Text style={styles.brand}>DARA AI</Text>
            <Text style={styles.title}>Personalize your guidance.</Text>
            <Text style={styles.subtitle}>
              Dara uses your baseline to understand what pressure means for you.
              You can edit this later.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionLabel}>BASIC CONTEXT</Text>

            <View style={styles.row}>
              <View style={styles.fieldHalf}>
                <Text style={styles.inputLabel}>COUNTRY</Text>
                <TextInput
                  value={country}
                  onChangeText={setCountry}
                  placeholder="Germany"
                  placeholderTextColor="rgba(255,255,255,0.42)"
                  style={styles.input}
                />
              </View>

              <View style={styles.fieldHalf}>
                <Text style={styles.inputLabel}>AGE</Text>
                <TextInput
                  value={age}
                  onChangeText={setAge}
                  placeholder="34"
                  placeholderTextColor="rgba(255,255,255,0.42)"
                  keyboardType="number-pad"
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.inputLabel}>SLEEP GOAL</Text>
              <TextInput
                value={sleepGoal}
                onChangeText={setSleepGoal}
                placeholder="7.5"
                placeholderTextColor="rgba(255,255,255,0.42)"
                keyboardType="decimal-pad"
                style={styles.input}
              />
            </View>

            <Text style={styles.sectionLabel}>WORK STYLE</Text>

            <View style={styles.chipGrid}>
              {workTypes.map((item) => {
                const active = workType === item.key;

                return (
                  <Pressable
                    key={item.key}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => setWorkType(item.key)}
                  >
                    <Ionicons
                      name={item.icon}
                      size={18}
                      color={active ? "#FFFFFF" : "rgba(255,255,255,0.62)"}
                    />
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.sectionLabel}>FINANCE PRESSURE</Text>

            <View style={styles.field}>
              <Text style={styles.inputLabel}>MONTHLY INCOME RANGE</Text>
              <TextInput
                value={incomeRange}
                onChangeText={setIncomeRange}
                placeholder="Optional"
                placeholderTextColor="rgba(255,255,255,0.42)"
                style={styles.input}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.inputLabel}>MONTHLY SPENDING RANGE</Text>
              <TextInput
                value={spendingRange}
                onChangeText={setSpendingRange}
                placeholder="Optional"
                placeholderTextColor="rgba(255,255,255,0.42)"
                style={styles.input}
              />
            </View>

            <Text style={styles.sectionLabel}>TODAY CONTEXT</Text>

            <View style={styles.noteBox}>
              <TextInput
                value={dailyContext}
                onChangeText={setDailyContext}
                placeholder="What changed today? New project, stress, meeting, meal, idea..."
                placeholderTextColor="rgba(255,255,255,0.42)"
                multiline
                style={styles.noteInput}
              />
            </View>

            <Pressable style={styles.photoButton}>
              <Ionicons name="camera-outline" size={20} color="#FFFFFF" />
              <Text style={styles.photoButtonText}>Add meal photo later</Text>
            </Pressable>
          </View>

          <View style={styles.privacyCard}>
            <Ionicons name="lock-closed-outline" size={18} color="#B9C6FF" />
            <Text style={styles.privacyText}>
              Dara uses this to personalize guidance. You stay in control.
            </Text>
          </View>

          <Pressable style={styles.primaryButton} onPress={onDone}>
            <Text style={styles.primaryButtonText}>Continue</Text>
          </Pressable>

          <Pressable style={styles.skipButton} onPress={onDone}>
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
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
    backgroundColor: "rgba(3, 7, 18, 0.48)",
  },

  container: {
    flex: 1,
    backgroundColor: "transparent",
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 34,
    paddingBottom: 34,
  },

  header: {
    marginBottom: 22,
  },

  brand: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 5,
    marginBottom: 20,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 36,
    lineHeight: 40,
    fontWeight: "900",
    letterSpacing: -1.2,
    marginBottom: 12,
  },

  subtitle: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 16,
    lineHeight: 23,
  },

  card: {
    borderRadius: 32,
    padding: 20,
    backgroundColor: "rgba(10, 18, 44, 0.58)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    marginBottom: 14,
  },

  sectionLabel: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2.4,
    marginBottom: 12,
    marginTop: 8,
  },

  row: {
    flexDirection: "row",
    gap: 12,
  },

  field: {
    marginBottom: 16,
  },

  fieldHalf: {
    flex: 1,
    marginBottom: 16,
  },

  inputLabel: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 8,
  },

  input: {
    minHeight: 54,
    borderRadius: 18,
    paddingHorizontal: 16,
    color: "#FFFFFF",
    fontSize: 17,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },

  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },

  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },

  chipActive: {
    backgroundColor: "rgba(120, 150, 255, 0.28)",
    borderColor: "rgba(185, 198, 255, 0.36)",
  },

  chipText: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 7,
  },

  chipTextActive: {
    color: "#FFFFFF",
  },

  noteBox: {
    minHeight: 104,
    borderRadius: 22,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    marginBottom: 12,
  },

  noteInput: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 22,
    minHeight: 76,
    textAlignVertical: "top",
  },

  photoButton: {
    minHeight: 52,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  photoButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    marginLeft: 8,
  },

  privacyCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 22,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    marginBottom: 18,
  },

  privacyText: {
    flex: 1,
    color: "rgba(255,255,255,0.66)",
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 10,
  },

  primaryButton: {
    height: 62,
    borderRadius: 31,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  primaryButtonText: {
    color: "#07101F",
    fontSize: 19,
    fontWeight: "900",
  },

  skipButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },

  skipButtonText: {
    color: "rgba(255,255,255,0.54)",
    fontSize: 15,
    fontWeight: "700",
  },
});
