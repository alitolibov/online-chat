import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {ConfigModule} from '@nestjs/config';
import {AppService} from './app.service';
import {DbModule} from "./db/db.module";
import { AuthModule } from './modules/auth/auth.module';
import {UsersModule} from "./modules/users/users.module";
import {jwtConfig} from "./config";
import { ChatsModule } from './modules/chats/chats.module';
import { MessagesModule } from './modules/messages/messages.module';

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
