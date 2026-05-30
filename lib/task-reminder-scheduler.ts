import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, TaskStatus } from "@prisma/client";
import { render } from "@react-email/render";
import { Resend } from "resend";

import { EmailTemplate } from "../components/email-template.mjs";

const databaseUrl = process.env.DATABASE_URL;
const REMINDER_STATUSES: TaskStatus[] = [
  TaskStatus.PENDING,
  TaskStatus.ON_PROGRESS,
  TaskStatus.HOLD,
];
const TIMEZONE = process.env.TASK_REMINDER_TIMEZONE ?? "Asia/Jakarta";
const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "Daily Tracker <onboarding@resend.dev>";
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const DRY_RUN = process.env.TASK_REMINDER_DRY_RUN === "true";

let prisma: PrismaClient | undefined;

type ReminderSummary = {
  timestamp: string;
  users: number;
  sent: number;
  failed: number;
  dueTime: string;
};

type UserTaskGroup = {
  user: {
    id: string;
    name: string;
    email: string;
  };
  tasks: {
    title: string;
    description: string | null;
    status: TaskStatus;
    dueTime: string | null;
  }[];
};

function getPrismaClient() {
  if (prisma) {
    return prisma;
  }

  if (!databaseUrl) {
    throw new Error("DATABASE_URL belum di-set di environment.");
  }

  const adapter = new PrismaPg({ connectionString: databaseUrl });
  prisma = new PrismaClient({ adapter });
  return prisma;
}

function getTodayUtcRange(now = new Date()) {
  const start = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0,
      0,
      0,
      0,
    ),
  );
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

function formatTaskDate(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "full",
    timeZone: TIMEZONE,
  }).format(date);
}

function getCurrentTimeInTimezone(now = new Date()) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: TIMEZONE,
  }).format(now);
}

async function buildEmailPayload({
  name,
  email,
  tasks,
  dueDateLabel,
}: {
  name: string;
  email: string;
  tasks: UserTaskGroup["tasks"];
  dueDateLabel: string;
}) {
  const subject = `Pengingat Task Anda - ${dueDateLabel}`;
  const reactTemplate = EmailTemplate({
    firstName: name,
    dueDateLabel,
    tasks: tasks.map((task) => ({
      title: task.title,
      dueTime: task.dueTime,
      status: task.status.replaceAll("_", " "),
      description: task.description,
    })),
  });
  const html = await render(reactTemplate);

  return {
    from: FROM_EMAIL,
    to: [email],
    subject,
    html,
  };
}

async function sendWithResend(
  payload: Awaited<ReturnType<typeof buildEmailPayload>>,
  idempotencyKey: string,
) {
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

export async function runTaskReminderJob(): Promise<ReminderSummary> {
  const client = getPrismaClient();
  const now = new Date();
  const { start, end } = getTodayUtcRange(now);
  const currentTime = getCurrentTimeInTimezone(now);

  const tasks = await client.task.findMany({
    where: {
      dueDate: {
        gte: start,
        lt: end,
      },
      dueTime: currentTime,
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
    orderBy: [{ userId: "asc" }, { title: "asc" }],
  });

  const groupedByUser = new Map<string, UserTaskGroup>();

  for (const task of tasks) {
    console.log("task", task);
    if (!task.user) {
      continue;
    }

    const existing = groupedByUser.get(task.user.id);
    const mappedTask = {
      title: task.title,
      description: task.description,
      status: task.status,
      dueTime: task.dueTime,
    };

    if (existing) {
      existing.tasks.push(mappedTask);
      continue;
    }

    groupedByUser.set(task.user.id, {
      user: task.user,
      tasks: [mappedTask],
    });
  }

  const dueDateLabel = formatTaskDate(start);
  let sent = 0;
  let failed = 0;

  for (const [userId, { user, tasks: userTasks }] of groupedByUser.entries()) {
    const payload = await buildEmailPayload({
      name: user.name,
      email: user.email,
      tasks: userTasks,
      dueDateLabel,
    });

    const idempotencyKey = `task-reminder/${userId}/${start.toISOString().slice(0, 10)}/${currentTime}`;

    try {
      if (DRY_RUN) {
        console.log(
          `[DRY_RUN] Skip sending email to ${user.email} (${userTasks.length} task).`,
        );
      } else {
        await sendWithResend(payload, idempotencyKey);
        console.log(
          `Email reminder sent to ${user.email} (${userTasks.length} task).`,
        );
      }
      sent += 1;
    } catch (error) {
      failed += 1;
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(`Failed to send reminder for ${user.email}: ${message}`);
    }
  }

  const summary: ReminderSummary = {
    timestamp: now.toISOString(),
    users: groupedByUser.size,
    sent,
    failed,
    dueTime: currentTime,
  };

  console.log(
    `[TaskReminder] ${summary.timestamp} | dueTime=${summary.dueTime} | users=${summary.users} | sent=${summary.sent} | failed=${summary.failed}`,
  );

  return summary;
}
