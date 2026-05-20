import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import type { DaraUserData } from "../useDaraData";
import { buildDaraBrain } from "./dara-brain";

function esc(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export async function exportDaraPdfReport(data: DaraUserData, periodLabel: string) {
  const brain = buildDaraBrain(data);
  const forecast = brain.forecastView.hero;
  const latest = data.dailyCheckIn;
  const health = data.healthSummary;
  const healthRecord = data.healthRecord;
  const patterns = brain.patterns.slice(0, 5);
  const mealEvents = data.dailyContextEvents
    .filter((event) => event.type === "meal")
    .slice(0, 5);

  const html = `
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, Helvetica, Arial; padding: 28px; color: #07101F;">
        <h1>Dara AI Report</h1>
        <p><strong>Period:</strong> ${esc(periodLabel)}</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>

        <hr />

        <h2>Forecast</h2>
        <h3>${esc(forecast.title)}</h3>
        <p>${esc(forecast.summary)}</p>
        <p><strong>Confidence:</strong> ${esc(forecast.confidence)}% · ${esc(forecast.likelihood)}</p>

        <h2>Latest check-in</h2>
        <p>
          Energy: ${esc(latest?.energy ?? "—")} / 10<br/>
          Stress: ${esc(latest?.stress ?? "—")} / 10<br/>
          Workload: ${esc(latest?.workload ?? "—")} / 10<br/>
          Money pressure: ${esc(latest?.spendingPressure ?? "—")} / 10
        </p>

        <h2>Blood test context</h2>
        ${
          healthRecord?.analysisSummary
            ? `<p><strong>${esc(healthRecord.analysisTitle ?? "Blood test analysis")}</strong></p>
               <p>${esc(healthRecord.analysisSummary)}</p>
               <p><strong>Focus areas:</strong> ${esc((healthRecord.analysisFocusAreas ?? []).join(", ") || "—")}</p>
               <p><strong>Recommendations:</strong></p>
               <ul>${(healthRecord.analysisRecommendations ?? []).map((item) => `<li>${esc(item)}</li>`).join("")}</ul>`
            : "<p>No analyzed blood test available yet.</p>"
        }

        <h2>Apple Health</h2>
        <p>
          Sleep: ${esc(health?.sleepHoursLastNight ? `${health.sleepHoursLastNight.toFixed(1)}h` : "—")}<br/>
          Steps: ${esc(health?.stepsToday ?? "—")}<br/>
          Active energy: ${esc(health?.activeEnergyToday ? Math.round(health.activeEnergyToday) : "—")}<br/>
          Heart rate samples: ${esc(health?.heartRateSamples ?? "—")}<br/>
          HRV samples: ${esc(health?.hrvSamples ?? "—")}<br/>
          Active energy: ${esc(health?.activeEnergyToday ? `${Math.round(health.activeEnergyToday)} kcal` : "—")}
        </p>

        <h2>Meal context</h2>
        ${
          mealEvents.length > 0
            ? `<ul>${mealEvents
                .map(
                  (event) =>
                    `<li><strong>${esc(event.title)}</strong>: ${esc(
                      event.aiSummary ?? event.text ?? "Meal logged"
                    )}</li>`
                )
                .join("")}</ul>`
            : "<p>No meal context available for this period.</p>"
        }

        <h2>Key patterns</h2>
        <ul>
          ${patterns.map((p) => `<li><strong>${esc(p.title)}</strong>: ${esc(p.summary)}</li>`).join("")}
        </ul>

        <h2>Recommendations</h2>
        <ol>
          ${brain.forecast.changePoints.map((p) => `<li>${esc(p)}</li>`).join("")}
        </ol>

        <p style="margin-top: 32px; color: #667085; font-size: 12px;">
          This report is guidance, not medical or financial advice.
        </p>
      </body>
    </html>
  `;

  const result = await Print.printToFileAsync({ html });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(result.uri, {
      mimeType: "application/pdf",
      dialogTitle: "Share Dara AI Report",
      UTI: "com.adobe.pdf",
    });
  }

  return result.uri;
}
