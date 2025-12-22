import {Body, Controller, Get, Post, Query, Req, UseGuards} from '@nestjs/common';
import {ChatsService} from "./chats.service";
import {JwtGuard} from "../auth/guard/jwt.guard";
import {AddUserToGroupDTO, CreateGroupDTO, CreatePrivateDTO, SearchChatsDTO} from "../dtos/chats/chat.dto";

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
    @Post('add-user-to-group')
    async addUserToChat(@Body() body: AddUserToGroupDTO) {
        return await this.chatsService.addUserToGroup(body);
    }

    @UseGuards(JwtGuard)
    @Get('user-chats')
    async getChatsUser(@Req() req: any) {
        return await this.chatsService.getChatsForUser(req.user.id);
    }

    @UseGuards(JwtGuard)
    @Get('search')
    async searchChats(@Req() req: any, @Query() query: SearchChatsDTO) {
        return await this.chatsService.searchChats(query.name, req.user.id);
    }

}
