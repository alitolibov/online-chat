import {BadRequestException, Injectable} from '@nestjs/common';
import {UsersService} from "../users/users.service";
import {JwtService} from "@nestjs/jwt";
import * as bcrypt from 'bcrypt';
import {AuthDto} from "./dtos";

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService
    ) {}

    private generateToken(id: number,username: string, password: string) {
        return this.jwtService.sign({ id, username, password });
    }

    async login(data: AuthDto) {
        const user = await this.usersService.findUserByUsername(data.username);

        if(!user) throw new BadRequestException('Invalid password or username');

        const isPasswordValid = await bcrypt.compare(data.password, user.password);

        if(!isPasswordValid) throw new BadRequestException('Invalid password or username');

        return {
            access_token: this.generateToken(user.id, data.username, data.password)
        }
    }

    async register(data: AuthDto) {
        const user = await this.usersService.findUserByUsername(data.username);

        if(user) throw new BadRequestException('User already exists');

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const createdUser = await this.usersService.createUser(data.username, hashedPassword)

        const {password, ...userData} = createdUser;

        return userData;
    }
}
