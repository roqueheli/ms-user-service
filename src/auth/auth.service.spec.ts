// src/auth/auth.service.spec.ts
import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Profile } from '../users/entities/profile.entity';
import { User, UserAuthType } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { OAuthUser } from './interfaces/oauth-user.interface';

interface MockUsersService {
    createSocialUser: jest.Mock;
}

interface MockJwtService {
    sign: jest.Mock;
}

describe('AuthService', () => {
    let authService: AuthService;
    let usersService: MockUsersService;
    let jwtService: MockJwtService;

    const mockUsersService: MockUsersService = {
        createSocialUser: jest.fn(),
    };

    const mockJwtService: MockJwtService = {
        sign: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
            ],
        }).compile();

        authService = module.get<AuthService>(AuthService);
        usersService = module.get<UsersService>(UsersService) as unknown as MockUsersService;
        jwtService = module.get<JwtService>(JwtService) as unknown as MockJwtService;
    });

    describe('validateOAuthLogin', () => {
        it('should create a new user and return a JWT token', async () => {
            const mockOAuthUser = {
                email: 'test@gmail.com',
                name: 'Test User',
            };

            const expectedSocialUserDto = {
                email: 'test@gmail.com',
                first_name: 'Test',
                last_name: 'User',
                auth_type: 'GOOGLE',
            };

            const mockCreatedUser: User = {
                user_id: '123',
                email: 'test@gmail.com',
                first_name: 'Test',
                last_name: 'User',
                auth_type: 'GOOGLE' as UserAuthType,
                password_hash: null,
                created_at: new Date(),
                updated_at: new Date(),
                profile: new Profile(),
            };

            const mockToken = 'mock-jwt-token';

            // Configurar los mocks
            mockUsersService.createSocialUser.mockResolvedValue(mockCreatedUser);
            mockJwtService.sign.mockReturnValue(mockToken);

            const result = await authService.validateOAuthLogin(mockOAuthUser, 'google');

            // Verificar que createSocialUser fue llamado con los parámetros correctos
            expect(mockUsersService.createSocialUser).toHaveBeenCalledWith(expectedSocialUserDto);

            // Verificar que sign fue llamado con los parámetros correctos
            expect(mockJwtService.sign).toHaveBeenCalledWith({
                email: mockCreatedUser.email,
                sub: mockCreatedUser.user_id,
            });

            // Verificar la respuesta completa
            expect(result).toEqual({
                access_token: mockToken,
                user: {
                    user_id: mockCreatedUser.user_id,
                    email: mockCreatedUser.email,
                    first_name: mockCreatedUser.first_name,
                    last_name: mockCreatedUser.last_name,
                    auth_type: mockCreatedUser.auth_type,
                },
            });
        });

        it('should handle user with no last name', async () => {
            // Mock del usuario con un solo nombre
            const mockOAuthUser = {
                email: 'test@gmail.com',
                name: 'Test', // Solo el nombre, sin apellido
            };

            // El DTO esperado debe tener last_name vacío
            const expectedSocialUserDto = {
                email: 'test@gmail.com',
                first_name: 'Test',
                last_name: '', // Cambiado de 'Test' a ''
                auth_type: 'GOOGLE',
            };

            const mockCreatedUser = {
                user_id: '123',
                email: 'test@gmail.com',
                first_name: 'Test',
                last_name: '', // Mantener consistencia con el DTO
                auth_type: 'GOOGLE',
                password_hash: null,
                created_at: new Date(),
                updated_at: new Date(),
                profile: new Profile(),
            };

            const expectedResponse = {
                access_token: 'mock-jwt-token',
                user: {
                    user_id: '123',
                    email: 'test@gmail.com',
                    first_name: 'Test',
                    last_name: '', // Mantener consistencia
                    auth_type: 'GOOGLE',
                }
            };

            // Configurar los mocks
            mockUsersService.createSocialUser.mockReset(); // Resetear el mock específicamente
            mockUsersService.createSocialUser.mockResolvedValueOnce(mockCreatedUser);
            mockJwtService.sign.mockReturnValueOnce('mock-jwt-token');

            const result = await authService.validateOAuthLogin(mockOAuthUser, 'google');

            // Verificar que createSocialUser fue llamado una sola vez con los parámetros correctos
            expect(mockUsersService.createSocialUser).toHaveBeenCalledTimes(1);
            expect(mockUsersService.createSocialUser).toHaveBeenCalledWith(expectedSocialUserDto);
            expect(result).toEqual(expectedResponse);
        });

        it('should throw an error if name is missing', async () => {
            const mockOAuthUser = {
                email: 'test@gmail.com',
                // sin firstName ni lastName
            };

            await expect(
                authService.validateOAuthLogin(mockOAuthUser, 'google')
            ).rejects.toThrow('Nombre y email son requeridos');
        });

        it('should throw an error if name is missing', async () => {
            const mockOAuthUser: OAuthUser = {
                email: 'test@gmail.com',
                id: '123',
            };

            await expect(authService.validateOAuthLogin(mockOAuthUser, 'google'))
                .rejects
                .toThrow(BadRequestException);
        });

        it('should throw an error if email is missing', async () => {
            const mockOAuthUser: OAuthUser = {
                name: 'Test User',
                id: '123',
            };

            await expect(authService.validateOAuthLogin(mockOAuthUser, 'google'))
                .rejects
                .toThrow(BadRequestException);
        });

        it('should handle GitHub user with full name', async () => {
            const mockOAuthUser = {
                email: 'githubuser@gmail.com',
                name: 'GitHub User',
            };

            const expectedSocialUserDto = {
                email: 'githubuser@gmail.com',
                first_name: 'GitHub',
                last_name: 'User',
                auth_type: 'GITHUB',
            };

            const mockCreatedUser = {
                user_id: '456',
                email: 'githubuser@gmail.com',
                first_name: 'GitHub',
                last_name: 'User',
                auth_type: 'GITHUB',
                password_hash: null,
                created_at: new Date(),
                updated_at: new Date(),
                profile: new Profile(),
            };

            const expectedResponse = {
                access_token: 'mock-jwt-token',
                user: {
                    user_id: '456',
                    email: 'githubuser@gmail.com',
                    first_name: 'GitHub',
                    last_name: 'User',
                    auth_type: 'GITHUB',
                }
            };

            // Configurar los mocks
            mockUsersService.createSocialUser.mockResolvedValueOnce(mockCreatedUser);
            mockJwtService.sign.mockReturnValueOnce('mock-jwt-token');

            const result = await authService.validateOAuthLogin(mockOAuthUser, 'github');

            // Verificar que createSocialUser fue llamado con los parámetros correctos
            expect(mockUsersService.createSocialUser).toHaveBeenCalledTimes(1);
            expect(mockUsersService.createSocialUser).toHaveBeenCalledWith(expectedSocialUserDto);
            expect(result).toEqual(expectedResponse);
        });

        it('should handle GitHub user with no last name', async () => {
            const mockOAuthUser = {
                email: 'githubuser@gmail.com',
                name: 'GitHub', // Solo el nombre
            };

            const expectedSocialUserDto = {
                email: 'githubuser@gmail.com',
                first_name: 'GitHub',
                last_name: '', // Sin apellido
                auth_type: 'GITHUB',
            };

            const mockCreatedUser = {
                user_id: '456',
                email: 'githubuser@gmail.com',
                first_name: 'GitHub',
                last_name: '',
                auth_type: 'GITHUB',
                password_hash: null,
                created_at: new Date(),
                updated_at: new Date(),
                profile: new Profile(),
            };

            const expectedResponse = {
                access_token: 'mock-jwt-token',
                user: {
                    user_id: '456',
                    email: 'githubuser@gmail.com',
                    first_name: 'GitHub',
                    last_name: '',
                    auth_type: 'GITHUB',
                }
            };

            // Configurar los mocks
            mockUsersService.createSocialUser.mockResolvedValueOnce(mockCreatedUser);
            mockJwtService.sign.mockReturnValueOnce('mock-jwt-token');

            const result = await authService.validateOAuthLogin(mockOAuthUser, 'github');

            // Verificar que createSocialUser fue llamado con los parámetros correctos
            expect(mockUsersService.createSocialUser).toHaveBeenCalledTimes(1);
            expect(mockUsersService.createSocialUser).toHaveBeenCalledWith(expectedSocialUserDto);
            expect(result).toEqual(expectedResponse);
        });

        it('should throw BadRequestException if GitHub user has no email', async () => {
            const mockOAuthUser = {
                name: 'GitHub User',
            };

            await expect(
                authService.validateOAuthLogin(mockOAuthUser, 'github')
            ).rejects.toThrow(new BadRequestException('Nombre y email son requeridos'));
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
});
