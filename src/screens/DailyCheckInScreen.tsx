import React, { useState } from "react";
import {
  Image,
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
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

type DailyCheckInScreenProps = {
  onDone: () => void;
};

type BloodTestFile = {
  name: string;
  uri: string;
  size?: number;
  mimeType?: string;
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

export default function DailyCheckInScreen({ onDone }: DailyCheckInScreenProps) {
  const [values, setValues] = useState<Record<ScaleKey, number>>({
    energy: 6,
    stress: 4,
    workload: 5,
    spendingPressure: 3,
  });

  const [note, setNote] = useState("");
  const [mealPhotoUri, setMealPhotoUri] = useState<string | null>(null);
  const [bloodTestFile, setBloodTestFile] = useState<BloodTestFile | null>(null);

  function setScaleValue(key: ScaleKey, value: number) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  }

   async function pickMealPhoto() {
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
      setMealPhotoUri(result.assets[0].uri);
    }
  }
async function pickBloodTestFile() {
  const result = await DocumentPicker.getDocumentAsync({
    type: ["application/pdf", "image/*"],
    copyToCacheDirectory: true,
  });

  if (!result.canceled && result.assets.length > 0) {
    const file = result.assets[0];

    setBloodTestFile({
      name: file.name,
      uri: file.uri,
      size: file.size,
      mimeType: file.mimeType,
    });
  }
}
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

<View style={styles.noteCard}>
  <Text style={styles.sectionLabel}>TODAY CONTEXT</Text>

  <TextInput
    value={note}
    onChangeText={setNote}
    placeholder="Example: slept badly, met a banker, started a new book, had a heavy breakfast..."
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

  {mealPhotoUri && (
    <View style={styles.mealPreviewCard}>
      <Image source={{ uri: mealPhotoUri }} style={styles.mealPreviewImage} />

      <View style={styles.mealInsight}>
        <Text style={styles.mealInsightLabel}>Dara meal read</Text>
        <Text style={styles.mealInsightTitle}>Balanced energy support</Text>
        <Text style={styles.mealInsightText}>
          This looks like it may support stable energy. Full analysis will be
          available after AI meal review is connected.
        </Text>
      </View>
    </View>
  )}

  <Pressable style={styles.documentButton} onPress={pickBloodTestFile}>
    <Ionicons name="document-attach-outline" size={21} color="#FFFFFF" />
    <Text style={styles.documentButtonText}>
      {bloodTestFile ? "Change blood test file" : "Attach blood test"}
    </Text>
  </Pressable>

  {bloodTestFile && (
    <View style={styles.bloodTestCard}>
      <View style={styles.bloodTestIcon}>
        <Ionicons name="flask-outline" size={22} color="#FF647C" />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.bloodTestTitle}>{bloodTestFile.name}</Text>
        <Text style={styles.bloodTestText}>
          Blood test attached. Dara will use this later to understand recovery,
          fatigue, inflammation and nutrient signals.
        </Text>
      </View>
    </View>
  )}
</View>

          <View style={styles.previewCard}>
            <Ionicons name="sparkles-outline" size={20} color="#B9C6FF" />
            <Text style={styles.previewText}>
              Dara will connect this with sleep, recovery, workload and external
              signals.
            </Text>
          </View>

          <Pressable style={styles.primaryButton} onPress={onDone}>
            <Text style={styles.primaryButtonText}>Save check-in</Text>
          </Pressable>

          <Pressable style={styles.skipButton} onPress={onDone}>
            <Text style={styles.skipButtonText}>Skip today</Text>
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
    backgroundColor: "rgba(3, 7, 18, 0.54)",
  },

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
documentButton: {
  minHeight: 54,
  borderRadius: 19,
  backgroundColor: "rgba(255,255,255,0.08)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.14)",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  marginTop: 12,
},

documentButtonText: {
  color: "#FFFFFF",
  fontSize: 15,
  fontWeight: "800",
  marginLeft: 8,
},

bloodTestCard: {
  marginTop: 12,
  borderRadius: 22,
  padding: 14,
  backgroundColor: "rgba(255,100,124,0.08)",
  borderWidth: 1,
  borderColor: "rgba(255,100,124,0.22)",
  flexDirection: "row",
  alignItems: "center",
},

bloodTestIcon: {
  width: 46,
  height: 46,
  borderRadius: 23,
  backgroundColor: "rgba(255,100,124,0.12)",
  borderWidth: 1,
  borderColor: "rgba(255,100,124,0.28)",
  alignItems: "center",
  justifyContent: "center",
  marginRight: 12,
},

bloodTestTitle: {
  color: "#FFFFFF",
  fontSize: 15,
  fontWeight: "900",
  marginBottom: 4,
},

bloodTestText: {
  color: "rgba(255,255,255,0.66)",
  fontSize: 13,
  lineHeight: 18,
},

});
