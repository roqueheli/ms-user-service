import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-github2';
import { UserAuthType } from 'src/users/entities/user.entity';
import { UsersService } from '../../users/users.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
    constructor(
        private configService: ConfigService,
        private usersService: UsersService,
    ) {
        super({
            clientID: configService.get<string>('GITHUB_CLIENT_ID'),
            clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET'),
            callbackURL: 'http://localhost:3000/api/auth/github/redirect',
            scope: ['user:email'],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: VerifyCallback,
    ): Promise<any> {
        const { emails, username } = profile;
        const email = emails[0].value;

        try {
            const user = await this.usersService.createSocialUser({
                email,
                first_name: username,
                last_name: '', // GitHub no proporciona apellido
                auth_type: UserAuthType.GITHUB,
            });

            const payload = {
                user_id: user.user_id,
                email: user.email,
            };

            done(null, payload);
        } catch (error) {
            done(error, null);
        }
    }
}