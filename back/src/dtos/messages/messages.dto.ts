import {IsDateString, IsInt, IsNotEmpty, IsNumberString, IsOptional, IsString} from "class-validator";
import {Transform} from "class-transformer";

export class CreateChatMessageDto {
    @IsInt()
    @IsNotEmpty()
    chatId: number;

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