import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDaraAuthToken, getDaraAuthUserId } from "./lib/auth-client";
import { DARA_API_URL } from "./lib/config";

export type PersonalSetupData = {
  country: string;
  age: string;
  height: string;
  weight: string;
  workType: string;
  incomeRange: string;
  spendingRange: string;
  dailyContext: string;
};

export type DailyCheckInData = {
  energy: number;
  stress: number;
  workload: number;
  spendingPressure: number;
  note: string;
  mealPhotoUri: string | null;
  createdAt: string;
};

export type DailyContextEventType = "note" | "meal" | "event";

export type DailyContextEvent = {
  id: string;
  type: DailyContextEventType;
  title: string;
  text?: string;
  photoUri?: string | null;
  aiSummary?: string;
  mealEnergyImpact?: string;
  createdAt: string;
};

export type ExternalContextData = {
  country: string;
  economicPressure: "low" | "medium" | "high";
  inflationTrend: "falling" | "stable" | "rising";
  costOfLivingPressure: "low" | "medium" | "high";
  politicalStability: "stable" | "watch" | "volatile";
  updatedAt: string;
};

const PERSONAL_SETUP_KEY = "dara.personalSetup";
const DAILY_CHECK_IN_KEY = "dara.dailyCheckIn.latest";
const DAILY_CHECK_IN_HISTORY_KEY = "dara.dailyCheckIn.history";
const MAX_DAILY_CHECK_INS = 30;
const DAILY_CONTEXT_EVENTS_KEY = "dara.dailyContext.events";
const MAX_DAILY_CONTEXT_EVENTS = 200;
const EXTERNAL_CONTEXT_KEY = "dara.externalContext.latest";


async function getUserScopedKey(baseKey: string) {
  const userId = await getDaraAuthUserId();
  return userId ? `${baseKey}.${userId}` : baseKey;
}

async function getAuthHeaders() {
  const token = await getDaraAuthToken();

  if (!token) {
    return null;
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function savePersonalSetupToCloud(data: PersonalSetupData) {
  const headers = await getAuthHeaders();

  if (!headers) {
    return;
  }

  await fetch(`${DARA_API_URL}/api/user/personal-setup`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
}

async function loadPersonalSetupFromCloud(): Promise<PersonalSetupData | null> {
  const headers = await getAuthHeaders();

  if (!headers) {
    return null;
  }

  const response = await fetch(`${DARA_API_URL}/api/user/personal-setup`, {
    headers,
  });

  if (!response.ok) {
    return null;
  }

  const json = await response.json();
  return json.personalSetup ?? null;
}


export async function savePersonalSetup(data: PersonalSetupData) {
  await AsyncStorage.setItem(
    await getUserScopedKey(PERSONAL_SETUP_KEY),
    JSON.stringify(data)
  );

  try {
    await savePersonalSetupToCloud(data);
  } catch {
    // Keep local setup even if cloud sync fails.
  }
}

export async function loadPersonalSetup(): Promise<PersonalSetupData | null> {
  try {
    const cloudSetup = await loadPersonalSetupFromCloud();

    if (cloudSetup) {
      await AsyncStorage.setItem(
        await getUserScopedKey(PERSONAL_SETUP_KEY),
        JSON.stringify(cloudSetup)
      );

      return cloudSetup;
    }
  } catch {
    // Fall back to local setup if cloud sync fails.
  }

  const raw = await AsyncStorage.getItem(await getUserScopedKey(PERSONAL_SETUP_KEY));
  return raw ? JSON.parse(raw) : null;
}

export async function saveExternalContext(data: ExternalContextData) {
  await AsyncStorage.setItem(await getUserScopedKey(EXTERNAL_CONTEXT_KEY), JSON.stringify(data));
}

export async function loadExternalContext(): Promise<ExternalContextData | null> {
  const raw = await AsyncStorage.getItem(await getUserScopedKey(EXTERNAL_CONTEXT_KEY));
  return raw ? JSON.parse(raw) : null;
}




async function saveDailyCheckInToCloud(data: DailyCheckInData) {
  const headers = await getAuthHeaders();

  if (!headers) {
    return;
  }

  await fetch(`${DARA_API_URL}/api/user/check-ins`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
}

async function loadDailyCheckInsFromCloud(): Promise<DailyCheckInData[] | null> {
  const headers = await getAuthHeaders();

  if (!headers) {
    return null;
  }

  const response = await fetch(`${DARA_API_URL}/api/user/check-ins`, {
    headers,
  });

  if (!response.ok) {
    return null;
  }

  const json = await response.json();
  return Array.isArray(json.checkIns) ? json.checkIns : null;
}

export async function loadDailyCheckIn(): Promise<DailyCheckInData | null> {
  const raw = await AsyncStorage.getItem(await getUserScopedKey(DAILY_CHECK_IN_KEY));
  return raw ? JSON.parse(raw) : null;
}

export async function loadDailyCheckInHistory(): Promise<DailyCheckInData[]> {
  try {
    const cloudCheckIns = await loadDailyCheckInsFromCloud();

    if (cloudCheckIns) {
      await AsyncStorage.setItem(
        await getUserScopedKey(DAILY_CHECK_IN_HISTORY_KEY),
        JSON.stringify(cloudCheckIns)
      );

      if (cloudCheckIns[0]) {
        await AsyncStorage.setItem(
          await getUserScopedKey(DAILY_CHECK_IN_KEY),
          JSON.stringify(cloudCheckIns[0])
        );
      }

      return cloudCheckIns;
    }
  } catch {
    // Fall back to local check-ins if cloud sync fails.
  }

  const raw = await AsyncStorage.getItem(await getUserScopedKey(DAILY_CHECK_IN_HISTORY_KEY));
  return raw ? JSON.parse(raw) : [];
}




export type StoredHealthSummary = {
  stepsToday: number | null;
  activeEnergyToday: number | null;
  sleepHoursLastNight: number | null;
  heartRateSamples: number;
  hrvSamples: number;
  updatedAt: string;
};

const HEALTH_SUMMARY_KEY = "dara.healthSummary.latest";


async function saveHealthSummaryToCloud(data: StoredHealthSummary) {
  const headers = await getAuthHeaders();

  if (!headers) {
    return;
  }

  await fetch(`${DARA_API_URL}/api/user/health-summary`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
}

async function loadHealthSummaryFromCloud(): Promise<StoredHealthSummary | null> {
  const headers = await getAuthHeaders();

  if (!headers) {
    return null;
  }

  const response = await fetch(`${DARA_API_URL}/api/user/health-summary`, {
    headers,
  });

  if (!response.ok) {
    return null;
  }

  const json = await response.json();
  return json.healthSummary ?? null;
}

export async function saveHealthSummary(data: StoredHealthSummary) {
  await AsyncStorage.setItem(
    await getUserScopedKey(HEALTH_SUMMARY_KEY),
    JSON.stringify(data)
  );

  try {
    await saveHealthSummaryToCloud(data);
  } catch {
    // Keep local health summary even if cloud sync fails.
  }
}

export async function loadHealthSummary(): Promise<StoredHealthSummary | null> {
  try {
    const cloudHealthSummary = await loadHealthSummaryFromCloud();

    if (cloudHealthSummary) {
      await AsyncStorage.setItem(
        await getUserScopedKey(HEALTH_SUMMARY_KEY),
        JSON.stringify(cloudHealthSummary)
      );

      return cloudHealthSummary;
    }
  } catch {
    // Fall back to local health summary if cloud sync fails.
  }

  const raw = await AsyncStorage.getItem(await getUserScopedKey(HEALTH_SUMMARY_KEY));
  return raw ? JSON.parse(raw) : null;
}

export type HealthRecordPage = {
  id: string;
  name: string;
  uri: string;
  size?: number;
  mimeType?: string;
  createdAt: string;
};

export type HealthRecordBiomarker = {
  name: string;
  value?: string;
  unit?: string;
  status?: "low" | "normal" | "high" | "borderline" | "unknown";
  note?: string;
};

export type HealthRecordFile = {
  name: string;
  uri: string;
  size?: number;
  mimeType?: string;
  createdAt: string;
  analysisStatus?: "not_started" | "ready" | "analyzing" | "completed" | "failed";
  analysisTitle?: string;
  analysisSummary?: string;
  analysisBiomarkers?: HealthRecordBiomarker[];
  analysisFocusAreas?: string[];
  analysisRecommendations?: string[];
  analysisConfidence?: number;
  analyzedAt?: string;
  files?: HealthRecordPage[];
};

const HEALTH_RECORD_KEY = "dara.healthRecord.latest";


async function saveHealthRecordToCloud(data: HealthRecordFile) {
  const headers = await getAuthHeaders();

  if (!headers) {
    return;
  }

  await fetch(`${DARA_API_URL}/api/user/health-record`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
}

async function loadHealthRecordFromCloud(): Promise<HealthRecordFile | null> {
  const headers = await getAuthHeaders();

  if (!headers) {
    return null;
  }

  const response = await fetch(`${DARA_API_URL}/api/user/health-record`, {
    headers,
  });

  if (!response.ok) {
    return null;
  }

  const json = await response.json();
  return json.healthRecord ?? null;
}



export async function saveHealthRecord(data: HealthRecordFile) {
  await AsyncStorage.setItem(
    await getUserScopedKey(HEALTH_RECORD_KEY),
    JSON.stringify(data)
  );

  try {
    await saveHealthRecordToCloud(data);
  } catch {
    // Keep local health record even if cloud sync fails.
  }
}

export async function loadHealthRecord(): Promise<HealthRecordFile | null> {
  try {
    const cloudHealthRecord = await loadHealthRecordFromCloud();

    if (cloudHealthRecord) {
      await AsyncStorage.setItem(
        await getUserScopedKey(HEALTH_RECORD_KEY),
        JSON.stringify(cloudHealthRecord)
      );

      return cloudHealthRecord;
    }
  } catch {
    // Fall back to local health record if cloud sync fails.
  }

  const raw = await AsyncStorage.getItem(await getUserScopedKey(HEALTH_RECORD_KEY));

  if (!raw) {
    return null;
  }

  const record = JSON.parse(raw) as HealthRecordFile;

  if (!record.files || record.files.length === 0) {
    return {
      ...record,
      files: [
        {
          id: `page-${record.createdAt}`,
          name: record.name,
          uri: record.uri,
          size: record.size,
          mimeType: record.mimeType,
          createdAt: record.createdAt,
        },
      ],
    };
  }

  return record;
}

function getCheckInDayKey(createdAt: string) {
  return createdAt.slice(0, 10);
}

export async function saveDailyCheckInWithHistory(data: DailyCheckInData) {
  await AsyncStorage.setItem(await getUserScopedKey(DAILY_CHECK_IN_KEY), JSON.stringify(data));

  const history = await loadDailyCheckInHistory();
  const incomingDayKey = getCheckInDayKey(data.createdAt);

  const historyWithoutSameDay = history.filter(
    (item) => getCheckInDayKey(item.createdAt) !== incomingDayKey
  );

  const nextHistory = [data, ...historyWithoutSameDay]
    .filter(Boolean)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, MAX_DAILY_CHECK_INS);

  await AsyncStorage.setItem(
    await getUserScopedKey(DAILY_CHECK_IN_HISTORY_KEY),
    JSON.stringify(nextHistory)
  );

  try {
    await saveDailyCheckInToCloud(data);
  } catch {
    // Keep local check-in even if cloud sync fails.
  }
}

export async function loadDailyContextEvents(): Promise<DailyContextEvent[]> {
  const raw = await AsyncStorage.getItem(await getUserScopedKey(DAILY_CONTEXT_EVENTS_KEY));
  return raw ? JSON.parse(raw) : [];
}

export async function saveDailyContextEvent(event: DailyContextEvent) {
  const events = await loadDailyContextEvents();

  const nextEvents = [event, ...events]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, MAX_DAILY_CONTEXT_EVENTS);

  await AsyncStorage.setItem(
    await getUserScopedKey(DAILY_CONTEXT_EVENTS_KEY),
    JSON.stringify(nextEvents)
  );
}

export async function saveDailyContextEvents(eventsToSave: DailyContextEvent[]) {
  if (eventsToSave.length === 0) {
    return;
  }

  const events = await loadDailyContextEvents();

  const nextEvents = [...eventsToSave, ...events]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, MAX_DAILY_CONTEXT_EVENTS);

  await AsyncStorage.setItem(
    await getUserScopedKey(DAILY_CONTEXT_EVENTS_KEY),
    JSON.stringify(nextEvents)
  );
}
