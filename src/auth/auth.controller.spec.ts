import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserAuthType } from 'src/users/entities/user.entity';

describe('AuthController', () => {
    let authController: AuthController;
    let authService: AuthService;

    const mockAuthService = {
        validateOAuthLogin: jest.fn(),
        loginSocial: jest.fn(),
    };

    beforeEach(async () => {
        const mockAuthService = {
            validateOAuthLogin: jest.fn().mockImplementation((user, provider) => {
                return Promise.resolve({
                    access_token: 'mock-token',
                    user: {
                        user_id: '123',
                        email: user.email,
                        first_name: user.firstName,
                        last_name: user.lastName,
                        role: 'user',
                        auth_type: provider.toUpperCase()
                    }
                });
            })
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: mockAuthService,
                },
            ],
        }).compile();

        authController = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
    });

    describe('Google Login', () => {
        it('should redirect to Google login page', async () => {
            const result = await authController.googleAuth();
            expect(result).toBeUndefined(); // El método solo redirige, no devuelve nada
        });

        it('should handle Google login callback', async () => {
            const mockUser = {
                email: 'test@gmail.com',
                firstName: 'Test',
                lastName: 'User',
            };

            const expectedResponse = {
                access_token: 'mock-token',
                user: {
                    user_id: '123',
                    email: 'test@gmail.com',
                    first_name: 'Test',
                    last_name: 'User',
                    role: 'user',
                    auth_type: 'GOOGLE' as UserAuthType
                }
            };

            jest.spyOn(authService, 'validateOAuthLogin').mockResolvedValue(expectedResponse);

            const result = await authController.googleAuthRedirect({ user: mockUser });

            expect(authService.validateOAuthLogin).toHaveBeenCalledWith(mockUser, 'google');
            expect(result).toEqual(expectedResponse);
        });
    });

    describe('GitHub Login', () => {
        it('should redirect to GitHub login page', async () => {
            const result = await authController.githubAuth();
            expect(result).toBeUndefined(); // El método solo redirige, no devuelve nada
        });

        it('should handle GitHub login callback', async () => {
            // Mock de datos como los devuelve GitHub
            const mockGithubUser = {
                email: 'test@github.com',
                name: 'GitHub User',
                login: 'githubuser',
                // otros campos que GitHub proporciona
            };

            const expectedResponse = {
                access_token: 'mock-jwt-token',
                user: {
                    user_id: '123',
                    email: 'test@github.com',
                    first_name: 'GitHub',
                    last_name: 'User',
                    role: 'user',
                    auth_type: 'GITHUB' as UserAuthType
                }
            };

            jest.spyOn(authService, 'validateOAuthLogin')
                .mockResolvedValue(expectedResponse);

            const result = await authController.githubAuthRedirect({
                user: mockGithubUser
            });

            expect(authService.validateOAuthLogin)
                .toHaveBeenCalledWith(mockGithubUser, 'github');
            expect(result).toEqual(expectedResponse);
        });
    });
});