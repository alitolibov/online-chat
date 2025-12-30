import {Pool} from "pg";
import {drizzle} from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import {Global, Module, Logger} from "@nestjs/common";
import * as dotenv from "dotenv";
import process from "process";

dotenv.config();

const logger = new Logger('DatabaseModule');

console.log('DB URL:', process.env.DATABASE_URL)

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
        process.env.NODE_ENV === 'production'
            ? {rejectUnauthorized: false}
            : false,
});

(async () => {
    try {
        const client = await pool.connect();
        logger.log('Successfully connected to the database');
        client.release();
    } catch (err) {
        logger.error('Failed to connect to the database:', err.message);
    }
})();

pool.on('error', (err) => {
    logger.error('Database connection error:', err.message);
});

const db = drizzle(pool, {schema});

@Global()
@Module({
    providers: [
        {
            provide: 'DB',
            useValue: db,
        },
    ],
    exports: ['DB'],
})
export class DbModule {
}
