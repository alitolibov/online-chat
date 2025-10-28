import {Body, Controller, Post} from '@nestjs/common';
import {AuthService} from "./auth.service";
import {AuthDto} from "./dtos";

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) {}

    @Post('sign-in')
    signIn(@Body() data: AuthDto) {
        return this.authService.login(data);
    }

    @Post('sign-up')
    register(@Body() data: AuthDto) {
        return this.authService.register(data);
    }
}
