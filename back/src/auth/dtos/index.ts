import {IsNotEmpty, IsString, MinLength} from "class-validator";

export class AuthDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(5, { message: 'Username must be at least 5 characters' })
    username: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters' })
    password: string;
}