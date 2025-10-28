import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';
import process from 'process';

export default defineConfig({
    schema: './src/db/schema.ts',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        host: 'localhost',
        user: 'postgres',
        password: process.env.DATABASE_PASSWORD || 'postgres',
        database: process.env.DATABASE_NAME  || 'postgres',
        ssl: false,
    },
});
