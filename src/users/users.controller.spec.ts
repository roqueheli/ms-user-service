import { ConflictException, ForbiddenException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserAuthType } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const mockUsersService = {
    findUserProfile: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    createLocalUser: jest.fn(),
    findOne: jest.fn(),
};

describe('UsersController', () => {
    let controller: UsersController;
    let usersService: UsersService;
    let authService: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                {
                    provide: UsersService,
                    useValue: {
                        createLocalUser: jest.fn(),
                        findOne: jest.fn(),
                    },
                },
                {
                    provide: AuthService,
                    useValue: {
                        login: jest.fn(),
                    },
                },
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
            ],
        }).compile();

        controller = module.get<UsersController>(UsersController);
        usersService = module.get<UsersService>(UsersService);
        authService = module.get<AuthService>(AuthService);
    });

    it('debería estar definido', () => {
        expect(controller).toBeDefined();
    });

    describe('register', () => {
        it('debería registrar un usuario y devolver un token', async () => {
            const createUserDto: CreateUserDto = {
                email: 'test@example.com',
                password: 'password123', // Cambiado de password_hash a password
                first_name: 'John',
                last_name: 'Doe',
            };

            const mockUser = new User();
            Object.assign(mockUser, {
                ...createUserDto,
                user_id: '123',
                password_hash: 'hashed_password',
                auth_type: UserAuthType.LOCAL,
                profile: null,
                created_at: new Date(),
                updated_at: new Date(),
            });

            const token = { access_token: 'jwt_token' };

            jest.spyOn(usersService, 'createLocalUser').mockResolvedValue(mockUser);
            jest.spyOn(authService, 'login').mockResolvedValue(token);

            const result = await controller.register(createUserDto);
            expect(result).toEqual(token);
            expect(usersService.createLocalUser).toHaveBeenCalledWith(createUserDto);
        });
    });

    describe('getProfile', () => {
        it('debería devolver el perfil del usuario', async () => {
            const userId = '123';

            // Crear una instancia completa de User
            const mockUser = new User();
            Object.assign(mockUser, {
                user_id: userId,
                email: 'test@example.com',
                password_hash: 'hashed_password',
                first_name: 'John',
                last_name: 'Doe',
                auth_type: UserAuthType.LOCAL,
                profile: null,
                created_at: new Date(),
                updated_at: new Date(),
            });

            jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser);

            const result = await controller.getProfile({ userId });
            expect(result).toEqual(mockUser);
            expect(usersService.findOne).toHaveBeenCalledWith(userId);
        });
    });

    describe('updateUser', () => {
        const userId = '123e4567-e89b-12d3-a456-426614174000';
        const updateUserDto: UpdateUserDto = {
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com'
        };

        const mockUpdatedUser: Partial<User> = {
            user_id: userId,
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com',
            created_at: new Date(),
            updated_at: new Date()
        };

        it('debería permitir a un usuario actualizar su propio perfil', async () => {
            const req = {
                user: {
                    userId: userId, // Nota: usando userId como en el controlador
                    role: 'user'
                }
            };

            mockUsersService.updateUser.mockResolvedValue(mockUpdatedUser);

            const result = await controller.updateUser(userId, updateUserDto, req);

            expect(usersService.updateUser).toHaveBeenCalledWith(userId, updateUserDto);
            expect(result).toEqual(mockUpdatedUser);
        });

        it('debería permitir a un admin actualizar cualquier usuario', async () => {
            const req = {
                user: {
                    userId: 'admin-id', // ID diferente pero rol admin
                    role: 'admin'
                }
            };

            mockUsersService.updateUser.mockResolvedValue(mockUpdatedUser);

            const result = await controller.updateUser(userId, updateUserDto, req);

            expect(usersService.updateUser).toHaveBeenCalledWith(userId, updateUserDto);
            expect(result).toEqual(mockUpdatedUser);
        });

        it('debería lanzar ForbiddenException si un usuario intenta actualizar otro usuario', async () => {
            const req = {
                user: {
                    userId: 'different-id',
                    role: 'user'
                }
            };

            await expect(
                controller.updateUser(userId, updateUserDto, req)
            ).rejects.toThrow(new ForbiddenException('No tiene permisos para actualizar este usuario'));
        });

        it('debería propagar NotFoundException del servicio', async () => {
            const req = {
                user: {
                    userId: userId,
                    role: 'user'
                }
            };

            mockUsersService.updateUser.mockRejectedValue(
                new NotFoundException(`Usuario con ID: ${userId} no encontrado`)
            );

            await expect(
                controller.updateUser(userId, updateUserDto, req)
            ).rejects.toThrow(NotFoundException);
        });

        it('debería propagar ConflictException del servicio', async () => {
            const req = {
                user: {
                    userId: userId,
                    role: 'user'
                }
            };

            mockUsersService.updateUser.mockRejectedValue(
                new ConflictException(`El email ${updateUserDto.email} ya está en uso`)
            );

            await expect(
                controller.updateUser(userId, updateUserDto, req)
            ).rejects.toThrow(ConflictException);
        });

        it('debería propagar InternalServerErrorException del servicio', async () => {
            const req = {
                user: {
                    userId: userId,
                    role: 'user'
                }
            };

            mockUsersService.updateUser.mockRejectedValue(
                new InternalServerErrorException('Error al actualizar el usuario')
            );

            await expect(
                controller.updateUser(userId, updateUserDto, req)
            ).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('deleteUser', () => {
        const userId = '123e4567-e89b-12d3-a456-426614174000';

        it('debería llamar al servicio deleteUser con el ID proporcionado', async () => {
            mockUsersService.deleteUser.mockResolvedValue(undefined);

            await controller.deleteUser(userId);

            expect(mockUsersService.deleteUser).toHaveBeenCalledWith(userId);
            expect(mockUsersService.deleteUser).toHaveBeenCalledTimes(1);
        });

        it('debería propagar el NotFoundException del servicio', async () => {
            mockUsersService.deleteUser.mockRejectedValue(new NotFoundException('Usuario no encontrado'));

            await expect(controller.deleteUser(userId)).rejects.toThrow(NotFoundException);
        });

        it('debería retornar void si la eliminación es exitosa', async () => {
            mockUsersService.deleteUser.mockResolvedValue(undefined);

            const result = await controller.deleteUser(userId);

            expect(result).toBeUndefined();
        });
    });
});