import {IsDateString, IsInt, IsNotEmpty, IsNumberString, IsOptional, IsString} from "class-validator";
import {Transform} from "class-transformer";

export class ChatIdDto {
    @IsInt()
    @IsNotEmpty()
    chatId: number;
}

export class CreateChatMessageDto extends ChatIdDto {
    @Transform(({ value }) => String(value))
    @IsString()
    @IsNotEmpty()
    content: string;
}

export class GetMessagesQueryDto {
    @IsOptional()
    @IsNumberString()
    limit?: string;

    @IsOptional()
    @IsDateString()
    before?: string;
}