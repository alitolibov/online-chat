import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {ConfigModule} from '@nestjs/config';
import {AppService} from './app.service';
import {DbModule} from "./db/db.module";
import { AuthModule } from './auth/auth.module';
import {UsersModule} from "./users/users.module";
import {jwtConfig} from "./config";
import { ChatsModule } from './chats/chats.module';
import { MessagesModule } from './messages/messages.module';

@Module({
    imports: [
        ConfigModule.forRoot({
        isGlobal: true,
        cache: true,
            load: [jwtConfig]
        }),
        DbModule,
        AuthModule,
        UsersModule,
        ChatsModule,
        MessagesModule
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
