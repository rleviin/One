import AsyncStorage from "@react-native-async-storage/async-storage";

export type PersonalSetupData = {
  country: string;
  age: string;
  sleepGoal: string;
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

const PERSONAL_SETUP_KEY = "dara.personalSetup";
const DAILY_CHECK_IN_KEY = "dara.dailyCheckIn.latest";
const DAILY_CHECK_IN_HISTORY_KEY = "dara.dailyCheckIn.history";
const MAX_DAILY_CHECK_INS = 30;

export async function savePersonalSetup(data: PersonalSetupData) {
  await AsyncStorage.setItem(PERSONAL_SETUP_KEY, JSON.stringify(data));
}

export async function loadPersonalSetup(): Promise<PersonalSetupData | null> {
  const raw = await AsyncStorage.getItem(PERSONAL_SETUP_KEY);
  return raw ? JSON.parse(raw) : null;
}



export async function loadDailyCheckIn(): Promise<DailyCheckInData | null> {
  const raw = await AsyncStorage.getItem(DAILY_CHECK_IN_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function loadDailyCheckInHistory(): Promise<DailyCheckInData[]> {
  const raw = await AsyncStorage.getItem(DAILY_CHECK_IN_HISTORY_KEY);
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
  await AsyncStorage.setItem(HEALTH_RECORD_KEY, JSON.stringify(data));
}

export async function loadHealthRecord(): Promise<HealthRecordFile | null> {
  const raw = await AsyncStorage.getItem(HEALTH_RECORD_KEY);
  return raw ? JSON.parse(raw) : null;
}

function getCheckInDayKey(createdAt: string) {
  return createdAt.slice(0, 10);
}

export async function saveDailyCheckInWithHistory(data: DailyCheckInData) {
  await AsyncStorage.setItem(DAILY_CHECK_IN_KEY, JSON.stringify(data));

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
    DAILY_CHECK_IN_HISTORY_KEY,
    JSON.stringify(nextHistory)
  );
}
