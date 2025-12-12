import {boolean, integer, pgTable, serial, timestamp, uniqueIndex, varchar} from "drizzle-orm/pg-core";

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    username: varchar('username', {length: 256}).notNull().unique(),
    password: varchar('password', {length: 100}).notNull(),
    bio: varchar('bio', { length: 255 }),
    avatar_url: varchar('avatar_url', { length: 512 }),
    createdAt: timestamp('created_at').defaultNow()
})

export const chats = pgTable('chats', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 256 }).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    is_group: boolean('is_group').default(false),
})

export const chat_members = pgTable('chat_members', {
    id: serial('id').primaryKey(),
    chat_id: integer('chat_id').notNull().references(() => chats.id, { onDelete: "cascade" }),
    user_id: integer('user_id').notNull().references(() => users.id, { onDelete: "cascade" }),
    joinedAt: timestamp('joined_at').defaultNow(),
}, ((table) => ({
    uniqueUserChat: uniqueIndex("unique_user_chat").on(table.user_id, table.chat_id)
})))

export const messages = pgTable('messages', {
    id: serial('id').primaryKey(),
    chat_id: integer('chat_id').notNull().references(() => chats.id, { onDelete: "cascade" }),
    user_id: integer('user_id').notNull().references(() => users.id, {onDelete: 'cascade'}),
    content: varchar('content', { length: 1000 }).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
})