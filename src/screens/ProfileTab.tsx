import React, { useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  ActionSheetIOS,
  Platform,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";

import type { HealthRecordFile } from "../storage";
import { saveHealthRecord, saveHealthSummary } from "../storage";
import { useDaraData } from "../useDaraData";
import { lightTap, mediumTap, successTap } from "../haptics";
import AnimatedPressable from "../components/AnimatedPressable";
import AnimatedBottomSheet from "../components/AnimatedBottomSheet";
import ScreenBackground from "../components/ScreenBackground";
import {
  loadAppleHealthSummary,
  requestAppleHealthAccess,
  type DaraHealthSummary,
} from "../lib/health-client";
import {
  getDaraAuthUser,
  logoutDaraUser,
  type DaraAuthUser,
} from "../lib/auth-client";

type ProfileTabProps = {
  dataVersion?: number;
  onOpenSetup?: () => void;
  isPremium?: boolean;
  onOpenHistory?: () => void;
  onOpenPremium?: () => void;
  onOpenHealthRecords?: () => void;
  onLogout?: () => void;
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

export default function ProfileTab({
  dataVersion = 0,
  onOpenSetup,
  isPremium = false,
  onOpenHistory,
  onOpenPremium,
  onOpenHealthRecords,
  onLogout,
}: ProfileTabProps) {


  const [showHealthRecords, setShowHealthRecords] = useState(false);
  const [showAppleHealth, setShowAppleHealth] = useState(false);
  const [showExternalContext, setShowExternalContext] = useState(false);
  const [showHistoryPreview, setShowHistoryPreview] = useState(false);
  const [healthSummary, setHealthSummary] = useState<DaraHealthSummary | null>(null);
  const [isConnectingHealth, setIsConnectingHealth] = useState(false);
  const { data, isLoading, reload } = useDaraData(dataVersion);
  const [showContextSheet, setShowContextSheet] = useState(false);
  const [authUser, setAuthUser] = useState<DaraAuthUser | null>(null);
  useEffect(() => {
    getDaraAuthUser().then(setAuthUser);
  }, [dataVersion]);

  const profileName = authUser?.name || "Dara user";
  const profileInitial = profileName.trim().charAt(0).toUpperCase() || "D";

  const setupData = data.personalSetup;
  const healthRecord = data.healthRecord;
  const latestCheckIn = data.dailyCheckIn;
  const recentCheckIns = data.dailyCheckInHistory.slice(0, 5);
  async function connectAppleHealth() {
    setIsConnectingHealth(true);

    try {
      await requestAppleHealthAccess();
      const summary = await loadAppleHealthSummary();
      setHealthSummary(summary);
      await saveHealthSummary(summary);
      await successTap();
    } finally {
      setIsConnectingHealth(false);
    }
  }

  const todayContextEvents = data.dailyContextEvents.filter((item) => {
  const eventDate = new Date(item.createdAt);
  const today = new Date();

  return (
    eventDate.getFullYear() === today.getFullYear() &&
    eventDate.getMonth() === today.getMonth() &&
    eventDate.getDate() === today.getDate()
  );
});

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

      const record: HealthRecordFile = {
        name: image.fileName ?? "Blood test photo",
        uri: image.uri,
        size: image.fileSize,
        mimeType: image.mimeType ?? "image/jpeg",
        createdAt: new Date().toISOString(),
        analysisStatus: "ready",
      };

      await saveHealthRecord(record);
      await reload();
      await successTap();
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

      const record: HealthRecordFile = {
        name: image.fileName ?? "Blood test photo",
        uri: image.uri,
        size: image.fileSize,
        mimeType: image.mimeType ?? "image/jpeg",
        createdAt: new Date().toISOString(),
        analysisStatus: "ready",
      };

      await saveHealthRecord(record);
      await reload();
      await successTap();
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
          if (buttonIndex === 0) {
            takeBloodTestPhoto();
          }

          if (buttonIndex === 1) {
            pickBloodTestPhoto();
          }

          if (buttonIndex === 2) {
            pickBloodTestFile();
          }
        }
      );

      return;
    }

    pickBloodTestFile();
  }

  async function pickBloodTestFile() {
    await lightTap();

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
        analysisStatus: "ready",
      };

      await saveHealthRecord(record);
      await reload();
      await successTap();
    }
  }
function formatCheckInDate(createdAt: string) {
  const date = new Date(createdAt);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatContextTime(createdAt: string) {
  return new Date(createdAt).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}
return (
  <ScreenBackground source={require("../../assets/onboarding-bg.png")}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={reload}
            tintColor="#FFFFFF"
          />
        }
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.eyebrow}>PROFILE</Text>
            <Text style={styles.title}>{profileName}</Text>
          </View>

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profileInitial}</Text>
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

        <AnimatedPressable
          style={styles.pressableFullWidth}
          contentStyle={styles.personalBaselineCard}
          pressedScale={0.975}
          onPress={() => {
            mediumTap();
            onOpenSetup?.();
          }}
        >
          <View style={styles.personalBaselineIcon}>
            <Ionicons name="person-outline" size={25} color="#B9C6FF" />
          </View>

          <View style={styles.setupTextBlock}>
            <Text style={styles.setupTitle}>Personal baseline</Text>
            <Text style={styles.setupText}>
              {setupData
                ? `${setupData.country || "Country not set"} · Age ${
                    setupData.age || "--"
                  } · ${setupData.height || "--"} cm · ${
                    setupData.weight || "--"
                  } kg`
                : "Add your country, age, height, weight and lifestyle baseline."}
            </Text>

            {setupData ? (
              <View style={styles.baselineTags}>
                <Text style={styles.baselineTag}>
                  {setupData.workType || "Work style"}
                </Text>
                <Text style={styles.baselineTag}>
                  Income {setupData.incomeRange || "--"}
                </Text>
                <Text style={styles.baselineTag}>
                  Spending {setupData.spendingRange || "--"}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.arrowCircle}>
            <Ionicons
              name="chevron-forward"
              size={22}
              color="rgba(255,255,255,0.86)"
            />
          </View>
        </AnimatedPressable>

        <AnimatedPressable
          style={styles.pressableFullWidth}
          contentStyle={styles.externalContextCard}
          pressedScale={0.975}
          onPress={() => {
            mediumTap();
            setShowExternalContext(true);
          }}
        >
          <View style={styles.externalContextIcon}>
            <Ionicons name="earth-outline" size={25} color="#C96BFF" />
          </View>

          <View style={styles.setupTextBlock}>
            <Text style={styles.setupTitle}>External context</Text>
            <Text style={styles.setupText}>
              Economy, inflation, cost of living, weather, calendar pressure and
              probability markets will adjust Dara’s forecasts later.
            </Text>

            <View style={styles.baselineTags}>
              <Text style={styles.baselineTag}>
                {setupData?.country || "Country"}
              </Text>
              <Text style={styles.baselineTag}>Economy</Text>
              <Text style={styles.baselineTag}>Probability</Text>
            </View>
          </View>
        </AnimatedPressable>

        <AnimatedPressable
          style={styles.pressableFullWidth}
          contentStyle={styles.healthRecordsCard}
          pressedScale={0.975}
          onPress={() => {
            mediumTap();
            onOpenHealthRecords?.();
          }}
        >
          <View style={styles.healthRecordsIcon}>
            <Ionicons name="flask-outline" size={25} color="#FF647C" />
          </View>

          <View style={styles.setupTextBlock}>
            <Text style={styles.setupTitle}>Health records</Text>
            <Text style={styles.setupText}>
              Blood tests, biomarkers and Apple Health connections will live
              here.
            </Text>
          </View>

          <View style={styles.arrowCircle}>
            <Ionicons
              name="chevron-forward"
              size={22}
              color="rgba(255,255,255,0.86)"
            />
          </View>
        </AnimatedPressable>

        <AnimatedPressable
          style={styles.pressableFullWidth}
          contentStyle={styles.appleHealthCard}
          pressedScale={0.975}
          onPress={() => {
            mediumTap();
            setShowAppleHealth(true);
          }}
        >
          <View style={styles.appleHealthIcon}>
            <Ionicons name="heart-outline" size={25} color="#58E7FF" />
          </View>

          <View style={styles.setupTextBlock}>
            <Text style={styles.setupTitle}>Apple Health</Text>
            <Text style={styles.setupText}>
              Connect sleep, activity, HRV, workouts and recovery data later.
            </Text>
          </View>

          <View style={styles.connectionBadge}>
            <Text style={styles.connectionBadgeText}>
              {healthSummary ? "Connected" : "Not connected"}
            </Text>
          </View>
        </AnimatedPressable>

        <AnimatedPressable
          style={styles.pressableFullWidth}
          contentStyle={styles.latestCheckInCard}
          pressedScale={0.975}
          onPress={() => {
            mediumTap();

            if (isPremium) {
              onOpenHistory?.();
              return;
            }

            setShowHistoryPreview(true);
          }}
        >
          <View style={styles.latestCheckInTop}>
            <View style={styles.latestCheckInIcon}>
              <Ionicons name="pulse-outline" size={23} color="#58E7FF" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.latestCheckInTitle}>Latest check-in</Text>
              <Text style={styles.latestCheckInText}>
                {latestCheckIn
                  ? `Energy ${latestCheckIn.energy}/10 · Stress ${latestCheckIn.stress}/10 · Workload ${latestCheckIn.workload}/10`
                  : "No check-in saved yet."}
              </Text>
            </View>
          </View>

          {latestCheckIn && (
            <View style={styles.latestCheckInStats}>
              <View style={styles.latestCheckInStat}>
                <Text style={styles.latestCheckInStatValue}>
                  {latestCheckIn.energy}
                </Text>
                <Text style={styles.latestCheckInStatLabel}>Energy</Text>
              </View>

              <View style={styles.latestCheckInStat}>
                <Text style={styles.latestCheckInStatValue}>
                  {latestCheckIn.stress}
                </Text>
                <Text style={styles.latestCheckInStatLabel}>Stress</Text>
              </View>

              <View style={styles.latestCheckInStat}>
                <Text style={styles.latestCheckInStatValue}>
                  {latestCheckIn.workload}
                </Text>
                <Text style={styles.latestCheckInStatLabel}>Load</Text>
              </View>

              <View style={styles.latestCheckInStat}>
                <Text style={styles.latestCheckInStatValue}>
                  {latestCheckIn.spendingPressure}
                </Text>
                <Text style={styles.latestCheckInStatLabel}>Money</Text>
              </View>
            </View>
          )}

          {latestCheckIn?.note ? (
            <View style={styles.latestCheckInNote}>
              <Text style={styles.latestCheckInNoteLabel}>Today context</Text>
              <Text style={styles.latestCheckInNoteText}>
                {latestCheckIn.note}
              </Text>
            </View>
          ) : null}
        </AnimatedPressable>



                <AnimatedPressable
          style={styles.pressableFullWidth}
          contentStyle={styles.todayContextCard}
          pressedScale={0.975}
          onPress={() => {
            lightTap();
            setShowContextSheet(true);
          }}
        >
          <View style={styles.todayContextIcon}>
            <Ionicons name="sparkles-outline" size={22} color="#B9C6FF" />
          </View>

          <View style={styles.todayContextTextBlock}>
            <Text style={styles.todayContextTitle}>Today context</Text>
            <Text style={styles.todayContextText}>
              {todayContextEvents.length > 0
                ? `${todayContextEvents.length} context item${
                    todayContextEvents.length === 1 ? "" : "s"
                  } saved today`
                : "No notes, meals or events added yet."}
            </Text>
          </View>

          <View style={styles.todayContextArrow}>
            <Ionicons
              name="chevron-forward"
              size={21}
              color="rgba(255,255,255,0.82)"
            />
          </View>
        </AnimatedPressable>

        <Text style={[styles.sectionTitle, styles.profileSectionTitle]}>
          Connected areas
        </Text>
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

        <Text style={[styles.sectionTitle, styles.profileSectionTitle]}>
          Preferences
        </Text>

        <View style={styles.profileCardWrap}>
          <View style={styles.preferencesCard}>
            {preferences.map((item) => (
              <View key={item} style={styles.preferenceRow}>
                <View style={styles.preferenceDot} />
                <Text style={styles.preferenceText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.profileCardWrap}>
          <View style={styles.privacyCard}>
            <Ionicons name="lock-closed-outline" size={18} color="#B9C6FF" />
            <Text style={styles.privacyText}>
              Your data should stay transparent, editable and under your
              control.
            </Text>
          </View>
        </View>

        <AnimatedPressable
          style={styles.logoutButton}
          pressedScale={0.975}
          onPress={async () => {
            await lightTap();
            await logoutDaraUser();
            onLogout?.();
          }}
        >
          <Ionicons name="log-out-outline" size={18} color="#FF9AA8" />
          <Text style={styles.logoutButtonText}>Log out</Text>
        </AnimatedPressable>
      </ScrollView>

      <AnimatedBottomSheet
        visible={showHealthRecords}
        onClose={() => {
          lightTap();
          setShowHealthRecords(false);
        }}
      >
        <View style={styles.healthSheetIcon}>
          <Ionicons name="flask-outline" size={25} color="#FF647C" />
        </View>

        <Text style={styles.sheetTitle}>Health records</Text>

        <Text style={styles.sheetSubtitle}>
          This will become Dara&apos;s place for blood tests, biomarkers and
          long-term health context.
        </Text>

        <AnimatedPressable
          style={styles.attachRecordButton}
          pressedScale={0.97}
          onPress={openBloodTestPicker}
        >
          <Ionicons name="document-attach-outline" size={21} color="#07101F" />
          <Text style={styles.attachRecordButtonText}>
            {healthRecord ? "Change blood test" : "Attach blood test"}
          </Text>
        </AnimatedPressable>

        {healthRecord && (
          <View style={styles.attachedRecordCard}>
            <View style={styles.attachedRecordHeader}>
              <View style={styles.attachedRecordIcon}>
                <Ionicons name="flask-outline" size={22} color="#FF647C" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.attachedRecordTitle}>
                  {healthRecord.name}
                </Text>

                <Text style={styles.attachedRecordText}>
                  Ready for analysis. Dara will extract biomarkers, fatigue,
                  inflammation and nutrient signals in the next update.
                </Text>
              </View>
            </View>

            <AnimatedPressable
              style={styles.analyzeRecordButton}
              pressedScale={0.97}
              onPress={() => {
                mediumTap();
              }}
            >
              <Ionicons name="sparkles-outline" size={18} color="#FFFFFF" />
              <Text style={styles.analyzeRecordButtonText}>
                Analyze blood test soon
              </Text>
            </AnimatedPressable>
          </View>
        )}

        <View style={styles.recordList}>
          <View style={styles.recordItem}>
            <Ionicons
              name="document-attach-outline"
              size={20}
              color="#FF647C"
            />
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
                Connected from Apple Health with your permission: sleep,
                activity, HRV and recovery-related signals.
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

        <AnimatedPressable
          style={styles.sheetButton}
          pressedScale={0.97}
          onPress={() => {
            lightTap();
            setShowHealthRecords(false);
          }}
        >
          <Text style={styles.sheetButtonText}>Got it</Text>
        </AnimatedPressable>
      </AnimatedBottomSheet>

      <AnimatedBottomSheet
        visible={showExternalContext}
        onClose={() => {
          lightTap();
          setShowExternalContext(false);
        }}
      >
        <View style={styles.externalSheetIcon}>
          <Ionicons name="earth-outline" size={25} color="#C96BFF" />
        </View>

        <Text style={styles.sheetTitle}>External context</Text>

        <Text style={styles.sheetSubtitle}>
          Dara will later connect your country, economy, cost of living,
          weather, calendar pressure and probability markets to adjust forecasts.
        </Text>

        <View style={styles.recordList}>
          <View style={styles.recordItem}>
            <Ionicons name="trending-up-outline" size={20} color="#C96BFF" />
            <View style={styles.recordTextBlock}>
              <Text style={styles.recordTitle}>Economy and inflation</Text>
              <Text style={styles.recordText}>
                Cost pressure, inflation trend and country-level economic signals.
              </Text>
            </View>
          </View>

          <View style={styles.recordItem}>
            <Ionicons name="cloud-outline" size={20} color="#58E7FF" />
            <View style={styles.recordTextBlock}>
              <Text style={styles.recordTitle}>Weather and calendar</Text>
              <Text style={styles.recordText}>
                Weather, daylight, meetings and schedule load can affect recovery and focus.
              </Text>
            </View>
          </View>

          <View style={styles.recordItem}>
            <Ionicons name="pulse-outline" size={20} color="#FF8A4C" />
            <View style={styles.recordTextBlock}>
              <Text style={styles.recordTitle}>Probability markets</Text>
              <Text style={styles.recordText}>
                Polymarket and Kalshi can act as probability context, not direct predictions.
              </Text>
            </View>
          </View>
        </View>

        <AnimatedPressable
          style={styles.sheetButton}
          pressedScale={0.97}
          onPress={() => {
            lightTap();
            setShowExternalContext(false);
          }}
        >
          <Text style={styles.sheetButtonText}>Got it</Text>
        </AnimatedPressable>
      </AnimatedBottomSheet>

      <AnimatedBottomSheet
        visible={showAppleHealth}
        onClose={() => {
          lightTap();
          setShowAppleHealth(false);
        }}
      >
        <View style={styles.appleSheetIcon}>
          <Ionicons name="heart-outline" size={25} color="#58E7FF" />
        </View>

        <Text style={styles.sheetTitle}>Apple Health</Text>

        <Text style={styles.sheetSubtitle}>
          Dara will use Apple Health only with your permission. This can help
          turn sleep, activity and recovery data into more personal guidance.
        </Text>

        {healthSummary && (
          <View style={styles.attachedRecordCard}>
            <View style={styles.attachedRecordIcon}>
              <Ionicons name="pulse-outline" size={22} color="#58E7FF" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.attachedRecordTitle}>Apple Health connected</Text>
              <Text style={styles.attachedRecordText}>
                Steps today: {healthSummary.stepsToday ?? "—"} · Sleep:
                {healthSummary.sleepHoursLastNight
                  ? ` ${healthSummary.sleepHoursLastNight.toFixed(1)}h`
                  : " —"}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.recordList}>
          <View style={styles.recordItem}>
            <Ionicons name="moon-outline" size={20} color="#B9C6FF" />
            <View style={styles.recordTextBlock}>
              <Text style={styles.recordTitle}>Sleep</Text>
              <Text style={styles.recordText}>
                Sleep duration, consistency and changes from your usual
                baseline.
              </Text>
            </View>
          </View>

          <View style={styles.recordItem}>
            <Ionicons name="walk-outline" size={20} color="#58E7FF" />
            <View style={styles.recordTextBlock}>
              <Text style={styles.recordTitle}>Activity</Text>
              <Text style={styles.recordText}>
                Steps, workouts and movement patterns that may affect recovery.
              </Text>
            </View>
          </View>

          <View style={styles.recordItem}>
            <Ionicons name="pulse-outline" size={20} color="#FF647C" />
            <View style={styles.recordTextBlock}>
              <Text style={styles.recordTitle}>Recovery</Text>
              <Text style={styles.recordText}>
                HRV, resting heart rate and recovery-related signals when
                available.
              </Text>
            </View>
          </View>
        </View>

        <AnimatedPressable
          style={styles.sheetButton}
          pressedScale={0.97}
          onPress={
            healthSummary
              ? () => {
                  lightTap();
                  setShowAppleHealth(false);
                }
              : connectAppleHealth
          }
          disabled={isConnectingHealth}
        >
          <Text style={styles.sheetButtonText}>
            {isConnectingHealth
              ? "Connecting..."
              : healthSummary
                ? "Done"
                : "Connect Apple Health"}
          </Text>
        </AnimatedPressable>
      </AnimatedBottomSheet>

<AnimatedBottomSheet
  visible={showHistoryPreview}
  onClose={() => {
    lightTap();
    setShowHistoryPreview(false);
  }}
>
  <View style={styles.appleSheetIcon}>
    <Ionicons name="calendar-outline" size={25} color="#58E7FF" />
  </View>

  <Text style={styles.sheetTitle}>Check-in history</Text>

  <Text style={styles.sheetSubtitle}>
    Free preview shows your latest 5 check-ins. Full calendar, month trends and
    long-term patterns are part of Dara Premium.
  </Text>

  <View style={styles.recordList}>
    {recentCheckIns.length > 0 ? (
      recentCheckIns.map((item) => (
        <View key={item.createdAt} style={styles.recordItem}>
          <Ionicons name="pulse-outline" size={20} color="#58E7FF" />

          <View style={styles.recordTextBlock}>
            <Text style={styles.recordTitle}>
              {formatCheckInDate(item.createdAt)}
            </Text>
            <Text style={styles.recordText}>
              Energy {item.energy}/10 · Stress {item.stress}/10 · Load{" "}
              {item.workload}/10
            </Text>
          </View>
        </View>
      ))
    ) : (
      <Text style={styles.historyEmptyText}>
        Your recent check-ins will appear here.
      </Text>
    )}
  </View>


<AnimatedPressable
  style={styles.sheetButton}
  pressedScale={0.97}
  onPress={() => {
    lightTap();
    setShowHistoryPreview(false);
    onOpenPremium?.();
  }}
>
  <Text style={styles.sheetButtonText}>Unlock full history</Text>
</AnimatedPressable>
</AnimatedBottomSheet>

      <AnimatedBottomSheet
        visible={showContextSheet}
        onClose={() => {
          lightTap();
          setShowContextSheet(false);
        }}
      >
        <View style={styles.contextSheetIcon}>
          <Ionicons name="sparkles-outline" size={25} color="#B9C6FF" />
        </View>

        <Text style={styles.sheetTitle}>Today context</Text>

        <Text style={styles.sheetSubtitle}>
          Notes, meals and events saved today. Dara will later connect these
          with your daily check-in patterns.
        </Text>

<ScrollView
  style={styles.contextListScroll}
  contentContainerStyle={styles.contextList}
  showsVerticalScrollIndicator={false}
>
  {todayContextEvents.length > 0 ? (
    todayContextEvents.map((item) => (
      <View key={item.id} style={styles.contextItem}>
        <View style={styles.contextItemIcon}>
          <Ionicons
            name={
              item.type === "meal"
                ? "restaurant-outline"
                : item.type === "event"
                  ? "flash-outline"
                  : "document-text-outline"
            }
            size={20}
            color="#B9C6FF"
          />
        </View>

        <View style={{ flex: 1 }}>
          <View style={styles.contextItemTop}>
            <Text style={styles.contextItemTitle}>{item.title}</Text>
            <Text style={styles.contextItemTime}>
              {formatContextTime(item.createdAt)}
            </Text>
          </View>

          {item.text ? (
            <Text style={styles.contextItemText}>{item.text}</Text>
          ) : null}


{item.type === "meal" && item.photoUri ? (
  <Text style={styles.contextItemText}>
    Meal photo saved for future analysis.
  </Text>
) : null}
        </View>
      </View>
    ))
  ) : (
    <Text style={styles.contextEmptyText}>
      No context saved yet. After your daily check-in, use Add context to add a
      note, meal or event.
    </Text>
  )}
</ScrollView>
        <AnimatedPressable
          style={styles.sheetButton}
          pressedScale={0.97}
          onPress={() => {
            lightTap();
            setShowContextSheet(false);
          }}
        >
          <Text style={styles.sheetButtonText}>Got it</Text>
        </AnimatedPressable>
      </AnimatedBottomSheet>
    </ScreenBackground>
  );
}



const styles = StyleSheet.create({

  content: {
    paddingTop: 22,
    paddingBottom: 140,
  },

  headerRow: {
    paddingHorizontal: 20,
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
    marginHorizontal: 20,
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

  pressableFullWidth: {
    width: "100%",
    paddingHorizontal: 20,
  },

  profileCardWrap: {
    paddingHorizontal: 20,
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








  personalBaselineCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 28,
    padding: 16,
    backgroundColor: "rgba(120,150,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(185,198,255,0.26)",
    marginBottom: 24,
  },

  personalBaselineIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(185,198,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(185,198,255,0.34)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  externalContextCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 28,
    padding: 16,
    backgroundColor: "rgba(201,107,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(201,107,255,0.24)",
    marginBottom: 24,
  },

  externalContextIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(201,107,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(201,107,255,0.30)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
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

  externalSheetIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(201,107,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(201,107,255,0.34)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },

  appleHealthCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 28,
    padding: 16,
    backgroundColor: "rgba(88,231,255,0.09)",
    borderWidth: 1,
    borderColor: "rgba(88,231,255,0.22)",
    marginBottom: 24,
  },

  appleHealthIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(88,231,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(88,231,255,0.28)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  connectionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    marginLeft: 10,
  },

  connectionBadgeText: {
    color: "rgba(255,255,255,0.66)",
    fontSize: 11,
    fontWeight: "900",
  },

  latestCheckInCard: {
    borderRadius: 28,
    padding: 16,
    backgroundColor: "rgba(88,231,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(88,231,255,0.20)",
    marginBottom: 24,
  },

  latestCheckInTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  latestCheckInIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(88,231,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(88,231,255,0.28)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  latestCheckInTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 4,
  },

  latestCheckInText: {
    color: "rgba(255,255,255,0.66)",
    fontSize: 14,
    lineHeight: 19,
  },

  latestCheckInStats: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },

  latestCheckInStat: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  latestCheckInStatValue: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 3,
  },

  latestCheckInStatLabel: {
    color: "rgba(255,255,255,0.54)",
    fontSize: 11,
    fontWeight: "800",
  },

  latestCheckInNote: {
    marginTop: 12,
    borderRadius: 18,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.055)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  latestCheckInNoteLabel: {
    color: "#B9C6FF",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.4,
    marginBottom: 5,
    textTransform: "uppercase",
  },

  latestCheckInNoteText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 14,
    lineHeight: 20,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "900",
    letterSpacing: -0.5,
    marginBottom: 12,
  },

  profileSectionTitle: {
    paddingHorizontal: 20,
  },

  areaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 20,
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

  logoutButton: {
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 28,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255,100,124,0.075)",
    borderWidth: 1,
    borderColor: "rgba(255,100,124,0.22)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  logoutButtonText: {
    color: "#FF9AA8",
    fontSize: 14,
    fontWeight: "900",
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

  healthSheetIcon: {
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

  appleSheetIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "rgba(88,231,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(88,231,255,0.28)",
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

  healthRecordActionsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },

  healthRecordActionButton: {
    flex: 1,
  },

  attachedRecordCard: {
    borderRadius: 24,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.055)",
    borderWidth: 1,
    borderColor: "rgba(255,100,124,0.24)",
    marginBottom: 16,
  },

  attachedRecordHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
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

  analyzeRecordButton: {
    marginTop: 14,
    borderRadius: 18,
    paddingVertical: 13,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.085)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    alignSelf: "stretch",
  },

  analyzeRecordButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  attachedRecordText: {
    color: "rgba(255,255,255,0.66)",
    fontSize: 13,
    lineHeight: 18,
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
historyCard: {
  borderRadius: 26,
  padding: 14,
  backgroundColor: "rgba(8, 16, 38, 0.54)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.14)",
  marginBottom: 24,
},

historyRow: {
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: 10,
  borderBottomWidth: 1,
  borderBottomColor: "rgba(255,255,255,0.08)",
},

historyDatePill: {
  minWidth: 62,
  borderRadius: 999,
  paddingHorizontal: 10,
  paddingVertical: 7,
  backgroundColor: "rgba(185,198,255,0.12)",
  borderWidth: 1,
  borderColor: "rgba(185,198,255,0.18)",
  marginRight: 12,
  alignItems: "center",
},

historyDateText: {
  color: "#B9C6FF",
  fontSize: 12,
  fontWeight: "900",
},

historyMetrics: {
  flex: 1,
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 8,
},

historyMetricText: {
  color: "rgba(255,255,255,0.68)",
  fontSize: 13,
  fontWeight: "800",
},

historyEmptyText: {
  color: "rgba(255,255,255,0.58)",
  fontSize: 14,
  lineHeight: 20,
},

todayContextCard: {
  minHeight: 86,
  borderRadius: 26,
  padding: 14,
  marginBottom: 24,
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "rgba(8, 16, 38, 0.54)",
  borderWidth: 1,
  borderColor: "rgba(185,198,255,0.18)",
},

todayContextIcon: {
  width: 50,
  height: 50,
  borderRadius: 25,
  backgroundColor: "rgba(185,198,255,0.12)",
  borderWidth: 1,
  borderColor: "rgba(185,198,255,0.26)",
  alignItems: "center",
  justifyContent: "center",
  marginRight: 13,
},

todayContextTextBlock: {
  flex: 1,
},

todayContextTitle: {
  color: "#FFFFFF",
  fontSize: 18,
  fontWeight: "900",
  marginBottom: 4,
},

todayContextText: {
  color: "rgba(255,255,255,0.62)",
  fontSize: 14,
  lineHeight: 19,
},

todayContextArrow: {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: "rgba(255,255,255,0.07)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.10)",
  alignItems: "center",
  justifyContent: "center",
  marginLeft: 10,
},

contextSheetIcon: {
  width: 54,
  height: 54,
  borderRadius: 27,
  backgroundColor: "rgba(185,198,255,0.12)",
  borderWidth: 1,
  borderColor: "rgba(185,198,255,0.28)",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 14,
},

contextList: {
  gap: 12,
  paddingBottom: 4,
},


contextItem: {
  flexDirection: "row",
  alignItems: "flex-start",
  borderRadius: 20,
  padding: 14,
  backgroundColor: "rgba(255,255,255,0.055)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.10)",
},

contextItemIcon: {
  width: 38,
  height: 38,
  borderRadius: 19,
  backgroundColor: "rgba(185,198,255,0.10)",
  borderWidth: 1,
  borderColor: "rgba(185,198,255,0.20)",
  alignItems: "center",
  justifyContent: "center",
  marginRight: 12,
},

contextItemTop: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 5,
},

contextItemTitle: {
  color: "#FFFFFF",
  fontSize: 15,
  fontWeight: "900",
},

contextItemTime: {
  color: "rgba(255,255,255,0.42)",
  fontSize: 12,
  fontWeight: "800",
},

contextItemText: {
  color: "rgba(255,255,255,0.66)",
  fontSize: 14,
  lineHeight: 20,
},

contextItemImage: {
  width: "100%",
  height: 150,
  borderRadius: 16,
  marginTop: 10,
},

contextEmptyText: {
  color: "rgba(255,255,255,0.58)",
  fontSize: 14,
  lineHeight: 20,
},

contextListScroll: {
  maxHeight: 360,
  marginBottom: 22,
},

});
