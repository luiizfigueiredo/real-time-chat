import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

export const envValues = {
  DATABASE_URL: process.env.DATABASE_URL,
  DB_HOST: process.env.DB_HOST ?? 'localhost',
  DB_PORT: process.env.DB_PORT ?? '5432',
  DB_USER: process.env.POSTGRES_USER ?? 'postgres',
  DB_PASSWORD: process.env.POSTGRES_PASSWORD ?? 'postgres',
  DB_NAME: process.env.POSTGRES_DB ?? 'postgres',
  JWT_SECRET: process.env.JWT_SECRET ?? 'default-secret',
  JWT_EXPIRES_IN_SECONDS: process.env.JWT_EXPIRES_IN_SECONDS ?? '3600',
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  PORT: process.env.PORT ?? '5000',
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  COOKIE_SECURE: process.env.COOKIE_SECURE,
  COOKIE_SAME_SITE: process.env.COOKIE_SAME_SITE,
};
