import React, { useMemo, useState } from "react";
import {
  ActionSheetIOS,
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import ScreenBackground from "../components/ScreenBackground";
import AnimatedPressable from "../components/AnimatedPressable";
import { lightTap, successTap } from "../haptics";
import { saveDailyContextEvents } from "../storage";
import { useDaraData } from "../useDaraData";
import { analyzeMealPhoto } from "../lib/meal-analysis-client";

const FREE_CONTEXT_LIMIT_PER_DAY = 5;


type AddContextScreenProps = {
  dataVersion?: number;
  isPremium?: boolean;
  onOpenPremium?: () => void;
  onDone: () => void;
};

function getDayKey(date: Date | string) {
  const value = typeof date === "string" ? new Date(date) : date;
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


export default function AddContextScreen({
  dataVersion = 0,
  isPremium = false,
  onOpenPremium,
  onDone,
}: AddContextScreenProps) {

  const { data } = useDaraData(dataVersion);
  const [note, setNote] = useState("");
  const [mealPhotoUri, setMealPhotoUri] = useState<string | null>(null);
  const [mealAnalysis, setMealAnalysis] = useState<string | null>(null);
  const [mealEnergyImpact, setMealEnergyImpact] = useState<string | null>(null);
  const [isAnalyzingMeal, setIsAnalyzingMeal] = useState(false);

  const todayContextCount = useMemo(() => {
    const todayKey = getDayKey(new Date());

    return data.dailyContextEvents.filter(
      (item) => getDayKey(item.createdAt) === todayKey
    ).length;
  }, [data.dailyContextEvents]);

const isLocked =
  !isPremium && todayContextCount >= FREE_CONTEXT_LIMIT_PER_DAY;



  async function analyzeSelectedMealPhoto(uri: string) {
    setIsAnalyzingMeal(true);
    setMealAnalysis(null);

    try {
      const result = await analyzeMealPhoto(uri);
      setMealAnalysis(`${result.title}: ${result.summary}`);
    } catch (error) {
      setMealAnalysis(
        error instanceof Error
          ? `Meal analysis failed: ${error.message}`
          : "Meal analysis failed: unknown error"
      );
    } finally {
      setIsAnalyzingMeal(false);
    }
  }

async function chooseMealPhotoFromLibrary() {
  if (isLocked) {
    return;
  }

  await lightTap();

  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.75,
  });

  if (!result.canceled && result.assets.length > 0) {
    const uri = result.assets[0].uri;
    setMealPhotoUri(uri);
    await analyzeSelectedMealPhoto(uri);
  }
}

async function takeMealPhoto() {
  if (isLocked) {
    return;
  }

  await lightTap();

  const permission = await ImagePicker.requestCameraPermissionsAsync();

  if (!permission.granted) {
    return;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.75,
  });

  if (!result.canceled && result.assets.length > 0) {
    const uri = result.assets[0].uri;
    setMealPhotoUri(uri);
    await analyzeSelectedMealPhoto(uri);
  }
}

function pickMealPhoto() {
  if (isLocked) {
    return;
  }

  if (Platform.OS === "ios") {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title: "Add meal photo",
        message: "Take a new photo or choose one from your library.",
        options: ["Take photo", "Choose from library", "Cancel"],
        cancelButtonIndex: 2,
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          takeMealPhoto();
        }

        if (buttonIndex === 1) {
          chooseMealPhotoFromLibrary();
        }
      }
    );

    return;
  }

  chooseMealPhotoFromLibrary();
}

  async function handleSave() {
    if (isLocked) {
      return;
    }

    const createdAt = new Date().toISOString();
    const events = [];

    if (note.trim()) {
      events.push({
        id: `note-${createdAt}`,
        type: "note" as const,
        title: "Daily note",
        text: note.trim(),
        createdAt,
      });
    }


if (mealPhotoUri) {
  events.push({
    id: `meal-${createdAt}`,
    type: "meal" as const,
    title: "Meal photo",
    text: mealAnalysis ?? "Meal photo added. Dara will estimate meal quality, energy impact and recovery context.",
    createdAt,
  });
}

    if (events.length === 0) {
      return;
    }

    await saveDailyContextEvents(events);
    await successTap();
    onDone();
  }

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

            <Text style={styles.headerLabel}>TODAY CONTEXT</Text>

            <View style={styles.closeButtonGhost} />
          </View>

          <View style={styles.heroCard}>
            <View style={styles.heroIcon}>
              <Ionicons name="sparkles-outline" size={25} color="#B9C6FF" />
            </View>

            <Text style={styles.heroTitle}>What happened today?</Text>
            <Text style={styles.heroText}>
              Add notes, meals or events so Dara can connect them with your daily
              check-in patterns.
            </Text>
          </View>

          {isLocked ? (
            <View style={styles.lockedCard}>
              <View style={styles.lockedIcon}>
                <Ionicons name="lock-closed-outline" size={24} color="#B9C6FF" />
              </View>


<Text style={styles.lockedTitle}>Today context limit reached</Text>
<Text style={styles.lockedText}>
  Free preview includes {FREE_CONTEXT_LIMIT_PER_DAY} context items per day. Dara
  will use them with your check-in to understand today's patterns. Premium
  unlocks unlimited notes, meals and events.
</Text>
    


<AnimatedPressable
  style={styles.primaryButton}
  pressedScale={0.97}
  onPress={() => {
    lightTap();
    onOpenPremium?.();
  }}
>
  <Text style={styles.primaryButtonText}>Unlock unlimited context</Text>
</AnimatedPressable>

              <Pressable style={styles.skipButton} onPress={onDone}>
                <Text style={styles.skipButtonText}>Back home</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.formCard}>
              <Text style={styles.sectionLabel}>NOTE</Text>

              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Example: tough meeting, heavy lunch, travel, headache, great workout..."
                placeholderTextColor="rgba(255,255,255,0.42)"
                multiline
                style={styles.noteInput}
              />

              <Pressable style={styles.photoButton} onPress={pickMealPhoto}>
                <Ionicons name="camera-outline" size={21} color="#FFFFFF" />
                <Text style={styles.photoButtonText}>
                  {mealPhotoUri ? "Change meal photo" : "Add meal photo"}
                </Text>
              </Pressable>

              {mealPhotoUri ? (
                <View style={styles.mealPreviewCard}>
                  <Image source={{ uri: mealPhotoUri }} style={styles.mealPreviewImage} />
                  <View style={styles.mealInsight}>
                    <Text style={styles.mealInsightLabel}>Meal context</Text>
                    <Text style={styles.mealInsightTitle}>
                      {isAnalyzingMeal
                        ? "Analyzing meal..."
                        : mealAnalysis
                          ? "Meal analyzed"
                          : "Saved for later analysis"}
                    </Text>
                    <Text style={styles.mealInsightText}>
                      {isAnalyzingMeal
                        ? "Dara is checking likely foods, energy impact and recovery context."
                        : mealAnalysis ??
                          "Dara will connect this meal with energy, stress and recovery."}
                    </Text>
                  </View>
                </View>
              ) : null}

              <AnimatedPressable
                style={[
                  styles.primaryButton,
                  !note.trim() && !mealPhotoUri && styles.primaryButtonDisabled,
                ]}
                pressedScale={0.97}
                onPress={handleSave}
              >
                <Text style={styles.primaryButtonText}>Save context</Text>
              </AnimatedPressable>

              <Text style={styles.hintText}>
Free preview: up to {FREE_CONTEXT_LIMIT_PER_DAY} context items per day.
Premium unlocks unlimited context memory.
              </Text>
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
    borderRadius: 30,
    padding: 20,
    backgroundColor: "rgba(8, 16, 38, 0.58)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    marginBottom: 16,
  },

  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(185,198,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(185,198,255,0.28)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 32,
    lineHeight: 37,
    fontWeight: "900",
    letterSpacing: -0.9,
    marginBottom: 8,
  },

  heroText: {
    color: "rgba(255,255,255,0.66)",
    fontSize: 16,
    lineHeight: 23,
  },

  formCard: {
    borderRadius: 30,
    padding: 18,
    backgroundColor: "rgba(8, 16, 38, 0.58)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },

  lockedCard: {
    borderRadius: 30,
    padding: 20,
    backgroundColor: "rgba(8, 16, 38, 0.58)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },

  lockedIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(185,198,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(185,198,255,0.28)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  lockedTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
    marginBottom: 8,
  },

  lockedText: {
    color: "rgba(255,255,255,0.66)",
    fontSize: 16,
    lineHeight: 23,
    marginBottom: 18,
  },

  sectionLabel: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 3,
    marginBottom: 10,
  },

  noteInput: {
    minHeight: 150,
    borderRadius: 24,
    padding: 16,
    color: "#FFFFFF",
    fontSize: 17,
    lineHeight: 24,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    textAlignVertical: "top",
    marginBottom: 14,
  },

  photoButton: {
    height: 58,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    marginBottom: 14,
    gap: 8,
  },

  photoButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },

  mealPreviewCard: {
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    marginBottom: 16,
  },

  mealAnalysisText: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 10,
  },

  mealPreviewImage: {
    width: "100%",
    height: 210,
  },

  mealInsight: {
    padding: 16,
  },

  mealInsightLabel: {
    color: "#B9C6FF",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2.4,
    marginBottom: 7,
    textTransform: "uppercase",
  },

  mealInsightTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 7,
  },

  mealInsightText: {
    color: "rgba(255,255,255,0.66)",
    fontSize: 15,
    lineHeight: 22,
  },

  primaryButton: {
    height: 62,
    borderRadius: 31,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonDisabled: {
    opacity: 0.5,
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
