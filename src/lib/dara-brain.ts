import type { DaraUserData } from "../useDaraData";

import {
  buildActiveSignalFromCheckIn,
  buildDailySummary,
  buildHomeSignals,
} from "./context-engine";

import { buildForecast } from "./forecast-engine";

export function buildDaraBrain(data: DaraUserData) {
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

  const forecast = buildForecast({
    latestCheckIn: data.dailyCheckIn,
    checkInHistory: data.dailyCheckInHistory,
    contextEvents: data.dailyContextEvents,
    externalContext: data.externalContext,
  });

  return {
    activeSignal,
    summary,
    homeSignals,
    forecast,
  };
}
