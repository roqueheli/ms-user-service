import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { UserAuthType } from 'src/users/entities/user.entity';
import { UsersService } from '../../users/users.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        private configService: ConfigService,
        private usersService: UsersService,
    ) {
        super({
            clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
            clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
            callbackURL: 'http://localhost:3000/api/auth/google/redirect',
            scope: ['email', 'profile'],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: VerifyCallback,
    ): Promise<any> {
        const { emails, name } = profile;
        const email = emails[0].value;

        try {
            const user = await this.usersService.createSocialUser({
                email,
                first_name: name.givenName,
                last_name: name.familyName,
                auth_type: UserAuthType.GOOGLE,
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