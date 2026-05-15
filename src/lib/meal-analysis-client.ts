import * as FileSystem from "expo-file-system";
import { getDaraAuthToken } from "./auth-client";
import { DARA_API_URL } from "./config";

export type MealAnalysisResult = {
  title: string;
  summary: string;
  likelyFoods: string[];
  mealType: string;
  estimatedMacros: {
    protein: string;
    carbs: string;
    fat: string;
  };
  recoveryImpact: string;
  energyImpact: string;
  suggestions: string[];
  confidence: number;
};

export async function analyzeMealPhoto(uri: string): Promise<MealAnalysisResult> {
  const token = await getDaraAuthToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  const imageBase64 = await FileSystem.readAsStringAsync(uri, {
    encoding: "base64",
  });

  const response = await fetch(`${DARA_API_URL}/api/analyze-meal`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      imageBase64,
      mimeType: "image/jpeg",
    }),
  });

  if (!response.ok) {
    throw new Error("Meal analysis failed");
  }

  return response.json();
}
