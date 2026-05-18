import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import OpenAI from "openai";
import { getCachedWeatherContext } from "./external-weather";
import { getCachedProbabilityContext } from "./external-probability";
import { loginUser, signupUser, verifyToken } from "./auth/auth-store";
import { requireAuth, type AuthenticatedRequest } from "./auth/auth-middleware";
import {
  getUserCloudData,
  savePersonalSetup,
  saveDailyCheckIn,
  getDailyCheckIns,
  saveHealthSummary,
  getHealthSummary,
  saveHealthRecord,
  getHealthRecord,
} from "./data/user-data-store";

dotenv.config();

const app = express();
const port = process.env.PORT ?? 3000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());
app.use(express.json({ limit: "8mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});


app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const result = await signupUser({
      email: String(email),
      password: String(password),
      name: String(name ?? ""),
    });

    return res.json(result);
  } catch (error) {
    return res.status(400).json({
      error: error instanceof Error ? error.message : "Signup failed",
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const result = await loginUser({
      email: String(email),
      password: String(password),
    });

    return res.json(result);
  } catch (error) {
    return res.status(401).json({
      error: error instanceof Error ? error.message : "Login failed",
    });
  }
});

app.get("/api/auth/me", (req, res) => {
  try {
    const authHeader = req.headers.authorization ?? "";
    const token = authHeader.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Missing token" });
    }

    const payload = verifyToken(token);

    return res.json({ user: payload });
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
});


app.get("/api/user/personal-setup", requireAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: "Missing user" });
  }

  const data = getUserCloudData(userId);

  return res.json({
    personalSetup: data.personalSetup ?? null,
  });
});

app.post("/api/user/personal-setup", requireAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: "Missing user" });
  }

  const {
    country = "",
    age = "",
    height = "",
    weight = "",
    workType = "",
    incomeRange = "",
    spendingRange = "",
    dailyContext = "",
  } = req.body ?? {};

  const personalSetup = savePersonalSetup(userId, {
    country: String(country),
    age: String(age),
    height: String(height),
    weight: String(weight),
    workType: String(workType),
    incomeRange: String(incomeRange),
    spendingRange: String(spendingRange),
    dailyContext: String(dailyContext),
  });

  return res.json({ personalSetup });
});





app.post("/api/user/check-ins", requireAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: "Missing user" });
  }

  const {
    energy = 0,
    stress = 0,
    workload = 0,
    spendingPressure = 0,
    note = "",
    mealPhotoUri = null,
    createdAt = new Date().toISOString(),
  } = req.body ?? {};

  const checkIns = saveDailyCheckIn(userId, {
    energy: Number(energy),
    stress: Number(stress),
    workload: Number(workload),
    spendingPressure: Number(spendingPressure),
    note: String(note),
    mealPhotoUri: mealPhotoUri ? String(mealPhotoUri) : null,
    createdAt: String(createdAt),
  });

  return res.json({ checkIns });
});

app.get("/api/user/check-ins", requireAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: "Missing user" });
  }

  return res.json({ checkIns: getDailyCheckIns(userId) });
});


app.get("/api/user/health-summary", requireAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: "Missing user" });
  }

  return res.json({ healthSummary: getHealthSummary(userId) });
});

app.post("/api/user/health-summary", requireAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: "Missing user" });
  }

  const {
    stepsToday = null,
    activeEnergyToday = null,
    sleepHoursLastNight = null,
    heartRateSamples = 0,
    hrvSamples = 0,
    updatedAt = new Date().toISOString(),
  } = req.body ?? {};

  const healthSummary = saveHealthSummary(userId, {
    stepsToday: stepsToday === null ? null : Number(stepsToday),
    activeEnergyToday: activeEnergyToday === null ? null : Number(activeEnergyToday),
    sleepHoursLastNight: sleepHoursLastNight === null ? null : Number(sleepHoursLastNight),
    heartRateSamples: Number(heartRateSamples),
    hrvSamples: Number(hrvSamples),
    updatedAt: String(updatedAt),
  });

  return res.json({ healthSummary });
});




app.get("/api/user/health-record", requireAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: "Missing user" });
  }

  return res.json({ healthRecord: getHealthRecord(userId) });
});



app.get("/api/context/probability", requireAuth, async (req: AuthenticatedRequest, res) => {
  const country = typeof req.query.country === "string" ? req.query.country : null;

  const probability = await getCachedProbabilityContext({ country });

  return res.json({ probability });
});

app.get("/api/context/weather", requireAuth, async (req: AuthenticatedRequest, res) => {
  const latitude = req.query.latitude ? Number(req.query.latitude) : undefined;
  const longitude = req.query.longitude ? Number(req.query.longitude) : undefined;

  const weather = await getCachedWeatherContext({ latitude, longitude });

  return res.json({ weather });
});

app.post("/api/user/health-record", requireAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: "Missing user" });
  }

  const healthRecord = saveHealthRecord(userId, req.body);

  return res.json({ healthRecord });
});

app.post("/api/analyze-health-record", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg" } = req.body ?? {};

    if (!imageBase64) {
      return res.status(400).json({ error: "imageBase64 is required" });
    }

    const response = await openai.responses.create({
      model: "gpt-5.5",
      input: [
        {
          role: "system",
          content:
            "You are Dara, a careful wellness assistant. Analyze a blood test image for general wellness context only. Return only valid JSON with title, summary, biomarkers, possibleFocusAreas, recommendations, confidence. Do not diagnose. Do not provide medical advice. Always advise consulting a clinician for abnormal values.",
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: "Extract visible blood test markers and summarize possible wellness context. Return concise JSON.",
            },
            {
              type: "input_image",
              image_url: `data:${mimeType};base64,${imageBase64}`,
              detail: "high",
            },
          ],
        },
      ],
    });

    const text = response.output_text;

    try {
      const parsed = JSON.parse(text);

      return res.json({
        title: String(parsed.title ?? "Blood test analysis"),
        summary: String(parsed.summary ?? ""),
        biomarkers: Array.isArray(parsed.biomarkers)
          ? parsed.biomarkers
          : [],
        possibleFocusAreas: Array.isArray(parsed.possibleFocusAreas)
          ? parsed.possibleFocusAreas.map(String)
          : [],
        recommendations: Array.isArray(parsed.recommendations)
          ? parsed.recommendations.map(String)
          : [],
        confidence: Number(parsed.confidence ?? 40),
      });
    } catch {
      return res.json({
        title: "Blood test analysis",
        summary: text,
        biomarkers: [],
        possibleFocusAreas: [],
        recommendations: [
          "Use this as general context only.",
          "Consult a clinician for interpretation of abnormal values.",
        ],
        confidence: 30,
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Health record analysis failed",
    });
  }
});

app.post("/api/analyze-meal", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg" } = req.body ?? {};

    if (!imageBase64) {
      return res.status(400).json({ error: "imageBase64 is required" });
    }

    const response = await openai.responses.create({
      model: "gpt-5.5",
      input: [
        {
          role: "system",
          content:
            "You are Dara, a careful nutrition and recovery assistant. Analyze meal photos for general wellness context only. Return only valid JSON with title, summary, likelyFoods, mealType, estimatedMacros, recoveryImpact, energyImpact, suggestions, confidence. Do not provide medical advice.",
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: "Analyze this meal photo for energy, recovery and likely nutrition context. Return concise JSON.",
            },
            {
              type: "input_image",
              image_url: `data:${mimeType};base64,${imageBase64}`,
              detail: "low",
            },
          ],
        },
      ],
    });

    const text = response.output_text;

    try {
      const parsed = JSON.parse(text);

      return res.json({
        title: String(parsed.title ?? "Meal analysis"),
        summary: String(parsed.summary ?? ""),
        likelyFoods: Array.isArray(parsed.likelyFoods)
          ? parsed.likelyFoods.map(String)
          : [],
        mealType: String(parsed.mealType ?? "unknown"),
        estimatedMacros: {
          protein: String(parsed.estimatedMacros?.protein ?? "unknown"),
          carbs: String(parsed.estimatedMacros?.carbs ?? "unknown"),
          fat: String(parsed.estimatedMacros?.fat ?? "unknown"),
        },
        recoveryImpact: String(parsed.recoveryImpact ?? "unknown"),
        energyImpact: String(parsed.energyImpact ?? "unknown"),
        suggestions: Array.isArray(parsed.suggestions)
          ? parsed.suggestions.map(String)
          : [],
        confidence: Number(parsed.confidence ?? 40),
      });
    } catch {
      return res.json({
        title: "Meal analysis",
        summary: text,
        likelyFoods: [],
        mealType: "unknown",
        estimatedMacros: {
          protein: "unknown",
          carbs: "unknown",
          fat: "unknown",
        },
        recoveryImpact: "unknown",
        energyImpact: "unknown",
        suggestions: ["Add a short note if the photo is unclear."],
        confidence: 30,
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Meal analysis failed",
    });
  }
});

app.post("/api/dara/think", async (req, res) => {
  try {
    const aiContext = req.body?.aiContext;

    const response = await openai.responses.create({
      model: "gpt-5.5",
      input: [
        {
          role: "system",
          content:
            "You are Dara, a calm predictive health and life-context intelligence layer. Return only valid JSON with headline, summary, reasoning, recommendations, confidence.",
        },
        {
          role: "user",
          content: JSON.stringify({ aiContext }),
        },
      ],
    });

    const text = response.output_text;

    try {
      const parsed = JSON.parse(text);

      res.json({
        headline: String(parsed.headline ?? aiContext?.forecast?.title ?? "Dara interpretation"),
        summary: String(parsed.summary ?? aiContext?.forecast?.summary ?? ""),
        reasoning: Array.isArray(parsed.reasoning)
          ? parsed.reasoning.map(String)
          : [String(parsed.reasoning ?? "Dara analyzed the provided context.")],
        recommendations: Array.isArray(parsed.recommendations)
          ? parsed.recommendations.map(String)
          : [String(parsed.recommendations ?? "Keep adding daily signals.")],
        confidence: Number(parsed.confidence ?? aiContext?.forecast?.confidence ?? 40),
        mode: "ai",
      });
    } catch {
      res.json({
        headline: aiContext?.forecast?.title ?? "Dara interpretation",
        summary: text,
        reasoning: ["AI generated an interpretation from the provided context."],
        recommendations: ["Keep adding daily signals so Dara can improve accuracy."],
        confidence: aiContext?.forecast?.confidence ?? 40,
        mode: "ai",
      });
    }
  } catch (error) {
    console.error("Dara AI error:", error);
    const aiContext = req.body?.aiContext;

    res.json({
      headline: aiContext?.forecast?.title ?? "Dara fallback",
      summary:
        aiContext?.forecast?.summary ??
        "Dara could not reach the AI layer, so local fallback is being used.",
      reasoning: ["AI backend fallback activated."],
      recommendations: ["Try again later.", "Keep adding check-ins and context."],
      confidence: aiContext?.forecast?.confidence ?? 20,
      mode: "fallback",
    });
  }
});

app.listen(port, () => {
  console.log(`Dara server running on http://localhost:${port}`);
});
