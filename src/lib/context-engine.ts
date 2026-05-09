export function buildDailySummary({
  energy,
  stress,
  workload,
  spendingPressure,
}: {
  energy: number;
  stress: number;
  workload: number;
  spendingPressure: number;
}) {
  const summaries: string[] = [];

  if (energy >= 8 && stress <= 3) {
    summaries.push("Recovery stability looks strong.");
  }

  if (workload >= 7) {
    summaries.push("Workload pressure increased today.");
  }

  if (spendingPressure >= 6) {
    summaries.push("Financial pressure may affect focus quality.");
  }

  if (energy <= 4) {
    summaries.push("Energy reserves appear reduced.");
  }

  return summaries;
}
