import { useCallback, useEffect, useState } from "react";

import type {
  DailyCheckInData,
  DailyContextEvent,
  ExternalContextData,
  HealthRecordFile,
  StoredHealthSummary,
  PersonalSetupData,
} from "./storage";
import { buildMockExternalContext } from "./lib/external-context";
import {
  loadExternalProviderBundle,
  type ExternalProviderBundle,
} from "./lib/providers/external-providers";

import {
  loadDailyCheckIn,
  loadDailyCheckInHistory,
  loadDailyContextEvents,
  loadHealthRecord,
  loadHealthSummary,
  loadPersonalSetup,
} from "./storage";

export type DaraUserData = {
  personalSetup: PersonalSetupData | null;
  dailyCheckIn: DailyCheckInData | null;
  dailyCheckInHistory: DailyCheckInData[];
  dailyContextEvents: DailyContextEvent[];
  externalContext: ExternalContextData | null;
  externalProviders: ExternalProviderBundle | null;
  healthRecord: HealthRecordFile | null;
  healthSummary: StoredHealthSummary | null;
};

const EMPTY_DARA_DATA: DaraUserData = {
  personalSetup: null,
  dailyContextEvents: [],
  dailyCheckIn: null,
  dailyCheckInHistory: [],
  externalContext: null,
  externalProviders: null,
  healthRecord: null,
  healthSummary: null,
};

export function useDaraData(dataVersion = 0) {
  const [data, setData] = useState<DaraUserData>(EMPTY_DARA_DATA);
  const [isLoading, setIsLoading] = useState(false);

  const reload = useCallback(async () => {
    setIsLoading(true);

    try {
      const [
  personalSetup,
  dailyCheckIn,
  dailyCheckInHistory,
  dailyContextEvents,
  healthRecord,
  healthSummary,
] = await Promise.all([
  loadPersonalSetup(),
  loadDailyCheckIn(),
  loadDailyCheckInHistory(),
  loadDailyContextEvents(),
  loadHealthRecord(),
  loadHealthSummary(),
]);
 
      const externalContext = buildMockExternalContext(personalSetup);
      const externalProviders = await loadExternalProviderBundle({
        country: personalSetup?.country ?? null,
        healthRecord,
      });

      setData({
        personalSetup,
        dailyContextEvents,
        externalContext,
        externalProviders,
        dailyCheckIn,
        dailyCheckInHistory,
        healthRecord,
        healthSummary,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload, dataVersion]);

  return {
    data,
    isLoading,
    reload,
  };
}
