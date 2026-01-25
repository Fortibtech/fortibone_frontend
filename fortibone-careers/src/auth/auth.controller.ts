import { Controller, Post, Body, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    async login(@Body() body: any) {
        const user = await this.authService.validateUser(body.email, body.password);
        if (!user) {
            throw new UnauthorizedException('Identifiants invalides');
        }
        return this.authService.login(user);
    }

    @Post('register')
    async register(@Body() body: any) {
        try {
            return await this.authService.register(body.email, body.password);
        } catch (e) {
            throw new BadRequestException('Cet email est déjà utilisé');
        }
    }
}
