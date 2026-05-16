import React from "react";
import {
  ActionSheetIOS,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";

import ScreenBackground from "../components/ScreenBackground";
import AnimatedPressable from "../components/AnimatedPressable";
import { lightTap, mediumTap, successTap } from "../haptics";
import { saveHealthRecord, type HealthRecordFile } from "../storage";
import { analyzeHealthRecordPhoto } from "../lib/health-record-analysis-client";
import { useDaraData } from "../useDaraData";

type HealthRecordsScreenProps = {
  dataVersion?: number;
  onDone: () => void;
  onChanged?: () => void;
};

export default function HealthRecordsScreen({
  dataVersion = 0,
  onDone,
  onChanged,
}: HealthRecordsScreenProps) {
  const { data, reload } = useDaraData(dataVersion);
  const healthRecord = data.healthRecord;
  const [isAnalyzingRecord, setIsAnalyzingRecord] = React.useState(false);
  const [analysisText, setAnalysisText] = React.useState<string | null>(null);

  async function saveRecord(record: HealthRecordFile) {
    await saveHealthRecord(record);
    await reload();
    onChanged?.();
    await successTap();
  }

  async function pickBloodTestFile() {
    await lightTap();

    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/*"],
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      const file = result.assets[0];

      await saveRecord({
        name: file.name,
        uri: file.uri,
        size: file.size,
        mimeType: file.mimeType,
        createdAt: new Date().toISOString(),
        analysisStatus: "ready",
      });
    }
  }

  async function pickBloodTestPhoto() {
    await lightTap();

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.85,
    });

    if (!result.canceled && result.assets.length > 0) {
      const image = result.assets[0];

      await saveRecord({
        name: image.fileName ?? "Blood test photo",
        uri: image.uri,
        size: image.fileSize,
        mimeType: image.mimeType ?? "image/jpeg",
        createdAt: new Date().toISOString(),
        analysisStatus: "ready",
      });
    }
  }

  async function takeBloodTestPhoto() {
    await lightTap();

    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.85,
    });

    if (!result.canceled && result.assets.length > 0) {
      const image = result.assets[0];

      await saveRecord({
        name: image.fileName ?? "Blood test photo",
        uri: image.uri,
        size: image.fileSize,
        mimeType: image.mimeType ?? "image/jpeg",
        createdAt: new Date().toISOString(),
        analysisStatus: "ready",
      });
    }
  }

  function openBloodTestPicker() {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: "Attach blood test",
          message: "Add a photo or upload a PDF report.",
          options: ["Take photo", "Choose photo", "Upload PDF", "Cancel"],
          cancelButtonIndex: 3,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) takeBloodTestPhoto();
          if (buttonIndex === 1) pickBloodTestPhoto();
          if (buttonIndex === 2) pickBloodTestFile();
        }
      );

      return;
    }

    pickBloodTestFile();
  }

  return (
    <ScreenBackground source={require("../../assets/onboarding-bg.png")}>
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.headerRow}>
            <AnimatedPressable
              style={styles.backButton}
              pressedScale={0.94}
              onPress={() => {
                lightTap();
                onDone();
              }}
            >
              <Ionicons name="chevron-back-outline" size={30} color="#FFFFFF" />
            </AnimatedPressable>

            <View style={styles.headerTextBlock}>
              <Text style={styles.eyebrow}>HEALTH RECORDS</Text>
              <Text style={styles.title}>Blood tests and biomarkers</Text>
            </View>
          </View>

          <View style={styles.heroCard}>
            <View style={styles.heroIcon}>
              <Ionicons name="flask-outline" size={25} color="#FF647C" />
            </View>

            <Text style={styles.heroTitle}>Upload reports for deeper health context.</Text>
            <Text style={styles.heroText}>
              Dara will use blood tests, biomarkers and long-term records to improve recovery,
              fatigue and nutrition intelligence.
            </Text>

            <AnimatedPressable
              style={styles.attachButton}
              pressedScale={0.97}
              onPress={openBloodTestPicker}
            >
              <Ionicons name="document-attach-outline" size={22} color="#07101F" />
              <Text style={styles.attachButtonText}>
                {healthRecord ? "Change blood test" : "Attach blood test"}
              </Text>
            </AnimatedPressable>
          </View>

          {healthRecord && (
            <View style={styles.recordCard}>
              <View style={styles.recordHeader}>
                <View style={styles.recordIcon}>
                  <Ionicons name="flask-outline" size={23} color="#FF647C" />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.recordTitle}>{healthRecord.name}</Text>
                  <Text style={styles.recordText}>
                    Ready for analysis. Dara will extract biomarkers, fatigue,
                    inflammation and nutrient signals in the next update.
                  </Text>
                </View>
              </View>

              <AnimatedPressable
                style={styles.analyzeButton}
                pressedScale={0.97}
                disabled={isAnalyzingRecord}
                onPress={async () => {
                  mediumTap();

                  if (!healthRecord?.uri) {
                    return;
                  }

                  setIsAnalyzingRecord(true);
                  setAnalysisText(null);

                  try {
                    const result = await analyzeHealthRecordPhoto(
                      healthRecord.uri,
                      healthRecord.mimeType ?? "image/jpeg"
                    );

                    setAnalysisText(`${result.title}: ${result.summary}`);
                  } catch (error) {
                    setAnalysisText(
                      error instanceof Error
                        ? `Analysis failed: ${error.message}`
                        : "Analysis failed. Please try again."
                    );
                  } finally {
                    setIsAnalyzingRecord(false);
                  }
                }}
              >
                <Ionicons name="sparkles-outline" size={18} color="#FFFFFF" />
                <Text style={styles.analyzeButtonText}>
                  {isAnalyzingRecord ? "Analyzing..." : "Analyze blood test"}
                </Text>
              </AnimatedPressable>

              {analysisText && (
                <Text style={styles.analysisResultText}>{analysisText}</Text>
              )}
            </View>
          )}

          <View style={styles.infoCard}>
            <InfoRow
              icon="document-attach-outline"
              color="#FF647C"
              title="Blood tests"
              text="Upload PDF or photo reports to track fatigue, inflammation, iron, vitamin D, B12, glucose and other biomarkers."
            />
            <InfoRow
              icon="heart-outline"
              color="#58E7FF"
              title="Apple Health"
              text="Connected health signals can be compared with biomarkers over time."
            />
            <InfoRow
              icon="analytics-outline"
              color="#B9C6FF"
              title="Biomarker trends"
              text="Dara will compare new records against your baseline and show what changed."
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </ScreenBackground>
  );
}

function InfoRow({
  icon,
  color,
  title,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  title: string;
  text: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={22} color={color} />
      <View style={styles.infoTextBlock}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoText}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 120,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },

  backButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    marginRight: 14,
  },

  headerTextBlock: {
    flex: 1,
  },

  eyebrow: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 3,
    marginBottom: 5,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 32,
    lineHeight: 37,
    fontWeight: "900",
    letterSpacing: -1,
  },

  heroCard: {
    borderRadius: 32,
    padding: 22,
    backgroundColor: "rgba(8,16,38,0.62)",
    borderWidth: 1,
    borderColor: "rgba(255,100,124,0.22)",
    marginBottom: 18,
  },

  heroIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,100,124,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,100,124,0.28)",
    marginBottom: 18,
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 25,
    lineHeight: 31,
    fontWeight: "900",
    marginBottom: 10,
  },

  heroText: {
    color: "rgba(255,255,255,0.66)",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 18,
  },

  attachButton: {
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    paddingVertical: 17,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  attachButtonText: {
    color: "#07101F",
    fontSize: 17,
    fontWeight: "900",
  },

  recordCard: {
    borderRadius: 28,
    padding: 18,
    backgroundColor: "rgba(255,255,255,0.055)",
    borderWidth: 1,
    borderColor: "rgba(255,100,124,0.24)",
    marginBottom: 18,
  },

  recordHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  recordIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,100,124,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,100,124,0.28)",
    marginRight: 14,
  },

  recordTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "900",
    marginBottom: 6,
  },

  recordText: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 14,
    lineHeight: 21,
  },

  analyzeButton: {
    marginTop: 16,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.085)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },

  analysisResultText: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 12,
  },

  analyzeButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  infoCard: {
    borderRadius: 28,
    padding: 16,
    backgroundColor: "rgba(8,16,38,0.50)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 14,
  },

  infoTextBlock: {
    flex: 1,
    marginLeft: 14,
  },

  infoTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 5,
  },

  infoText: {
    color: "rgba(255,255,255,0.60)",
    fontSize: 14,
    lineHeight: 21,
  },
});
