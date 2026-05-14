import fs from "fs";
import path from "path";

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

type UserCloudData = {
  personalSetup?: CloudPersonalSetupData;
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
