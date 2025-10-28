import {NodePgDatabase} from "drizzle-orm/node-postgres";

export type DB = NodePgDatabase<typeof import('../db/schema')>