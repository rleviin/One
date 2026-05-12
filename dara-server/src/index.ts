import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import OpenAI from "openai";
import { loginUser, signupUser, verifyToken } from "./auth/auth-store";

dotenv.config();

const app = express();
const port = process.env.PORT ?? 3000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());
app.use(express.json({ limit: "1mb" }));

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
