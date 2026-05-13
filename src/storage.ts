import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDaraAuthUserId } from "./lib/auth-client";

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


export async function savePersonalSetup(data: PersonalSetupData) {
  await AsyncStorage.setItem(await getUserScopedKey(PERSONAL_SETUP_KEY), JSON.stringify(data));
}

export async function loadPersonalSetup(): Promise<PersonalSetupData | null> {
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



export async function loadDailyCheckIn(): Promise<DailyCheckInData | null> {
  const raw = await AsyncStorage.getItem(await getUserScopedKey(DAILY_CHECK_IN_KEY));
  return raw ? JSON.parse(raw) : null;
}

export async function loadDailyCheckInHistory(): Promise<DailyCheckInData[]> {
  const raw = await AsyncStorage.getItem(await getUserScopedKey(DAILY_CHECK_IN_HISTORY_KEY));
  return raw ? JSON.parse(raw) : [];
}



export type HealthRecordFile = {
  name: string;
  uri: string;
  size?: number;
  mimeType?: string;
  createdAt: string;
};

const HEALTH_RECORD_KEY = "dara.healthRecord.latest";

export async function saveHealthRecord(data: HealthRecordFile) {
  await AsyncStorage.setItem(await getUserScopedKey(HEALTH_RECORD_KEY), JSON.stringify(data));
}

export async function loadHealthRecord(): Promise<HealthRecordFile | null> {
  const raw = await AsyncStorage.getItem(await getUserScopedKey(HEALTH_RECORD_KEY));
  return raw ? JSON.parse(raw) : null;
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
