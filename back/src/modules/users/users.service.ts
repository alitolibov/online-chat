import {Inject, Injectable} from '@nestjs/common';
import {eq} from "drizzle-orm";
import {chat_members, chats, users} from "../../db/schema";
import type {DB} from "../../types";

@Injectable()
export class UsersService {
    constructor(@Inject('DB') private readonly db: DB) {}

    async findUserByUsername(username: string) {
        const result = await this.db
            .select()
            .from(users)
            .where(eq(users.username, username))
            .limit(1)

        return result[0] ?? null
    }

    async createUser(username: string, password: string) {
        const result = await this.db
            .insert(users)
            .values({ username, password })
            .returning();

        return result[0];
    }

    async getUserWithChats(userId: number) {
        const user = await this.db.query.users.findFirst({
            where: eq(users.id, userId),
        });

        if (!user) return null;

        const chatList = await this.db
            .select()
            .from(chat_members)
            .leftJoin(chats, eq(chat_members.chat_id, chats.id))
            .where(eq(chat_members.user_id, userId));


        return {
            ...user,
            chats: chatList.map(c => c ? c.chats : null),
        };
    }
}
