import {Inject, Injectable} from '@nestjs/common';
import type {DB} from "../types";
import {CreateChatDTO} from "../dtos/chats/chat.dto";
import {chat_members, chats} from "../db/schema";

@Injectable()
export class ChatsService {
    constructor(@Inject('DB') private readonly db: DB) {}

    createChat(data: CreateChatDTO, userId: number) {
       return this.db.transaction(async (tx) => {
           const [newChat] = await tx
               .insert(chats)
               .values(
                   {
                       name: data.name,
                       is_group: data.isGroup
                   }
               )
               .returning();

              await this.addUserToChat(tx, userId, newChat.id);

              return newChat;
       })
    }

    async addUserToChat(
        db: DB,
        userId: number,
        chatId: number) {
        await db.insert(chat_members).values({
            chat_id: chatId,
            user_id: userId
        })
    }
}
