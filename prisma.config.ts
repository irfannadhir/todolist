import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url:
      process.env.DATABASE_URL ??
      "postgres://postgres:rootpassword@localhost:5432/todolist?schema=public",
  },
});
