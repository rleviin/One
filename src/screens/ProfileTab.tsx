import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { HealthRecordFile, PersonalSetupData } from "../storage";
import {
  loadHealthRecord,
  loadPersonalSetup,
  saveHealthRecord,
} from "../storage";
import * as DocumentPicker from "expo-document-picker";

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
  const [showHealthRecords, setShowHealthRecords] = useState(false);
  const [setupData, setSetupData] = useState<PersonalSetupData | null>(null);
  const [healthRecord, setHealthRecord] = useState<HealthRecordFile | null>(null);

 useEffect(() => {
    let mounted = true;

    async function loadProfileData() {
     const data = await loadPersonalSetup();
const record = await loadHealthRecord();

if (mounted) {
  setSetupData(data);
  setHealthRecord(record);
}
    }

    loadProfileData();

    return () => {
      mounted = false;
    };
  }, []);
  async function pickBloodTestFile() {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/*"],
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      const file = result.assets[0];

      const record: HealthRecordFile = {
        name: file.name,
        uri: file.uri,
        size: file.size,
        mimeType: file.mimeType,
        createdAt: new Date().toISOString(),
      };

      await saveHealthRecord(record);
      setHealthRecord(record);
    }
  }

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
    {setupData
      ? `${setupData.country || "Country not set"} · Age ${
          setupData.age || "—"
        } · Sleep goal ${setupData.sleepGoal || "—"}h`
      : "Not completed yet. Add country, age, sleep goal and work style."}
  </Text>

  {setupData && (
    <View style={styles.baselineTags}>
      <Text style={styles.baselineTag}>{setupData.workType || "work"}</Text>
      <Text style={styles.baselineTag}>
        Income: {setupData.incomeRange || "optional"}
      </Text>
      <Text style={styles.baselineTag}>
        Spending: {setupData.spendingRange || "optional"}
      </Text>
    </View>
  )}
</View>
          <View style={styles.arrowCircle}>
            <Ionicons
              name="chevron-forward"
              size={22}
              color="rgba(255,255,255,0.86)"
            />
          </View>
        </Pressable>
        <Pressable
  style={styles.healthRecordsCard}
  onPress={() => setShowHealthRecords(true)}
>
  <View style={styles.healthRecordsIcon}>
    <Ionicons name="flask-outline" size={25} color="#FF647C" />
  </View>

  <View style={styles.setupTextBlock}>
    <Text style={styles.setupTitle}>Health records</Text>
    <Text style={styles.setupText}>
      Blood tests, biomarkers and Apple Health connections will live here.
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

      <Modal
        visible={showHealthRecords}
        transparent
        animationType="slide"
        onRequestClose={() => setShowHealthRecords(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowHealthRecords(false)}
        />

        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />

          <View style={styles.sheetIcon}>
            <Ionicons name="flask-outline" size={25} color="#FF647C" />
          </View>

          <Text style={styles.sheetTitle}>Health records</Text>

          <Text style={styles.sheetSubtitle}>
            This will become Dara&apos;s place for blood tests, biomarkers and
            long-term health context.
          </Text>

          <Pressable style={styles.attachRecordButton} onPress={pickBloodTestFile}>
  <Ionicons name="document-attach-outline" size={21} color="#07101F" />
  <Text style={styles.attachRecordButtonText}>
    {healthRecord ? "Change blood test" : "Attach blood test"}
  </Text>
</Pressable>

{healthRecord && (
  <View style={styles.attachedRecordCard}>
    <View style={styles.attachedRecordIcon}>
      <Ionicons name="flask-outline" size={22} color="#FF647C" />
    </View>

    <View style={{ flex: 1 }}>
      <Text style={styles.attachedRecordTitle}>{healthRecord.name}</Text>
      <Text style={styles.attachedRecordText}>
        Attached locally. Dara will later analyze biomarkers, fatigue,
        inflammation and nutrient signals.
      </Text>
    </View>
  </View>
)}
          <View style={styles.recordList}>
            <View style={styles.recordItem}>
              <Ionicons name="document-attach-outline" size={20} color="#FF647C" />
              <View style={styles.recordTextBlock}>
                <Text style={styles.recordTitle}>Blood tests</Text>
                <Text style={styles.recordText}>
                  Upload PDF or photo reports to track fatigue, inflammation,
                  iron, vitamin D, B12, glucose and other biomarkers.
                </Text>
              </View>
            </View>

            <View style={styles.recordItem}>
              <Ionicons name="heart-outline" size={20} color="#58E7FF" />
              <View style={styles.recordTextBlock}>
                <Text style={styles.recordTitle}>Apple Health</Text>
                <Text style={styles.recordText}>
                  Later Dara can connect sleep, activity, HRV and recovery data
                  from HealthKit.
                </Text>
              </View>
            </View>

            <View style={styles.recordItem}>
              <Ionicons name="analytics-outline" size={20} color="#B9C6FF" />
              <View style={styles.recordTextBlock}>
                <Text style={styles.recordTitle}>Biomarker trends</Text>
                <Text style={styles.recordText}>
                  Dara will compare new records against your baseline and show
                  what changed.
                </Text>
              </View>
            </View>
          </View>

          <Pressable
            style={styles.sheetButton}
            onPress={() => setShowHealthRecords(false)}
          >
            <Text style={styles.sheetButtonText}>Got it</Text>
          </Pressable>
        </View>
      </Modal>
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

healthRecordsCard: {
  flexDirection: "row",
  alignItems: "center",
  borderRadius: 28,
  padding: 16,
  backgroundColor: "rgba(255,100,124,0.10)",
  borderWidth: 1,
  borderColor: "rgba(255,100,124,0.24)",
  marginBottom: 24,
},

healthRecordsIcon: {
  width: 52,
  height: 52,
  borderRadius: 26,
  backgroundColor: "rgba(255,100,124,0.14)",
  borderWidth: 1,
  borderColor: "rgba(255,100,124,0.30)",
  alignItems: "center",
  justifyContent: "center",
  marginRight: 14,
},

modalBackdrop: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.48)",
},

sheet: {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  borderTopLeftRadius: 34,
  borderTopRightRadius: 34,
  paddingHorizontal: 24,
  paddingTop: 12,
  paddingBottom: 34,
  backgroundColor: "rgba(8, 16, 38, 0.97)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.14)",
},

sheetHandle: {
  alignSelf: "center",
  width: 44,
  height: 5,
  borderRadius: 99,
  backgroundColor: "rgba(255,255,255,0.24)",
  marginBottom: 20,
},

sheetIcon: {
  width: 54,
  height: 54,
  borderRadius: 27,
  backgroundColor: "rgba(255,100,124,0.14)",
  borderWidth: 1,
  borderColor: "rgba(255,100,124,0.30)",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 14,
},

sheetTitle: {
  color: "#FFFFFF",
  fontSize: 30,
  lineHeight: 35,
  fontWeight: "900",
  letterSpacing: -0.8,
  marginBottom: 8,
},

sheetSubtitle: {
  color: "rgba(255,255,255,0.66)",
  fontSize: 16,
  lineHeight: 23,
  marginBottom: 18,
},

recordList: {
  gap: 12,
  marginBottom: 22,
},

recordItem: {
  flexDirection: "row",
  alignItems: "flex-start",
  borderRadius: 20,
  padding: 14,
  backgroundColor: "rgba(255,255,255,0.055)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.10)",
},

recordTextBlock: {
  flex: 1,
  marginLeft: 12,
},

recordTitle: {
  color: "#FFFFFF",
  fontSize: 16,
  fontWeight: "900",
  marginBottom: 4,
},

recordText: {
  color: "rgba(255,255,255,0.64)",
  fontSize: 14,
  lineHeight: 20,
},

sheetButton: {
  height: 56,
  borderRadius: 28,
  backgroundColor: "#FFFFFF",
  alignItems: "center",
  justifyContent: "center",
},

sheetButtonText: {
  color: "#07101F",
  fontSize: 17,
  fontWeight: "900",
},
baselineTags: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 6,
  marginTop: 10,
},

baselineTag: {
  color: "rgba(255,255,255,0.72)",
  fontSize: 12,
  fontWeight: "800",
  paddingHorizontal: 9,
  paddingVertical: 6,
  borderRadius: 999,
  backgroundColor: "rgba(255,255,255,0.08)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.12)",
},
attachRecordButton: {
  height: 56,
  borderRadius: 28,
  backgroundColor: "#FFFFFF",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 14,
},

attachRecordButtonText: {
  color: "#07101F",
  fontSize: 16,
  fontWeight: "900",
  marginLeft: 8,
},

attachedRecordCard: {
  flexDirection: "row",
  alignItems: "center",
  borderRadius: 22,
  padding: 14,
  backgroundColor: "rgba(255,100,124,0.08)",
  borderWidth: 1,
  borderColor: "rgba(255,100,124,0.22)",
  marginBottom: 18,
},

attachedRecordIcon: {
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

attachedRecordTitle: {
  color: "#FFFFFF",
  fontSize: 15,
  fontWeight: "900",
  marginBottom: 4,
},

attachedRecordText: {
  color: "rgba(255,255,255,0.66)",
  fontSize: 13,
  lineHeight: 18,
},

});
