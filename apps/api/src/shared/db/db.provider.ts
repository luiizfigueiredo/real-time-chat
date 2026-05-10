import { Provider } from '@nestjs/common';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { envValues } from '../env-values';

export const DRIZZLE = 'DRIZZLE';

export const dbProvider: Provider = {
  provide: DRIZZLE,
  useFactory: () => {
    const databaseUrl =
      envValues.DATABASE_URL ??
      `postgresql://${envValues.DB_USER}:${envValues.DB_PASSWORD}@${envValues.DB_HOST}:${envValues.DB_PORT}/${envValues.DB_NAME}`;
    const pool = new Pool({ connectionString: databaseUrl });
    return drizzle(pool, { schema });
  },
};
