import {IsInt, IsNotEmpty, IsString} from "class-validator";
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