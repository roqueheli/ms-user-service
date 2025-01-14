import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { SocialUserDto } from './dto/social-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Profile } from './entities/profile.entity';
import { User, UserAuthType } from './entities/user.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        @InjectRepository(Profile)
        private readonly profilesRepository: Repository<Profile>,
    ) { }

    async createLocalUser(createUserDto: CreateUserDto): Promise<User> {
        if (!createUserDto.password) {
            throw new BadRequestException('Password is required for local registration');
        }

        const user = this.usersRepository.create({
            ...createUserDto,
            password_hash: await bcrypt.hash(createUserDto.password, 10),
            auth_type: UserAuthType.LOCAL,
        });

        const savedUser = await this.usersRepository.save(user);
        await this.createProfile(savedUser.user_id);
        return savedUser;
    }

    // async createSocialUsers(socialUserDto: SocialUserDto): Promise<User> {
    //     // Verificar si el usuario ya existe
    //     let user = await this.findByEmail(socialUserDto.email);

    //     if (user) {
    //         // Si el usuario existe y usa el mismo método de auth, retornarlo
    //         if (user.auth_type === socialUserDto.auth_type) {
    //             return user;
    //         }
    //         // Si usa diferente método, actualizar sus datos
    //         user = await this.usersRepository.save({
    //             ...user,
    //             ...socialUserDto,
    //         });
    //         return user;
    //     }

    //     // Crear nuevo usuario
    //     user = this.usersRepository.create({
    //         ...socialUserDto,
    //         password_hash: null,
    //     });

    //     const savedUser = await this.usersRepository.save(user);
    //     await this.createProfile(savedUser.user_id);
    //     return savedUser;
    // }

    private async createProfile(userId: string): Promise<void> {
        const profile = this.profilesRepository.create({
            user_id: userId,
        });
        await this.profilesRepository.save(profile);
    }

    async findOne(user_id: string): Promise<User> {
        const user = await this.usersRepository.findOne({
            where: { user_id },
            relations: ['profile'],
        });
        if (!user) {
            throw new NotFoundException(`User with ID ${user_id} not found`);
        }
        return user;
    }

    async findByEmail(email: string): Promise<User> {
        return this.usersRepository.findOne({
            where: { email },
            relations: ['profile'],
        });
    }

    async updateProfile(user_id: string, updateProfileDto: UpdateProfileDto): Promise<Profile> {
        const profile = await this.profilesRepository.findOne({
            where: { user_id },
        });

        if (!profile) {
            throw new NotFoundException(`Profile for user ${user_id} not found`);
        }

        Object.assign(profile, updateProfileDto);
        return this.profilesRepository.save(profile);
    }

    async findUserWithProfile(userId: string): Promise<Profile> {
        return this.profilesRepository.findOne({
            where: { user_id: userId },
            relations: ['user'],
            select: {
                profile_id: true,
                user_id: true,
                professional_summary: true,
                cv_url: true,
                linkedin_url: true,
                github_url: true,
                portfolio_url: true,
                created_at: true,
                updated_at: true,
                user: {
                    user_id: true,
                    email: true,
                    first_name: true,
                    last_name: true,
                    phone: true,
                    birth_date: true,
                    auth_type: true
                }
            }
        });
    }

    async deleteUser(userId: string): Promise<void> {
        const user = await this.usersRepository.findOne({
            where: { user_id: userId },
            relations: ['profile'] // Asegúrate de cargar el perfil relacionado
        });

        if (!user) {
            throw new NotFoundException(`Usuario con ID: ${userId} no encontrado`);
        }

        // Eliminar el perfil asociado
        if (user.profile) {
            await this.profilesRepository.remove(user.profile);
        }

        // Eliminar el usuario
        await this.usersRepository.remove(user);
    }

    async updateUser(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.usersRepository.findOne({
            where: { user_id: userId }
        });

        if (!user) {
            throw new NotFoundException(`Usuario con ID: ${userId} no encontrado`);
        }

        // Si se está actualizando el email, verificar que no exista
        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const existingUser = await this.usersRepository.findOne({
                where: { email: updateUserDto.email }
            });

            if (existingUser) {
                throw new ConflictException(`El email ${updateUserDto.email} ya está en uso`);
            }
        }

        // Actualizar solo los campos proporcionados
        Object.assign(user, updateUserDto);

        try {
            const updatedUser = await this.usersRepository.save(user);
            // Excluir password_hash de la respuesta
            delete updatedUser.password_hash;
            return updatedUser;
        } catch (error) {
            throw new InternalServerErrorException('Error al actualizar el usuario');
        }
    }

    async createSocialUser(socialUserDto: SocialUserDto): Promise<User> {
        try {
            // Buscar si el usuario ya existe
            const existingUser = await this.usersRepository.findOne({
                where: { email: socialUserDto.email }
            });

            // Si el usuario existe, verificar que use autenticación social
            if (existingUser) {
                if (existingUser.auth_type !== socialUserDto.auth_type) {
                    throw new ConflictException(
                        `El email ${socialUserDto.email} ya está registrado con otro método de autenticación`
                    );
                }
                // Si el usuario existe y usa el mismo método de autenticación, actualizamos sus datos
                Object.assign(existingUser, socialUserDto);
                const updatedUser = await this.usersRepository.save(existingUser);
                delete updatedUser.password_hash;
                return updatedUser;
            }

            // Si el usuario no existe, lo creamos
            const user = this.usersRepository.create({
                ...socialUserDto,
                password_hash: null,
            });

            const savedUser = await this.usersRepository.save(user);
            await this.createProfile(savedUser.user_id);
            // delete savedUser.password_hash;
            return savedUser;
        } catch (error) {
            if (error instanceof ConflictException) {
                throw error;
            }
            throw new InternalServerErrorException(
                'Error al crear/actualizar el usuario social'
            );
        }
    }
}