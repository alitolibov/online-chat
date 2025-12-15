import {IsBoolean, IsString, Length, IsOptional, IsNotEmpty} from "class-validator";

export class CreateChatDTO {
    @IsString()
    @IsNotEmpty()
    @Length(3, 100)
    name: string;

    @IsBoolean()
    @IsOptional()
    isGroup?: boolean;
}

export class UpdateChatDTO {
    @IsString()
    @Length(3, 100)
    @IsOptional()
    name?: string;

    @IsBoolean()
    @IsOptional()
    isGroup?: boolean;
}