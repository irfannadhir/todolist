export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  const { startTaskReminderScheduler } = await import("./lib/task-reminder-scheduler.mjs");
  startTaskReminderScheduler();
}
