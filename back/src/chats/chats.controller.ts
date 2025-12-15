import {Body, Controller, Post, Req, UseGuards} from '@nestjs/common';
import {ChatsService} from "./chats.service";
import {JwtGuard} from "../auth/guard/jwt.guard";
import {CreateChatDTO} from "../dtos/chats/chat.dto";

@Controller('chats')
export class ChatsController {
    constructor(private readonly chatsService: ChatsService) {}

    @UseGuards(JwtGuard)
    @Post('create-chat')
    async createChat(@Body() body: CreateChatDTO, @Req() req: any) {
        return await this.chatsService.createChat(body, req.user.id);
    }

}
