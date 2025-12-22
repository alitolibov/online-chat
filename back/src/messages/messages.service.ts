import {ForbiddenException, Inject, Injectable} from '@nestjs/common';
import type {DB} from "../types";
import {chat_members, messages, users} from "../db/schema";
import {and, desc, eq, lt} from "drizzle-orm";
import {ICreateChatMessage} from "../types/messages";

@Injectable()
export class MessagesService {
    constructor(@Inject('DB') private readonly db: DB) {
    }

    async createMessage(data: ICreateChatMessage) {
        const member = await this.db
            .select()
            .from(chat_members)
            .where(
                and(
                    eq(chat_members.chat_id, data.chat_id),
                    eq(chat_members.user_id, data.user_id)
                )
            );

        if (member.length === 0) {
            throw new ForbiddenException("You are not a member of this chat");
        }

        const [message] = await this.db
            .insert(messages)
            .values({
                chat_id: data.chat_id,
                user_id: data.user_id,
                content: data.content
            })
            .returning()

        return message
    }

    async getLastMessages(chatId: number, limit = 50, before?: Date) {
        const rows = await this.db
            .select()
            .from(messages)
            .leftJoin(users, eq(messages.user_id, users.id))
            .where(
                before ? and(
                    eq(messages.chat_id, chatId),
                    lt(messages.createdAt, before)
                ) : eq(messages.chat_id, chatId),
            )
            .orderBy(desc(messages.createdAt))
            .limit(limit);

        return rows.map(r => ({
            ...r.messages,
            user: {
                id: r.users?.id,
                username: r.users?.username,
                avatar_url: r.users?.avatar_url,
                bio: r.users?.bio,
                createdAt: r.users?.createdAt
            }
        }));
    }
}
