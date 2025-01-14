import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('Autenticacion')
@Controller('api/auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    // Google Authentication
    @Get('google')
    @UseGuards(AuthGuard('google'))
    @ApiOperation({
        summary: 'Iniciar autenticación con Google',
        description: 'Redirige al usuario al flujo de autenticación de Google'
    })
    @ApiResponse({
        status: 302,
        description: 'Redirección a Google'
    })
    async googleAuth() {
        return;
    }

    @Get('google/redirect')
    @UseGuards(AuthGuard('google'))
    @ApiOperation({
        summary: 'Callback de Google',
        description: 'Endpoint al que Google redirige después de la autenticación'
    })
    @ApiResponse({
        status: 200,
        description: 'Login exitoso',
        schema: {
            properties: {
                access_token: { type: 'string' },
                user: {
                    type: 'object',
                    properties: {
                        user_id: { type: 'string' },
                        email: { type: 'string' },
                        first_name: { type: 'string' },
                        last_name: { type: 'string' },
                        role: { type: 'string' },
                        auth_type: { type: 'string' }
                    }
                }
            }
        }
    })
    async googleAuthRedirect(@Req() req) {
        return this.authService.validateOAuthLogin(req.user, 'google');
    }

    // GitHub Authentication
    @Get('github')
    @UseGuards(AuthGuard('github'))
    @ApiOperation({
        summary: 'Iniciar autenticación con GitHub',
        description: 'Redirige al usuario al flujo de autenticación de GitHub'
    })
    @ApiResponse({
        status: 302,
        description: 'Redirección a GitHub'
    })
    async githubAuth() {
        return;
    }

    @Get('github/redirect')
    @UseGuards(AuthGuard('github'))
    @ApiOperation({
        summary: 'Callback de GitHub',
        description: 'Endpoint al que GitHub redirige después de la autenticación'
    })
    @ApiResponse({
        status: 200,
        description: 'Login exitoso',
        schema: {
            properties: {
                access_token: { type: 'string' },
                user: {
                    type: 'object',
                    properties: {
                        user_id: { type: 'string' },
                        email: { type: 'string' },
                        first_name: { type: 'string' },
                        last_name: { type: 'string' },
                        role: { type: 'string' },
                        auth_type: { type: 'string' }
                    }
                }
            }
        }
    })
    async githubAuthRedirect(@Req() req) {
        return this.authService.validateOAuthLogin(req.user, 'github');
    }
}