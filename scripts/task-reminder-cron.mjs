import cron from "node-cron";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, TaskStatus } from "@prisma/client";
import { Resend } from "resend";

import { EmailTemplate } from "../components/email-template.mjs";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL belum di-set di environment.");
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

const REMINDER_STATUSES = [TaskStatus.PENDING, TaskStatus.ON_PROGRESS, TaskStatus.HOLD];
const SCHEDULE = process.env.TASK_REMINDER_CRON ?? "0 8 * * *";
const TIMEZONE = process.env.TASK_REMINDER_TIMEZONE ?? "Asia/Jakarta";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "Daily Tracker <onboarding@resend.dev>";
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const DRY_RUN = process.env.TASK_REMINDER_DRY_RUN === "true";
const RUN_ONCE = process.argv.includes("--run-once");

function getTodayUtcRange(now = new Date()) {
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0),
  );
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

function formatTaskDate(date) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "full",
    timeZone: TIMEZONE,
  }).format(date);
}

function buildEmailPayload({ name, email, tasks, dueDateLabel }) {
  const subject = `Pengingat Task Anda - ${dueDateLabel}`;

  return {
    from: FROM_EMAIL,
    to: [email],
    subject,
    react: EmailTemplate({
      firstName: name,
      dueDateLabel,
      tasks: tasks.map((task) => ({
        title: task.title,
        dueTime: task.dueTime,
        status: task.status.replaceAll("_", " "),
        description: task.description,
      })),
    }),
  };
}

async function sendWithResend(payload, idempotencyKey) {
  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY belum di-set di environment.");
  }

  const resend = new Resend(RESEND_API_KEY);
  const { data, error } = await resend.emails.send(payload, { idempotencyKey });

  if (error) {
    throw new Error(`Resend API error: ${JSON.stringify(error)}`);
  }

  return data;
}

async function runReminderJob() {
  const now = new Date();
  const { start, end } = getTodayUtcRange(now);

  const tasks = await prisma.task.findMany({
    where: {
      dueDate: {
        gte: start,
        lt: end,
      },
      status: {
        in: REMINDER_STATUSES,
      },
      userId: {
        not: null,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: [{ userId: "asc" }, { dueTime: "asc" }, { title: "asc" }],
  });

  const groupedByUser = new Map();

  for (const task of tasks) {
    if (!task.user) {
      continue;
    }

    const existing = groupedByUser.get(task.user.id);

    if (existing) {
      existing.tasks.push(task);
      continue;
    }

    groupedByUser.set(task.user.id, {
      user: task.user,
      tasks: [task],
    });
  }

  const dueDateLabel = formatTaskDate(start);
  let sent = 0;
  let failed = 0;

  for (const [userId, { user, tasks: userTasks }] of groupedByUser.entries()) {
    const payload = buildEmailPayload({
      name: user.name,
      email: user.email,
      tasks: userTasks,
      dueDateLabel,
    });

    const idempotencyKey = `task-reminder/${userId}/${start.toISOString().slice(0, 10)}`;

    try {
      if (DRY_RUN) {
        console.log(`[DRY_RUN] Skip sending email to ${user.email} (${userTasks.length} task).`);
      } else {
        await sendWithResend(payload, idempotencyKey);
        console.log(`Email reminder sent to ${user.email} (${userTasks.length} task).`);
      }
      sent += 1;
    } catch (error) {
      failed += 1;
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(`Failed to send reminder for ${user.email}: ${message}`);
    }
  }

  console.log(
    `[TaskReminder] ${now.toISOString()} | users=${groupedByUser.size} | sent=${sent} | failed=${failed}`,
  );
}

async function start() {
  if (RUN_ONCE) {
    await runReminderJob();
    await prisma.$disconnect();
    return;
  }

  if (!cron.validate(SCHEDULE)) {
    throw new Error(`Format TASK_REMINDER_CRON tidak valid: ${SCHEDULE}`);
  }

  console.log(`[TaskReminder] Scheduler aktif: '${SCHEDULE}' timezone=${TIMEZONE}`);

  cron.schedule(
    SCHEDULE,
    async () => {
      try {
        await runReminderJob();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(`[TaskReminder] Job gagal: ${message}`);
        console.error(error);
      }
    },
    {
      timezone: TIMEZONE,
    },
  );
}

start().catch((error) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`[TaskReminder] Startup gagal: ${message}`);
  console.error(error);
  process.exitCode = 1;
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}
