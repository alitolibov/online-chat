import {BadRequestException, Inject, Injectable} from '@nestjs/common';
import type {DB} from "../types";
import {AddUserToGroupDTO, CreateGroupDTO, CreatePrivateDTO} from "../dtos/chats/chat.dto";
import {chat_members, chats} from "../db/schema";
import {and, eq, inArray} from "drizzle-orm";

@Injectable()
export class ChatsService {
    constructor(@Inject('DB') private readonly db: DB) {}

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

    async addUserToChatWithDB(db: DB, userId: number, chatId: number) {
        return await db.insert(chat_members).values({
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

        if(!chat.is_group) {
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

    getChatsForUser(userId: number) {
        return this.db
            .select()
            .from(chat_members)
            .where(eq(chat_members.user_id, userId));
    }
}
