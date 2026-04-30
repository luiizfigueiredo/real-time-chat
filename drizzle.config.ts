import { defineConfig } from 'drizzle-kit';

const databaseUrl =
  process.env.DATABASE_URL ??
  `postgresql://${process.env.POSTGRES_USER ?? 'postgres'}:${
    process.env.POSTGRES_PASSWORD ?? 'postgres'
  }@${process.env.DB_HOST ?? 'localhost'}:${process.env.DB_PORT ?? '5432'}/${
    process.env.POSTGRES_DB ?? 'postgres'
  }`;

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: databaseUrl,
  },
  verbose: true,
  strict: true,
});
