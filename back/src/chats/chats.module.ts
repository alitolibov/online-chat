import {Module} from '@nestjs/common';
import {ChatsController} from './chats.controller';
import {ChatsService} from './chats.service';
import {MessagesService} from "../messages/messages.service";
import {ChatGateway} from "./chats.gateway";
import {AuthModule} from "../auth/auth.module";

@Module({
    imports: [AuthModule],
    controllers: [ChatsController],
    providers: [ChatsService, MessagesService, ChatGateway]
})

export class ChatsModule {
}
