import {BadRequestException, Inject, Injectable} from '@nestjs/common';
import type {DB} from "../types";
import {AddUserToGroupDTO, CreateGroupDTO, CreatePrivateDTO, SearchChatsDTO} from "../dtos/chats/chat.dto";
import {chat_members, chats, users} from "../db/schema";
import {and, eq, inArray, like, ne, sql} from "drizzle-orm";

@Injectable()
export class ChatsService {
    constructor(@Inject('DB') private readonly db: DB) {
    }

    createGroup(data: CreateGroupDTO, userId: number) {
        return this.db.transaction(async (tx) => {
            const [newChat] = await tx
                .insert(chats)
                .values(
                    {
                        name: data.name,
                        is_group: true
                    }
                )
                .returning();

            await this.addUserToChatWithDB(tx, userId, newChat.id);

            return newChat;
        })
    }

    async createPrivateChat(data: CreatePrivateDTO, userId1: number) {
        if (data.otherUserId === userId1) {
            throw new BadRequestException("Cannot create chat with yourself");
        }

        const existingChat = await this.findExistingPrivateChat(userId1, data.otherUserId);

        if (existingChat) return existingChat

        return this.db.transaction(async (tx) => {
            const [newChat] = await tx
                .insert(chats)
                .values(
                    {
                        name: null,
                        is_group: false
                    }
                )
                .returning();

            await Promise.all([
                this.addUserToChatWithDB(tx, userId1, newChat.id),
                this.addUserToChatWithDB(tx, data.otherUserId, newChat.id)
            ])

            return newChat;
        })
    }

    addUserToChatWithDB(db: DB, userId: number, chatId: number) {
        return db.insert(chat_members).values({
            chat_id: chatId,
            user_id: userId,
        }).returning();
    }

    async addUserToGroup(data: AddUserToGroupDTO) {
        const [chat] = await this.db
            .select()
            .from(chats)
            .where(eq(chats.id, data.chatId));

        if (!chat) {
            throw new BadRequestException("Chat not found");
        }

        if (!chat.is_group) {
            throw new BadRequestException("Cannot add users to a private chat");
        }

        const [existingMember] = await this.db
            .select()
            .from(chat_members)
            .where(
                and(
                    eq(chat_members.chat_id, data.chatId),
                    eq(chat_members.user_id, data.userId)
                )
            );

        if (existingMember) {
            throw new BadRequestException("User is already in this group chat");
        }

        return this.addUserToChatWithDB(this.db, data.userId, data.chatId);
    }

    private async findExistingPrivateChat(userId1: number, userId2: number) {
        const chatsUser1 = await this.db
            .select()
            .from(chat_members)
            .innerJoin(chats, eq(chat_members.chat_id, chats.id))
            .where(
                and(
                    eq(chat_members.user_id, userId1),
                    eq(chats.is_group, false)
                )
            );

        const privateChatIds = chatsUser1.map(c => c.chat_members.chat_id)

        if (privateChatIds.length === 0) return null;

        const [chatWithUser2] = await this.db
            .select()
            .from(chat_members)
            .where(
                and(
                    inArray(chat_members.chat_id, privateChatIds),
                    eq(chat_members.user_id, userId2)
                )
            );

        if (!chatWithUser2) return null;

        return chatsUser1
            .map((c) => c.chats)
            .find(c => c.id === chatWithUser2.chat_id) ?? null;
    }

    async getChatsForUser(userId: number) {
        const userChats = await this.db
            .select({
                chat_id: chats.id,
                isGroup: chats.is_group,
                name: chats.name
            })
            .from(chat_members)
            .innerJoin(chats, eq(chat_members.chat_id, chats.id))
            .where(eq(chat_members.user_id, userId))

        if (userChats.length === 0) return []

        const lastMessages = await this.getLastMessages(userChats.map(c => c.chat_id))
        const lastMap = new Map(lastMessages.map(c => [c.chat_id, c.content]))

        const privateChatsIds = userChats.filter(c => !c.isGroup)
        const privateNames = new Map<number, string>()

        if (privateChatsIds.length) {
            const otherUsers = await this.db
                .select()
                .from(chat_members)
                .innerJoin(users, eq(chat_members.user_id, users.id))
                .where(
                    and(
                        inArray(chat_members.chat_id, privateChatsIds.map(c => c.chat_id)),
                        ne(chat_members.user_id, userId)
                    )
                )

            otherUsers.forEach(ou => {
                privateNames.set(ou.chat_members.chat_id, ou.users.username)
            })
        }

        return userChats.map((ch) => ({
            chat_id: ch.chat_id,
            is_group: ch.isGroup,
            name: ch.isGroup ? ch.name : privateNames.get(ch.chat_id),
            last_message: lastMap.get(ch.chat_id) || null
        }))

    }

    private async getLastMessages(chatIds: number[]) {
        if (chatIds.length === 0) return [];

        const pgArray = `{${chatIds.join(",")}}`;

        const result = await this.db.execute(sql`
            SELECT DISTINCT
            ON (m.chat_id)
                m.id,
                m.chat_id,
                m.user_id,
                m.content,
                m.created_at
            FROM messages m
            WHERE m.chat_id = ANY (${pgArray}:: int [])
            ORDER BY m.chat_id, m.created_at DESC;
        `);

        return result.rows;
    }


    async getChatsUser(userId: number) {
        return this.db
            .select()
            .from(chat_members)
            .where(eq(chat_members.user_id, userId))
    }

    async searchChats(query: string, currentUserId: number) {

        const foundUsers = await this.db
            .select()
            .from(users)
            .where(
                and(
                    like(users.username, `%${query}%`),
                    ne(users.id, currentUserId)
                )
            )

        const foundGroups = await this.db
            .select()
            .from(chats)
            .where(
                and(
                    like(chats.name, `%${query}%`),
                    eq(chats.is_group, true)
                )
            )

        return {
            users: foundUsers.map((u) => (
                {
                    id: u.id,
                    username: u.username,
                    avatar_url: u.avatar_url,
                }
            )),
            groups: foundGroups.map(c => ({
                id: c.id,
                name: c.name,
                createdAt: c.createdAt
            }))
        }
    }
}
