import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, 'apps/api/.env') });

const databaseUrl =
  process.env.DATABASE_URL ??
  `postgresql://${process.env.POSTGRES_USER ?? 'postgres'}:${
    process.env.POSTGRES_PASSWORD ?? 'postgres'
  }@${process.env.DB_HOST ?? 'localhost'}:${process.env.DB_PORT ?? '5432'}/${
    process.env.POSTGRES_DB ?? 'postgres'
  }`;

export default defineConfig({
  dialect: 'postgresql',
  schema: './apps/api/src/shared/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: databaseUrl,
  },
  verbose: true,
  strict: true,
});
