import React, { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  loadDailyCheckIn,
  loadDailyCheckInHistory,
  saveDailyCheckInWithHistory,
} from "../storage";
import { lightTap, successTap } from "../haptics";
import ScreenBackground from "../components/ScreenBackground";

type DailyCheckInScreenProps = {
  onDone: () => void;
  onOpenContext?: () => void;
};

type ScaleKey = "energy" | "stress" | "workload" | "spendingPressure";

const scaleItems: {
  key: ScaleKey;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}[] = [
  {
    key: "energy",
    label: "Energy",
    description: "How much usable energy do you have today?",
    icon: "battery-charging-outline",
    color: "#58E7FF",
  },
  {
    key: "stress",
    label: "Stress",
    description: "How much pressure do you feel right now?",
    icon: "pulse-outline",
    color: "#FF647C",
  },
  {
    key: "workload",
    label: "Workload",
    description: "How heavy does today feel?",
    icon: "briefcase-outline",
    color: "#FF8A4C",
  },
  {
    key: "spendingPressure",
    label: "Money pressure",
    description: "Any financial pressure in the background?",
    icon: "card-outline",
    color: "#7DA2FF",
  },
];

function getDayKey(date: Date | string) {
  const value = typeof date === "string" ? new Date(date) : date;

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function DailyCheckInScreen({
  onDone,
  onOpenContext,
}: DailyCheckInScreenProps) {
  const [values, setValues] = useState<Record<ScaleKey, number>>({
    energy: 6,
    stress: 4,
    workload: 5,
    spendingPressure: 3,
  });

  const [hasSavedToday, setHasSavedToday] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

useEffect(() => {
  async function loadSavedCheckIn() {
    const latest = await loadDailyCheckIn();
    const history = await loadDailyCheckInHistory();

    const todayKey = getDayKey(new Date());

    const todayFromHistory = history.find(
      (item) => getDayKey(item.createdAt) === todayKey
    );

    const todayCheckIn =
      latest && getDayKey(latest.createdAt) === todayKey
        ? latest
        : todayFromHistory;

    if (!todayCheckIn) {
      setHasSavedToday(false);
      return;
    }

    setHasSavedToday(true);

    setValues({
      energy: todayCheckIn.energy,
      stress: todayCheckIn.stress,
      workload: todayCheckIn.workload,
      spendingPressure: todayCheckIn.spendingPressure,
    });

  }

  loadSavedCheckIn();
}, []);

function setScaleValue(key: ScaleKey, value: number) {
  lightTap();

  setValues((current) => ({
    ...current,
    [key]: value,
  }));
}

async function handleSave() {
  if (hasSavedToday || isSaving) {
    return;
  }

  setIsSaving(true);

  try {
    const createdAt = new Date().toISOString();

    await saveDailyCheckInWithHistory({
      energy: values.energy,
      stress: values.stress,
      workload: values.workload,
      spendingPressure: values.spendingPressure,
      note: "",
      mealPhotoUri: null,
      createdAt,
    });

    setHasSavedToday(true);
    await successTap();
  } finally {
    setIsSaving(false);
  }
}

return (
  <ScreenBackground source={require("../../assets/onboarding-bg_0.png")}>
    <SafeAreaView style={styles.container}>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.headerRow}>
            <Pressable style={styles.closeButton} onPress={onDone}>
              <Ionicons name="close-outline" size={26} color="#FFFFFF" />
            </Pressable>

            <Text style={styles.headerLabel}>DAILY CHECK-IN</Text>

            <View style={styles.closeButtonGhost} />
          </View>

          <Text style={styles.title}>What changed today?</Text>

          <Text style={styles.subtitle}>
            Dara uses your daily context to understand pressure, recovery and
            what may happen next.
          </Text>

<Pressable
  style={styles.topContextCard}
  onPress={() => {
    lightTap();
    onOpenContext?.();
  }}
>
  <View style={styles.topContextIcon}>
    <Ionicons name="sparkles-outline" size={22} color="#B9C6FF" />
  </View>

  <View style={styles.topContextTextBlock}>
    <Text style={styles.topContextTitle}>Add today context</Text>
    <Text style={styles.topContextText}>
      Add meals, notes or events during the day. Save your check-in later.
    </Text>
  </View>

  <Ionicons
    name="chevron-forward"
    size={22}
    color="rgba(255,255,255,0.72)"
  />
</Pressable>

          <View style={styles.card}>
            {scaleItems.map((item) => (
              <View key={item.key} style={styles.scaleBlock}>
                <View style={styles.scaleTop}>
                  <View
                    style={[
                      styles.scaleIcon,
                      {
                        borderColor: `${item.color}66`,
                        backgroundColor: `${item.color}18`,
                      },
                    ]}
                  >
                    <Ionicons name={item.icon} size={22} color={item.color} />
                  </View>

                  <View style={styles.scaleTextBlock}>
                    <Text style={styles.scaleTitle}>{item.label}</Text>
                    <Text style={styles.scaleDescription}>
                      {item.description}
                    </Text>
                  </View>

                  <Text style={[styles.scaleValue, { color: item.color }]}>
                    {values[item.key]}
                  </Text>
                </View>

                <View style={styles.scaleDots}>
                  {Array.from({ length: 10 }).map((_, index) => {
                    const value = index + 1;
                    const active = value <= values[item.key];

                    return (
                      <Pressable
                        key={value}
                        style={[
                          styles.scaleDot,
                          active && {
                            backgroundColor: item.color,
                            borderColor: item.color,
                          },
                        ]}
                        onPress={() => setScaleValue(item.key, value)}
                      />
                    );
                  })}
                </View>
              </View>
            ))}
          </View>

{hasSavedToday ? (
  <View style={styles.noteCard}>
    <Text style={styles.sectionLabel}>TODAY CONTEXT</Text>

    <View style={styles.previewCard}>
      <Ionicons name="sparkles-outline" size={20} color="#B9C6FF" />
      <Text style={styles.previewText}>
        Daily check-in is locked for today. You can still add meals, notes and
        events as separate context.
      </Text>
    </View>

    <Pressable
      style={[styles.primaryButton, styles.primaryButtonDisabled]}
      disabled
      onPress={handleSave}
    >
      <Text style={styles.primaryButtonText}>Check-in saved for today</Text>
    </Pressable>

    <Pressable
      style={styles.addContextButton}
      onPress={() => {
        lightTap();
        onOpenContext?.();
      }}
    >
      <Ionicons name="add-outline" size={22} color="#07101F" />
      <Text style={styles.addContextButtonText}>Add context</Text>
    </Pressable>

    <Text style={styles.savedTodayHint}>
      Come back tomorrow. Dara works best with one daily check-in, ideally in
      the evening.
    </Text>

    <Pressable style={styles.skipButton} onPress={onDone}>
      <Text style={styles.skipButtonText}>Back home</Text>
    </Pressable>
  </View>
) : (
  <View style={styles.noteCard}>
    <Text style={styles.sectionLabel}>READY TO SAVE</Text>

    <View style={styles.previewCard}>
      <Ionicons name="sparkles-outline" size={20} color="#B9C6FF" />
      <Text style={styles.previewText}>
        Save your daily check-in first. After that, you can add meals, notes and
        events as separate context.
      </Text>
    </View>

    <Pressable
      style={[styles.primaryButton, isSaving && styles.primaryButtonDisabled]}
      disabled={isSaving}
      onPress={handleSave}
    >
      <Text style={styles.primaryButtonText}>
        {isSaving ? "Saving..." : "Save check-in"}
      </Text>
    </Pressable>

    <Text style={styles.savedTodayHint}>
      Tip: check in once in the evening so Dara can better understand your day.
    </Text>

    <Pressable style={styles.skipButton} onPress={onDone}>
      <Text style={styles.skipButtonText}>Skip today</Text>
    </Pressable>
  </View>
)}


        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "transparent",
  },

  content: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 36,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },

  closeButtonGhost: {
    width: 44,
    height: 44,
  },

  headerLabel: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 3,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 38,
    lineHeight: 42,
    fontWeight: "900",
    letterSpacing: -1.2,
    marginBottom: 12,
  },

  subtitle: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 16,
    lineHeight: 23,
    marginBottom: 22,
  },

  card: {
    borderRadius: 30,
    padding: 18,
    backgroundColor: "rgba(8, 16, 38, 0.58)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    marginBottom: 14,
  },

  scaleBlock: {
    marginBottom: 22,
  },

  scaleTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  scaleIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  scaleTextBlock: {
    flex: 1,
  },

  scaleTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 3,
  },

  scaleDescription: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 13,
    lineHeight: 18,
  },

  scaleValue: {
    fontSize: 26,
    fontWeight: "900",
    marginLeft: 12,
  },

  scaleDots: {
    flexDirection: "row",
    gap: 8,
  },

  scaleDot: {
    flex: 1,
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  noteCard: {
    borderRadius: 30,
    padding: 18,
    backgroundColor: "rgba(8, 16, 38, 0.58)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    marginBottom: 14,
  },

  sectionLabel: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2.4,
    marginBottom: 12,
  },

  noteInput: {
    minHeight: 116,
    borderRadius: 22,
    padding: 14,
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 23,
    textAlignVertical: "top",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    marginBottom: 12,
  },

  photoButton: {
    minHeight: 54,
    borderRadius: 19,
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

  previewCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 22,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    marginBottom: 18,
  },

  previewText: {
    flex: 1,
    color: "rgba(255,255,255,0.64)",
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
  
  mealPreviewCard: {
  marginTop: 12,
  borderRadius: 24,
  overflow: "hidden",
  backgroundColor: "rgba(255,255,255,0.06)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.14)",
},

mealPreviewImage: {
  width: "100%",
  height: 180,
},

mealInsight: {
  padding: 14,
},

mealInsightLabel: {
  color: "#B9C6FF",
  fontSize: 12,
  fontWeight: "900",
  letterSpacing: 1.6,
  marginBottom: 6,
},

mealInsightTitle: {
  color: "#FFFFFF",
  fontSize: 18,
  fontWeight: "900",
  marginBottom: 6,
},

mealInsightText: {
  color: "rgba(255,255,255,0.66)",
  fontSize: 14,
  lineHeight: 20,
},

primaryButtonDisabled: {
  opacity: 0.56,
},

savedTodayHint: {
  color: "rgba(255,255,255,0.58)",
  fontSize: 13,
  lineHeight: 18,
  textAlign: "center",
  marginTop: 10,
  marginBottom: 10,
},

addContextButton: {
  height: 58,
  borderRadius: 29,
  backgroundColor: "#FFFFFF",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  marginTop: 12,
  gap: 8,
},

addContextButtonText: {
  color: "#07101F",
  fontSize: 17,
  fontWeight: "900",
},
topContextCard: {
  flexDirection: "row",
  alignItems: "center",
  borderRadius: 28,
  padding: 15,
  backgroundColor: "rgba(8, 16, 38, 0.58)",
  borderWidth: 1,
  borderColor: "rgba(185,198,255,0.18)",
  marginBottom: 16,
},

topContextIcon: {
  width: 50,
  height: 50,
  borderRadius: 25,
  backgroundColor: "rgba(185,198,255,0.12)",
  borderWidth: 1,
  borderColor: "rgba(185,198,255,0.28)",
  alignItems: "center",
  justifyContent: "center",
  marginRight: 13,
},

topContextTextBlock: {
  flex: 1,
},

topContextTitle: {
  color: "#FFFFFF",
  fontSize: 18,
  fontWeight: "900",
  marginBottom: 4,
},

topContextText: {
  color: "rgba(255,255,255,0.62)",
  fontSize: 14,
  lineHeight: 19,
},
});
