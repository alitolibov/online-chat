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


export class AddUserToGroupDTO {
    @IsNumber()
    @IsNotEmpty()
    userId: number;

    @IsNumber()
    @IsNotEmpty()
    chatId: number;
}