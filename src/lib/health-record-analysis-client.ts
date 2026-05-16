import * as FileSystem from "expo-file-system/legacy";
import { getDaraAuthToken } from "./auth-client";
import { DARA_API_URL } from "./config";

export type HealthRecordAnalysisResult = {
  title: string;
  summary: string;
  biomarkers: unknown[];
  possibleFocusAreas: string[];
  recommendations: string[];
  confidence: number;
};

export async function analyzeHealthRecordPhoto(
  uri: string,
  mimeType = "image/jpeg"
): Promise<HealthRecordAnalysisResult> {
  const token = await getDaraAuthToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  const imageBase64 = await FileSystem.readAsStringAsync(uri, {
    encoding: "base64",
  });

  const response = await fetch(`${DARA_API_URL}/api/analyze-health-record`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      imageBase64,
      mimeType,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Health record analysis failed with ${response.status}`);
  }

  return response.json();
}
