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
  const userSignals = data.dailyCheckIn
    ? mapCheckInToSignals(DEFAULT_USER_SIGNALS, data.dailyCheckIn)
    : DEFAULT_USER_SIGNALS;

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
  });

  const forecast = buildForecast({
    latestCheckIn: data.dailyCheckIn,
    checkInHistory: data.dailyCheckInHistory,
    contextEvents: data.dailyContextEvents,
    externalContext: data.externalContext,
    patterns,
  });

  const externalSignalsView = {
    health: data.externalProviders?.health ?? null,
    weather: data.externalProviders?.weather ?? null,
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

  return {
    activeSignal,
    summary,
    homeSignals,
    forecast,
    patterns,
    externalSignalsView,
    insightsView,
    forecastView,
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
