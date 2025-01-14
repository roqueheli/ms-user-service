// src/users/users.service.spec.ts
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { Profile } from './entities/profile.entity';
import { User, UserAuthType } from './entities/user.entity';
import { UsersService } from './users.service';

// Mock del repositorio
const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
};

const mockProfileRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
};

describe('UsersService', () => {
    let service: UsersService;
    let userRepository: Repository<User>;
    let profileRepository: Repository<Profile>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUserRepository,
                },
                {
                    provide: getRepositoryToken(Profile),
                    useValue: mockProfileRepository,
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));
        profileRepository = module.get<Repository<Profile>>(getRepositoryToken(Profile));
    });

    it('debería estar definido', () => {
        expect(service).toBeDefined();
    });

    describe('createLocalUser', () => {
        it('debería crear un usuario local', async () => {
            const createUserDto: CreateUserDto = {
                email: 'test@example.com',
                password: 'password123',
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

            // Mock de las funciones del repositorio
            mockUserRepository.create.mockReturnValue(mockUser);
            mockUserRepository.save.mockResolvedValue(mockUser);

            const result = await service.createLocalUser(createUserDto);

            expect(mockUserRepository.create).toHaveBeenCalled();
            expect(mockUserRepository.save).toHaveBeenCalled();
            expect(result).toEqual(mockUser);
        });

        it('debería lanzar error si no se proporciona password', async () => {
            const createUserDto = {
                email: 'test@example.com',
                first_name: 'John',
                last_name: 'Doe',
            };

            await expect(service.createLocalUser(createUserDto as CreateUserDto))
                .rejects
                .toThrow('Password is required for local registration');
        });
    });

    describe('findOne', () => {
        it('debería encontrar un usuario por ID', async () => {
            const userId = '123';
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

            mockUserRepository.findOne.mockResolvedValue(mockUser);

            const result = await service.findOne(userId);

            expect(result).toEqual(mockUser);
            expect(mockUserRepository.findOne).toHaveBeenCalledWith({
                where: { user_id: userId },
                relations: ['profile'],
            });
        });

        it('debería lanzar un error si el usuario no existe', async () => {
            const userId = '123';

            mockUserRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne(userId))
                .rejects
                .toThrow(`User with ID ${userId} not found`);
        });
    });

    describe('updateUser', () => {
        it('debería actualizar un usuario existente', async () => {
            const mockUser = {
                user_id: 'user-id',
                email: 'test@example.com',
                first_name: 'Old Name',
            };
            const updateUserDto = { first_name: 'New Name' };

            mockUserRepository.findOne.mockResolvedValue(mockUser);
            mockUserRepository.save.mockResolvedValue({ ...mockUser, ...updateUserDto });

            const result = await service.updateUser('user-id', updateUserDto);
            expect(result).toEqual({ ...mockUser, ...updateUserDto });
            expect(mockUserRepository.save).toHaveBeenCalledWith({ ...mockUser, ...updateUserDto });
        });

        it('debería lanzar NotFoundException si el usuario no existe', async () => {
            mockUserRepository.findOne.mockResolvedValue(null);

            await expect(service.updateUser('user-id', {})).rejects.toThrow(NotFoundException);
        });

        it('debería lanzar ConflictException si el email ya está en uso', async () => {
            const mockUser = { user_id: 'user-id', email: 'test@example.com' };
            const updateUserDto = { email: 'new@example.com' };

            mockUserRepository.findOne
                .mockResolvedValueOnce(mockUser) // Usuario actual
                .mockResolvedValueOnce({ user_id: 'other-user-id', email: 'new@example.com' }); // Otro usuario con el mismo email

            await expect(service.updateUser('user-id', updateUserDto)).rejects.toThrow(ConflictException);
        });
    });

    describe('deleteUser', () => {
        it('debería eliminar un usuario existente', async () => {
            const mockUser = { user_id: 'user-id' };

            mockUserRepository.findOne.mockResolvedValue(mockUser);
            mockUserRepository.remove.mockResolvedValue(mockUser);

            await service.deleteUser('user-id');
            expect(mockUserRepository.remove).toHaveBeenCalledWith(mockUser);
        });

        it('debería lanzar NotFoundException si el usuario no existe', async () => {
            mockUserRepository.findOne.mockResolvedValue(null);

            await expect(service.deleteUser('user-id')).rejects.toThrow(NotFoundException);
        });
    });

    // Limpieza después de cada prueba
    afterEach(() => {
        jest.clearAllMocks();
    });
});