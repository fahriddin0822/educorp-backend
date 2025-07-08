import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './shared/schema.js';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set. Did you forget to provision a database?');
}

// Initialize PostgreSQL client
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initialize Drizzle with PostgreSQL client
export const db = drizzle(pool, { schema });