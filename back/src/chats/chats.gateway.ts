import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
} from "@nestjs/websockets";
import {Logger, UseGuards} from "@nestjs/common";
import {WsJwtGuard} from "../auth/guard/ws-jwt.guard";
import {ChatsService} from "./chats.service";
import {MessagesService} from "../messages/messages.service";
import {Server, Socket} from "socket.io";
import {ChatIdDto, CreateChatMessageDto} from "../dtos/messages/messages.dto";
import {JwtService} from "@nestjs/jwt";

const logger = new Logger("ChatsModule");

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect  {
    @WebSocketServer()
    server: Server;

    constructor(
        private readonly chatsService: ChatsService,
        private readonly messagesService: MessagesService,
        private readonly jwtService: JwtService,
    ) {}


    async handleConnection(client: Socket) {
        try {
            const token = client.handshake.auth?.token;

            if (!token) {
                return client.disconnect();
            }

            const payload = this.jwtService.verify(token);

            client.data.user = payload;

            const user = client.data.user;

            logger.log(`[Chats] ${user.username} connected`);

            const chats = await this.chatsService.getChatsUser(user.id);

            chats.forEach((chat) => client.join(`chat_${chat.chat_id}`));

        } catch (err) {
            logger.error(err);
            client.disconnect();
        }
    }


    handleDisconnect(client: Socket) {
        const user = client.data.user;
        logger.log(`[Chats] ${user.username} disconnected`);
    }

    @UseGuards(WsJwtGuard)
    @SubscribeMessage('send_message')
    async handleMessage(client: Socket, payload: CreateChatMessageDto) {
        const user = client.data.user;

        const message = await this.messagesService.createMessage({
            chat_id: payload.chatId,
            content: payload.content,
            user_id: user.id,
        });

        this.server
            .to(`chat_${payload.chatId}`)
            .emit("new_message", message);


        return message;
    }

    @UseGuards(WsJwtGuard)
    @SubscribeMessage('typing')
    async handleTyping(client: Socket, payload: ChatIdDto) {

        const user = {
            id: client.data.user.id,
            username: client.data.user.username,
        };

        client.broadcast
            .to(`chat_${payload.chatId}`)
            .emit("typing", user);

    }

    @UseGuards(WsJwtGuard)
    @SubscribeMessage('stop_typing')
    async handleStopTyping(client: Socket, payload: ChatIdDto) {
        const userId = client.data.user.id;

        client.broadcast
            .to(`chat_${payload.chatId}`)
            .emit("stop_typing", { userId });
    }
}