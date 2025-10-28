import {integer, pgTable, serial, timestamp, varchar} from "drizzle-orm/pg-core";

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    username: varchar('username', {length: 256}).notNull().unique(),
    password: varchar('password', {length: 100}).notNull(),
    bio: varchar('bio', { length: 255 }),
    avatarId: integer('avatar_id'),
    createdAt: timestamp('created_at').defaultNow()
})