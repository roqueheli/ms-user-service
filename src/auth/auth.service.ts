import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { UserAuthType } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.usersService.findByEmail(email);
        if (user && await bcrypt.compare(password, user.password_hash)) {
            const { password_hash, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.user_id };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async loginSocial(user: any) {
        const payload = {
            email: user.email,
            sub: user.user_id,
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                user_id: user.user_id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                auth_type: user.auth_type
            }
        };
    }

    async validateOAuthLogin(user: any, provider: string) {
        try {
            if (!user.name || !user.email) {
                throw new BadRequestException('Nombre y email son requeridos');
            }

            const nameParts = user.name.split(' ');
            const socialUserDto = {
                email: user.email,
                first_name: nameParts[0],
                last_name: nameParts.slice(1).join(' ') || '', // String vacío si no hay apellido
                auth_type: provider.toUpperCase() as UserAuthType,
            };

            const createdUser = await this.usersService.createSocialUser(socialUserDto);
            const token = this.jwtService.sign({
                email: createdUser.email,
                sub: createdUser.user_id,
            });

            return {
                access_token: token,
                user: {
                    user_id: createdUser.user_id,
                    email: createdUser.email,
                    first_name: createdUser.first_name,
                    last_name: createdUser.last_name,
                    auth_type: createdUser.auth_type,
                },
            };
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new Error('Error during authentication: ' + error.message);
        }
    }
}