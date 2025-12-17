import {IsBoolean, IsString, Length, IsOptional, IsNotEmpty, IsNumber} from "class-validator";

export class CreateGroupDTO {
    @IsString()
    @IsNotEmpty()
    @Length(3, 100)
    name: string;
}

export class CreatePrivateDTO {
    @IsNumber()
    @IsNotEmpty()
    otherUserId: number;
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