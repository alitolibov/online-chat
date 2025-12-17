import {Body, Controller, Post, Req, UseGuards} from '@nestjs/common';
import {ChatsService} from "./chats.service";
import {JwtGuard} from "../auth/guard/jwt.guard";
import {CreateGroupDTO, CreatePrivateDTO} from "../dtos/chats/chat.dto";

@Controller('chats')
export class ChatsController {
    constructor(private readonly chatsService: ChatsService) {}

    @UseGuards(JwtGuard)
    @Post('group')
    async createGroup(@Body() body: CreateGroupDTO, @Req() req: any) {
        return await this.chatsService.createGroup(body, req.user.id);
    }

    @UseGuards(JwtGuard)
    @Post('private-chat')
    async createPrivateChat(@Body() body: CreatePrivateDTO, @Req() req: any) {
        return await this.chatsService.createPrivateChat(body, req.user.id);
    }

    @UseGuards(JwtGuard)
    @Post('add-user-to-chat')
    async addUserToChat(@Body() body: { chatId: number, userId: number }) {
        return await this.chatsService.addUserToChat(body.userId, body.chatId);
    }

}
