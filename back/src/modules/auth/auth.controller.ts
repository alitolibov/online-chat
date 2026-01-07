import {Body, Controller, Get, Post, Req, Res, UnauthorizedException, UseGuards} from '@nestjs/common';
import {AuthService} from "./auth.service";
import {AuthDto} from "./dtos";
import {JwtGuard} from "./guard/jwt.guard";

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) {}

    @Post('sign-in')
    async signIn(@Body() body: AuthDto, @Res({ passthrough: true }) res) {
        const data =  await this.authService.login(body);

        res.cookie('access_token', data.access_token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 60 * 60 * 1000
        })

        return {success: true};
    }

    @Post('sign-up')
    register(@Body() data: AuthDto) {
        return this.authService.register(data);
    }

    @UseGuards(JwtGuard)
    @Get('me')
    me(@Req() req: any) {

        console.log(req);
        if(req.user) {
            return req.user;
        }

        throw new UnauthorizedException();
    }
}
