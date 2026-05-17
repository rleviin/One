import type { DaraUserData } from "../useDaraData";
import type { UserSignals } from "../types";
import { mapCheckInToSignals } from "../daraModel";

import {
  buildActiveSignalFromCheckIn,
  buildDailySummary,
  buildHomeActionCards,
  buildHomeSignalCards,
  buildHomeSignals,
} from "./context-engine";

import { buildForecast } from "./forecast-engine";
import { buildPatternAnalysis } from "./pattern-engine";

const DEFAULT_USER_SIGNALS: UserSignals = {
  sleepHours: 6.2,
  workload: 7,
  recovery: 4,
  spendingPressure: 5,
};

export function buildDaraBrain(data: DaraUserData) {
  const healthAdjustedDefaults: UserSignals = {
    ...DEFAULT_USER_SIGNALS,
    sleepHours:
      data.healthSummary?.sleepHoursLastNight ??
      DEFAULT_USER_SIGNALS.sleepHours,
    recovery:
      data.healthSummary?.sleepHoursLastNight &&
      data.healthSummary.sleepHoursLastNight >= 7
        ? Math.min(DEFAULT_USER_SIGNALS.recovery + 1, 10)
        : data.healthSummary?.sleepHoursLastNight &&
            data.healthSummary.sleepHoursLastNight < 6
          ? Math.max(DEFAULT_USER_SIGNALS.recovery - 1, 1)
          : DEFAULT_USER_SIGNALS.recovery,
  };

  const userSignals = data.dailyCheckIn
    ? mapCheckInToSignals(healthAdjustedDefaults, data.dailyCheckIn)
    : healthAdjustedDefaults;

  const activeSignal =
    buildActiveSignalFromCheckIn(data.dailyCheckIn);

  const summary = buildDailySummary({
    checkIn: data.dailyCheckIn,
    contextEvents: data.dailyContextEvents,
    personalSetup: data.personalSetup,
    externalContext: data.externalContext,
  });

  const homeSignals = buildHomeSignals({
    checkIn: data.dailyCheckIn,
    contextEvents: data.dailyContextEvents,
  });

  const patterns = buildPatternAnalysis({
    checkInHistory: data.dailyCheckInHistory,
    contextEvents: data.dailyContextEvents,
    healthSummary: data.healthSummary,
    bloodTestSummary: data.healthRecord?.analysisSummary ?? null,
    bloodTestFocusAreas: data.healthRecord?.analysisFocusAreas ?? [],
    bloodTestBiomarkers: data.healthRecord?.analysisBiomarkers ?? [],
  });

  const forecast = buildForecast({
    latestCheckIn: data.dailyCheckIn,
    checkInHistory: data.dailyCheckInHistory,
    contextEvents: data.dailyContextEvents,
    externalContext: data.externalContext,
    externalProviders: data.externalProviders,
    healthSummary: data.healthSummary,
    bloodTestSummary: data.healthRecord?.analysisSummary ?? null,
    bloodTestFocusAreas: data.healthRecord?.analysisFocusAreas ?? [],
    bloodTestBiomarkers: data.healthRecord?.analysisBiomarkers ?? [],
    patterns,
  });

  const externalSignalsView = {
    health: data.externalProviders?.health ?? null,
    location: data.externalProviders?.location ?? null,
    weather: data.externalProviders?.weather ?? null,
    probability: data.externalProviders?.probability ?? null,
    healthRecordStatus:
      data.externalProviders?.health.healthRecord.status ?? "not_uploaded",
  };

  const insightsView = {
    patterns,
    externalSignals: externalSignalsView,
  };

  const forecastView = {
    hero: {
      title: forecast.title,
      summary: forecast.summary,
      badge: forecast.badge,
      accent: forecast.accent,
      icon: forecast.icon,
      confidence: forecast.confidence,
      risk: forecast.risk,
      likelihood: forecast.likelihood,
    },
    timeline: forecast.timeline,
    reasons: forecast.reasons,
    actions: forecast.changePoints,
  };

  const bloodTestContext = data.healthRecord?.analysisSummary
    ? {
        title: data.healthRecord.analysisTitle ?? "Blood test analysis",
        summary: data.healthRecord.analysisSummary,
        focusAreas: data.healthRecord.analysisFocusAreas ?? [],
        biomarkers: data.healthRecord.analysisBiomarkers ?? [],
        recommendations: data.healthRecord.analysisRecommendations ?? [],
        confidence: data.healthRecord.analysisConfidence ?? null,
        analyzedAt: data.healthRecord.analyzedAt ?? null,
      }
    : null;

  const healthContext = data.healthSummary
    ? {
        sleepHoursLastNight: data.healthSummary.sleepHoursLastNight,
        stepsToday: data.healthSummary.stepsToday,
        activeEnergyToday: data.healthSummary.activeEnergyToday,
        heartRateSamples: data.healthSummary.heartRateSamples,
        hrvSamples: data.healthSummary.hrvSamples,
        updatedAt: data.healthSummary.updatedAt,
      }
    : null;

  const aiContext = {
    latestCheckIn: data.dailyCheckIn,
    contextCount: data.dailyContextEvents.length,
    forecast: forecastView.hero,
    patterns: patterns.slice(0, 5),
    externalSignals: externalSignalsView,
    healthContext,
    bloodTestContext,
  };

  return {
    activeSignal,
    summary,
    homeSignals,
    forecast,
    patterns,
    externalSignalsView,
    insightsView,
    forecastView,
    aiContext,
    home: {
      activeSignal,
      signals: homeSignals,
      userSignals,
      signalCards: buildHomeSignalCards(userSignals),
      actions: buildHomeActionCards(),
      summary,
    },
  };
}
