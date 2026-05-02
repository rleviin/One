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

export async function savePersonalSetup(data: PersonalSetupData) {
  await AsyncStorage.setItem(PERSONAL_SETUP_KEY, JSON.stringify(data));
}

export async function loadPersonalSetup(): Promise<PersonalSetupData | null> {
  const raw = await AsyncStorage.getItem(PERSONAL_SETUP_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function saveDailyCheckIn(data: DailyCheckInData) {
  await AsyncStorage.setItem(DAILY_CHECK_IN_KEY, JSON.stringify(data));
}

export async function loadDailyCheckIn(): Promise<DailyCheckInData | null> {
  const raw = await AsyncStorage.getItem(DAILY_CHECK_IN_KEY);
  return raw ? JSON.parse(raw) : null;
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
