import cors from "cors";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();
const port = process.env.PORT ?? 3000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/dara/think", (req, res) => {
  const aiContext = req.body?.aiContext;

  res.json({
    headline: aiContext?.forecast?.title ?? "Dara is analyzing your signals",
    summary:
      aiContext?.forecast?.summary ??
      "Dara needs more signal history before generating a stronger interpretation.",
    reasoning: [
      "AI backend endpoint is connected.",
      `Context signals available: ${aiContext?.contextCount ?? 0}.`,
    ],
    recommendations: [
      "Keep adding daily check-ins.",
      "Add context when something unusual happens.",
      "Protect sleep and recovery consistency.",
    ],
    confidence: aiContext?.forecast?.confidence ?? 20,
    mode: "ai",
  });
});

app.listen(port, () => {
  console.log(`Dara server running on http://localhost:${port}`);
});
