import {Controller, Get, Param, Query, UseGuards} from '@nestjs/common';
import {MessagesService} from "./messages.service";
import {JwtGuard} from "../auth/guard/jwt.guard";
import {GetMessagesQueryDto} from "../../dtos/messages/messages.dto";

@Controller('messages')
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) {}

    @Get(':chatId')
    @UseGuards(JwtGuard)
    getMessagesByChatId(
        @Param('chatId') chatId: number,
        @Query()query: GetMessagesQueryDto,
    ) {
        const limit = query.limit ? parseInt(query.limit, 10) : 50;

        const before = query.before ? new Date(query.before) : undefined;

        return this.messagesService.getLastMessages(chatId, limit, before);
    }
}
