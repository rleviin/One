import fs from "fs";
import path from "path";



export type CloudDailyCheckInData = {
  energy: number;
  stress: number;
  workload: number;
  spendingPressure: number;
  note: string;
  mealPhotoUri: string | null;
  createdAt: string;
};

export type CloudPersonalSetupData = {
  country: string;
  age: string;
  height: string;
  weight: string;
  workType: string;
  incomeRange: string;
  spendingRange: string;
  dailyContext: string;
  updatedAt: string;
};

export type CloudHealthSummaryData = {
  stepsToday: number | null;
  activeEnergyToday: number | null;
  sleepHoursLastNight: number | null;
  heartRateSamples: number;
  hrvSamples: number;
  updatedAt: string;
};

export type CloudHealthRecordData = {
  name: string;
  uri?: string;
  size?: number;
  mimeType?: string;
  createdAt: string;
  analysisStatus?: "not_started" | "ready" | "analyzing" | "completed" | "failed";
  analysisTitle?: string;
  analysisSummary?: string;
  analysisBiomarkers?: unknown[];
  analysisFocusAreas?: string[];
  analysisRecommendations?: string[];
  analysisConfidence?: number;
  analyzedAt?: string;
  files?: unknown[];
};

type UserCloudData = {
  personalSetup?: CloudPersonalSetupData;
  dailyCheckIns?: CloudDailyCheckInData[];
  healthSummary?: CloudHealthSummaryData;
  healthRecord?: CloudHealthRecordData;
};

const dbPath = path.join(process.cwd(), "data", "user-cloud-data.json");

function readDb(): Record<string, UserCloudData> {
  if (!fs.existsSync(dbPath)) return {};
  return JSON.parse(fs.readFileSync(dbPath, "utf8")) as Record<
    string,
    UserCloudData
  >;
}

function writeDb(data: Record<string, UserCloudData>) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

export function getUserCloudData(userId: string): UserCloudData {
  const db = readDb();
  return db[userId] ?? {};
}

export function savePersonalSetup(
  userId: string,
  setup: Omit<CloudPersonalSetupData, "updatedAt">
) {
  const db = readDb();

  db[userId] = {
    ...(db[userId] ?? {}),
    personalSetup: {
      ...setup,
      updatedAt: new Date().toISOString(),
    },
  };

  writeDb(db);

  return db[userId].personalSetup;
}


export function saveDailyCheckIn(
  userId: string,
  checkIn: CloudDailyCheckInData
) {
  const db = readDb();

  const existing = db[userId]?.dailyCheckIns ?? [];

  const next = [checkIn, ...existing]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .slice(0, 30);

  db[userId] = {
    ...(db[userId] ?? {}),
    dailyCheckIns: next,
  };

  writeDb(db);

  return next;
}

export function getDailyCheckIns(userId: string) {
  const db = readDb();
  return db[userId]?.dailyCheckIns ?? [];
}


export function saveHealthSummary(
  userId: string,
  healthSummary: CloudHealthSummaryData
) {
  const db = readDb();

  db[userId] = {
    ...(db[userId] ?? {}),
    healthSummary,
  };

  writeDb(db);

  return db[userId].healthSummary;
}

export function getHealthSummary(userId: string) {
  const db = readDb();
  return db[userId]?.healthSummary ?? null;
}


export function saveHealthRecord(
  userId: string,
  healthRecord: CloudHealthRecordData
) {
  const db = readDb();

  db[userId] = {
    ...(db[userId] ?? {}),
    healthRecord,
  };

  writeDb(db);

  return db[userId].healthRecord;
}

export function getHealthRecord(userId: string) {
  const db = readDb();
  return db[userId]?.healthRecord ?? null;
}
