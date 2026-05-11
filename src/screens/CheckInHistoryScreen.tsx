import React, { useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import ScreenBackground from "../components/ScreenBackground";
import AnimatedPressable from "../components/AnimatedPressable";
import AnimatedBottomSheet from "../components/AnimatedBottomSheet";
import { useDaraData } from "../useDaraData";
import type { DailyCheckInData, DailyContextEvent } from "../storage";
import { lightTap } from "../haptics";

type CheckInHistoryScreenProps = {
  dataVersion?: number;
  onDone: () => void;
};

const WEEK_DAYS = ["S", "M", "T", "W", "T", "F", "S"];

function getRiskColor(item: DailyCheckInData) {
  const pressure =
    item.stress * 1.2 + item.workload * 1.1 + item.spendingPressure * 0.8 - item.energy * 0.9;

  if (pressure >= 14) {
    return "#FF647C";
  }

  if (pressure >= 8) {
    return "#FF8A4C";
  }

  return "#4EE28A";
}

function getDayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getItemDayKey(item: DailyCheckInData) {
  return item.createdAt.slice(0, 10);
}

function getContextDayKey(item: DailyContextEvent) {
  return item.createdAt.slice(0, 10);
}

function formatMonthTitle(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function formatFullDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function buildDayInsight(item: DailyCheckInData, contextCount: number) {
  const pressure =
    item.stress * 1.2 +
    item.workload * 1.1 +
    item.spendingPressure * 0.8 -
    item.energy * 0.9;

  if (pressure >= 14) {
    return "Dara reads this as a high-strain day. Lower load and stronger recovery would likely matter most.";
  }

  if (pressure >= 8) {
    return "Dara sees a watch-zone day: pressure was present, but still adjustable with recovery actions.";
  }

  if (contextCount > 0 && item.energy >= 7 && item.stress <= 4) {
    return "This looks like a well-contextualized stable day: good energy, lower stress and useful daily context.";
  }

  if (item.energy >= 7) {
    return "Recovery looked stable on this day. Dara would treat this as a useful baseline signal.";
  }

  return "Dara reads this as a lower-signal day. More context or repeated check-ins would improve interpretation.";
}

function buildMonthDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: Array<Date | null> = [];

  for (let index = 0; index < firstWeekday; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

export default function CheckInHistoryScreen({
  dataVersion = 0,
  onDone,
}: CheckInHistoryScreenProps) {
  const { data } = useDaraData(dataVersion);
  const history = data.dailyCheckInHistory;

  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [showPdfOptions, setShowPdfOptions] = useState(false);

  const monthDays = useMemo(() => buildMonthDays(visibleMonth), [visibleMonth]);

  const historyByDay = useMemo(() => {
    const map = new Map<string, DailyCheckInData[]>();

    history.forEach((item) => {
      const key = getItemDayKey(item);
      const existing = map.get(key) ?? [];
      map.set(key, [...existing, item]);
    });

    return map;
  }, [history]);

  const contextByDay = useMemo(() => {
    const map = new Map<string, DailyContextEvent[]>();

    data.dailyContextEvents.forEach((item) => {
      const key = getContextDayKey(item);
      const existing = map.get(key) ?? [];
      map.set(key, [...existing, item]);
    });

    return map;
  }, [data.dailyContextEvents]);

  const selectedKey = getDayKey(selectedDate);
  const selectedItems = historyByDay.get(selectedKey) ?? [];
  const selectedContextItems = contextByDay.get(selectedKey) ?? [];
  const selectedMealCount = selectedContextItems.filter(
    (item) => item.type === "meal"
  ).length;
  const selectedEventCount = selectedContextItems.filter(
    (item) => item.type === "event"
  ).length;
  const selectedNoteCount = selectedContextItems.filter(
    (item) => item.type === "note"
  ).length;

  const visibleMonthItems = history.filter((item) => {
    const date = new Date(item.createdAt);
    return (
      date.getFullYear() === visibleMonth.getFullYear() &&
      date.getMonth() === visibleMonth.getMonth()
    );
  });

  const averageEnergy =
    visibleMonthItems.length > 0
      ? visibleMonthItems.reduce((sum, item) => sum + item.energy, 0) /
        visibleMonthItems.length
      : 0;

  const averageStress =
    visibleMonthItems.length > 0
      ? visibleMonthItems.reduce((sum, item) => sum + item.stress, 0) /
        visibleMonthItems.length
      : 0;

  const recentWeekItems = history.slice(0, 7);

  const weeklyPatternSummary = useMemo(() => {
    if (recentWeekItems.length === 0) {
      return [
        "Save check-ins to unlock weekly pattern summaries.",
        "Dara will compare energy, stress and workload over time.",
      ];
    }

    const avgRecentEnergy =
      recentWeekItems.reduce((sum, item) => sum + item.energy, 0) /
      recentWeekItems.length;

    const avgRecentStress =
      recentWeekItems.reduce((sum, item) => sum + item.stress, 0) /
      recentWeekItems.length;

    const highLoadDays = recentWeekItems.filter(
      (item) => item.workload >= 7 || item.stress >= 7
    ).length;

    const points = [
      avgRecentEnergy >= 7
        ? "Recovery trend looks stable across recent check-ins."
        : "Recovery may need more support across recent check-ins.",
      avgRecentStress >= 6
        ? "Stress accumulation is visible in the recent pattern."
        : "Stress appears manageable in the recent pattern.",
      highLoadDays >= 3
        ? `${highLoadDays} high-load days detected recently.`
        : "No strong overload streak detected recently.",
    ];

    return points;
  }, [recentWeekItems]);

  function moveMonth(direction: -1 | 1) {
    lightTap();
    setVisibleMonth((current) => {
      const next = new Date(current);
      next.setMonth(current.getMonth() + direction);
      return next;
    });
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
              <Ionicons name="chevron-back" size={25} color="#FFFFFF" />
            </AnimatedPressable>

            <View style={styles.headerTextBlock}>
              <Text style={styles.eyebrow}>CHECK-IN HISTORY</Text>
              <Text style={styles.title}>Your signal calendar</Text>
            </View>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryIcon}>
              <Ionicons name="calendar-outline" size={24} color="#58E7FF" />
            </View>

            <Text style={styles.summaryTitle}>
              Dara tracks repeated patterns over time.
            </Text>
            <Text style={styles.summaryText}>
              Colored days show how your energy, stress, workload and pressure
              moved together.
            </Text>

            <View style={styles.summaryStats}>
              <View style={styles.summaryStat}>
                <Text style={styles.summaryStatValue}>
                  {visibleMonthItems.length}
                </Text>
                <Text style={styles.summaryStatLabel}>check-ins</Text>
              </View>

              <View style={styles.summaryStat}>
                <Text style={styles.summaryStatValue}>
                  {averageEnergy ? averageEnergy.toFixed(1) : "—"}
                </Text>
                <Text style={styles.summaryStatLabel}>avg energy</Text>
              </View>

              <View style={styles.summaryStat}>
                <Text style={styles.summaryStatValue}>
                  {averageStress ? averageStress.toFixed(1) : "—"}
                </Text>
                <Text style={styles.summaryStatLabel}>avg stress</Text>
              </View>
            </View>
          </View>

          <View style={styles.weeklyPatternCard}>
            <View style={styles.weeklyPatternHeader}>
              <View style={styles.weeklyPatternIcon}>
                <Ionicons name="analytics-outline" size={21} color="#C96BFF" />
              </View>

              <View>
                <Text style={styles.weeklyPatternEyebrow}>AI SUMMARY</Text>
                <Text style={styles.weeklyPatternTitle}>Weekly pattern summary</Text>
              </View>
            </View>

            <View style={styles.weeklyPatternList}>
              {weeklyPatternSummary.map((point, index) => (
                <View key={index} style={styles.weeklyPatternItem}>
                  <View style={styles.weeklyPatternDot} />
                  <Text style={styles.weeklyPatternText}>{point}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.calendarCard}>
            <View style={styles.monthHeader}>
              <AnimatedPressable
                style={styles.monthButton}
                pressedScale={0.92}
                onPress={() => moveMonth(-1)}
              >
                <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
              </AnimatedPressable>

              <Text style={styles.monthTitle}>{formatMonthTitle(visibleMonth)}</Text>

              <AnimatedPressable
                style={styles.monthButton}
                pressedScale={0.92}
                onPress={() => moveMonth(1)}
              >
                <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
              </AnimatedPressable>
            </View>

            <View style={styles.weekRow}>
              {WEEK_DAYS.map((day, index) => (
                <Text key={`${day}-${index}`} style={styles.weekDay}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {monthDays.map((date, index) => {
                if (!date) {
                  return <View key={`empty-${index}`} style={styles.dayCell} />;
                }

                const key = getDayKey(date);
                const dayItems = historyByDay.get(key) ?? [];
                const dayContextItems = contextByDay.get(key) ?? [];
                const hasCheckIn = dayItems.length > 0;
                const hasContext = dayContextItems.length > 0;
                const isSelected = key === selectedKey;
                const color = hasCheckIn ? getRiskColor(dayItems[0]) : "transparent";

                return (
                  <Pressable
                    key={key}
                    style={[
                      styles.dayCell,
                      isSelected && styles.dayCellSelected,
                    ]}
                    onPress={() => {
                      lightTap();
                      setSelectedDate(date);
                    }}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isSelected && styles.dayTextSelected,
                      ]}
                    >
                      {date.getDate()}
                    </Text>

                    <View style={styles.dayIndicators}>
                      {hasCheckIn && (
                        <View style={[styles.dayDot, { backgroundColor: color }]} />
                      )}

                      {hasContext && <View style={styles.contextDot} />}
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#4EE28A" }]} />
                <Text style={styles.legendText}>stable</Text>
              </View>

              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#FF8A4C" }]} />
                <Text style={styles.legendText}>watch</Text>
              </View>

              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: "#FF647C" }]} />
                <Text style={styles.legendText}>high strain</Text>
              </View>
            </View>
          </View>

          <View style={styles.trendCard}>
            <Text style={styles.sectionTitle}>Month trend</Text>

            <View style={styles.trendBars}>
              {visibleMonthItems.slice(0, 14).reverse().map((item) => (
                <View key={item.createdAt} style={styles.trendBarColumn}>
                  <View
                    style={[
                      styles.trendBarEnergy,
                      { height: Math.max(8, item.energy * 8) },
                    ]}
                  />
                  <View
                    style={[
                      styles.trendBarStress,
                      { height: Math.max(8, item.stress * 8) },
                    ]}
                  />
                </View>
              ))}

              {visibleMonthItems.length === 0 && (
                <Text style={styles.emptyText}>
                  Save check-ins to see energy and stress trends.
                </Text>
              )}
            </View>

            <View style={styles.trendLegend}>
              <Text style={styles.trendLegendText}>Energy</Text>
              <Text style={styles.trendLegendText}>Stress</Text>
            </View>
          </View>

          <View style={styles.selectedCard}>
            <Text style={styles.sectionTitle}>
              {formatFullDate(selectedDate)}
            </Text>

            {selectedContextItems.length > 0 ? (
              <View style={styles.selectedContextSummary}>
                <View style={styles.contextSummaryItem}>
                  <Ionicons name="restaurant-outline" size={16} color="#58E7FF" />
                  <Text style={styles.contextSummaryText}>
                    Meals {selectedMealCount}
                  </Text>
                </View>

                <View style={styles.contextSummaryItem}>
                  <Ionicons name="flash-outline" size={16} color="#FF8A4C" />
                  <Text style={styles.contextSummaryText}>
                    Events {selectedEventCount}
                  </Text>
                </View>

                <View style={styles.contextSummaryItem}>
                  <Ionicons name="document-text-outline" size={16} color="#B9C6FF" />
                  <Text style={styles.contextSummaryText}>
                    Notes {selectedNoteCount}
                  </Text>
                </View>
              </View>
            ) : null}

            {selectedItems.length > 0 ? (
              selectedItems.map((item) => (
                <View key={item.createdAt} style={styles.selectedItem}>
                  <View style={styles.selectedItemTop}>
                    <Text style={styles.selectedItemTitle}>
                      Energy {item.energy}/10
                    </Text>
                    <View
                      style={[
                        styles.riskPill,
                        { borderColor: `${getRiskColor(item)}66` },
                      ]}
                    >
                      <View
                        style={[
                          styles.riskDot,
                          { backgroundColor: getRiskColor(item) },
                        ]}
                      />
                      <Text style={styles.riskText}>signal</Text>
                    </View>
                  </View>

                  <Text style={styles.selectedItemText}>
                    Stress {item.stress}/10 · Workload {item.workload}/10 · Money{" "}
                    {item.spendingPressure}/10
                  </Text>

                  <View style={styles.dayInsightBox}>
                    <Ionicons name="sparkles-outline" size={17} color="#B9C6FF" />
                    <Text style={styles.dayInsightText}>
                      {buildDayInsight(item, selectedContextItems.length)}
                    </Text>
                  </View>

                  {item.note ? (
                    <Text style={styles.selectedNote}>{item.note}</Text>
                  ) : null}
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>
                No check-in saved for this date.
              </Text>
            )}
          </View>

          <AnimatedPressable
            style={styles.pdfButton}
            pressedScale={0.975}
            onPress={() => {
              lightTap();
              setShowPdfOptions(true);
            }}
          >
            <View style={styles.pdfButtonIcon}>
              <Ionicons name="document-text-outline" size={22} color="#07101F" />
            </View>

            <View style={styles.pdfButtonTextBlock}>
              <Text style={styles.pdfButtonTitle}>Export PDF snapshot</Text>
              <Text style={styles.pdfButtonText}>
                Short report with scores, patterns and recommendations.
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color="#07101F" />
          </AnimatedPressable>
        </ScrollView>

        <AnimatedBottomSheet
          visible={showPdfOptions}
          onClose={() => {
            lightTap();
            setShowPdfOptions(false);
          }}
        >
          <View style={styles.pdfSheetIcon}>
            <Ionicons name="document-text-outline" size={25} color="#4ADE80" />
          </View>

          <Text style={styles.pdfSheetTitle}>Choose report period</Text>

          <Text style={styles.pdfSheetText}>
            Dara will compress patterns, recovery, stress, context and forecast
            signals into a compact PDF snapshot.
          </Text>

          <View style={styles.periodList}>
            {["Last 7 days", "Last 30 days", "Last 90 days", "Custom range later"].map(
              (label, index) => (
                <AnimatedPressable
                  key={label}
                  style={styles.periodOption}
                  pressedScale={0.97}
                  onPress={() => {
                    lightTap();
                    setShowPdfOptions(false);
                  }}
                >
                  <View style={styles.periodOptionIcon}>
                    <Ionicons
                      name={index === 3 ? "calendar-outline" : "time-outline"}
                      size={20}
                      color="#4ADE80"
                    />
                  </View>

                  <View style={styles.periodOptionTextBlock}>
                    <Text style={styles.periodOptionTitle}>{label}</Text>
                    <Text style={styles.periodOptionText}>
                      {index === 3
                        ? "Select exact dates in a future update."
                        : "Generate a short intelligence snapshot."}
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color="rgba(255,255,255,0.72)"
                  />
                </AnimatedPressable>
              )
            )}
          </View>
        </AnimatedBottomSheet>
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
    paddingBottom: 150,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
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
    marginRight: 14,
  },

  headerTextBlock: {
    flex: 1,
  },

  eyebrow: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 3.5,
    marginBottom: 6,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "900",
    letterSpacing: -1.1,
  },

  summaryCard: {
    borderRadius: 30,
    padding: 20,
    backgroundColor: "rgba(8, 16, 38, 0.58)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    marginBottom: 16,
  },

  summaryIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "rgba(88,231,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(88,231,255,0.28)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  summaryTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    lineHeight: 29,
    fontWeight: "900",
    marginBottom: 8,
  },

  summaryText: {
    color: "rgba(255,255,255,0.66)",
    fontSize: 15,
    lineHeight: 22,
  },

  summaryStats: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },

  summaryStat: {
    flex: 1,
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  summaryStatValue: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "900",
    marginBottom: 3,
  },

  summaryStatLabel: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 11,
    fontWeight: "800",
  },

  weeklyPatternCard: {
    borderRadius: 30,
    padding: 18,
    backgroundColor: "rgba(8, 16, 38, 0.58)",
    borderWidth: 1,
    borderColor: "rgba(201,107,255,0.22)",
    marginBottom: 16,
  },

  weeklyPatternHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  weeklyPatternIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(201,107,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(201,107,255,0.30)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  weeklyPatternEyebrow: {
    color: "rgba(255,255,255,0.50)",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2.2,
    marginBottom: 3,
  },

  weeklyPatternTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "900",
  },

  weeklyPatternList: {
    gap: 10,
  },

  weeklyPatternItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  weeklyPatternDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#C96BFF",
    marginTop: 7,
    marginRight: 10,
  },

  weeklyPatternText: {
    flex: 1,
    color: "rgba(255,255,255,0.68)",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
  },

  calendarCard: {
    borderRadius: 30,
    padding: 18,
    backgroundColor: "rgba(8, 16, 38, 0.58)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    marginBottom: 16,
  },

  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  monthButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  monthTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "900",
  },

  weekRow: {
    flexDirection: "row",
    marginBottom: 8,
  },

  weekDay: {
    flex: 1,
    textAlign: "center",
    color: "rgba(255,255,255,0.48)",
    fontSize: 12,
    fontWeight: "900",
  },

  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  dayCell: {
    width: `${100 / 7}%`,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },

  dayCellSelected: {
    backgroundColor: "rgba(255,255,255,0.10)",
  },

  dayText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 14,
    fontWeight: "800",
  },

  dayTextSelected: {
    color: "#FFFFFF",
  },

  dayIndicators: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 3,
  },

  contextDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#58E7FF",
  },

  dayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
  },

  legendRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 14,
    marginTop: 14,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },

  legendText: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 12,
    fontWeight: "800",
  },

  trendCard: {
    borderRadius: 28,
    padding: 18,
    backgroundColor: "rgba(8, 16, 38, 0.54)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    marginBottom: 16,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 14,
  },

  trendBars: {
    minHeight: 100,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 9,
  },

  trendBarColumn: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 3,
  },

  trendBarEnergy: {
    width: 7,
    borderRadius: 99,
    backgroundColor: "#58E7FF",
  },

  trendBarStress: {
    width: 7,
    borderRadius: 99,
    backgroundColor: "#FF647C",
  },

  trendLegend: {
    flexDirection: "row",
    gap: 14,
    marginTop: 12,
  },

  trendLegendText: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 12,
    fontWeight: "900",
  },

  pdfSheetIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(74,222,128,0.14)",
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.30)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  pdfSheetTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    lineHeight: 33,
    fontWeight: "900",
    letterSpacing: -0.7,
    marginBottom: 10,
  },

  pdfSheetText: {
    color: "rgba(255,255,255,0.64)",
    fontSize: 16,
    lineHeight: 23,
    fontWeight: "600",
    marginBottom: 18,
  },

  periodList: {
    gap: 10,
  },

  periodOption: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 22,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  periodOptionIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(74,222,128,0.12)",
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.24)",
    marginRight: 12,
  },

  periodOptionTextBlock: {
    flex: 1,
  },

  periodOptionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 3,
  },

  periodOptionText: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },

  pdfButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 26,
    padding: 15,
    backgroundColor: "rgba(255,255,255,0.92)",
    marginTop: 4,
    marginBottom: 22,
  },

  pdfButtonIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(7,16,31,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  pdfButtonTextBlock: {
    flex: 1,
  },

  pdfButtonTitle: {
    color: "#07101F",
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 3,
  },

  pdfButtonText: {
    color: "rgba(7,16,31,0.62)",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },

  selectedCard: {
    borderRadius: 28,
    padding: 18,
    backgroundColor: "rgba(8, 16, 38, 0.54)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },

  selectedContextSummary: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },

  contextSummaryItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: "rgba(255,255,255,0.07)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  contextSummaryText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 5,
  },

  selectedItem: {
    borderRadius: 22,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.055)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    marginBottom: 10,
  },

  selectedItemTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  selectedItemTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },

  selectedItemText: {
    color: "rgba(255,255,255,0.66)",
    fontSize: 14,
    lineHeight: 20,
  },

  dayInsightBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: 18,
    padding: 12,
    backgroundColor: "rgba(185,198,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(185,198,255,0.16)",
    marginTop: 12,
  },

  dayInsightText: {
    flex: 1,
    color: "rgba(255,255,255,0.70)",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
    marginLeft: 8,
  },

  selectedNote: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
  },

  riskPill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
  },

  riskDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },

  riskText: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 11,
    fontWeight: "900",
  },

  emptyText: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 14,
    lineHeight: 20,
  },
});
