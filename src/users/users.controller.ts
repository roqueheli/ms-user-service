// src/users/users.controller.ts
import { Body, Controller, Delete, ForbiddenException, Get, HttpCode, HttpStatus, NotFoundException, Param, Patch, Post, Put, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../auth/auth.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('api/users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly authService: AuthService,
    ) { }

    @Post('register')
    @ApiOperation({
        summary: 'Registrar un nuevo usuario',
        description: 'Crea una nueva cuenta de usuario y devuelve un token JWT'
    })
    @ApiBody({ type: CreateUserDto })
    @ApiResponse({
        status: 201,
        description: 'Usuario creado exitosamente.',
        schema: {
            properties: {
                access_token: {
                    type: 'string',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Datos inválidos.' })
    async register(@Body() createUserDto: CreateUserDto) {
        const user = await this.usersService.createLocalUser(createUserDto);
        return this.authService.login(user);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Iniciar sesión',
        description: 'Autentica al usuario y devuelve un token JWT'
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: {
                    type: 'string',
                    example: 'test@example.com'
                },
                password: {
                    type: 'string',
                    example: 'password123'
                }
            },
            required: ['email', 'password']
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Login exitoso',
        schema: {
            properties: {
                access_token: {
                    type: 'string',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
    async login(@Body() loginDto: { email: string; password: string }) {
        const user = await this.authService.validateUser(
            loginDto.email,
            loginDto.password,
        );
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.authService.login(user);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Obtener perfil del usuario actual',
        description: 'Devuelve los datos del perfil del usuario autenticado'
    })
    @ApiResponse({ status: 200, description: 'Perfil encontrado', type: User })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    getProfile(@CurrentUser() user: any) {
        return this.usersService.findOne(user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':user_id')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Obtener un usuario por ID',
        description: 'Devuelve los datos de un usuario específico por su ID'
    })
    @ApiParam({
        name: 'user_id',
        description: 'ID del usuario',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiResponse({ status: 200, description: 'Usuario encontrado', type: User })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    findOne(@Param('user_id') user_id: string) {
        return this.usersService.findOne(user_id);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':user_id/profile')
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Actualizar perfil de usuario',
        description: 'Actualiza los datos del perfil de un usuario específico'
    })
    @ApiParam({
        name: 'user_id',
        description: 'ID del usuario',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiBody({ type: UpdateProfileDto })
    @ApiResponse({ status: 200, description: 'Perfil actualizado exitosamente', type: User })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 403, description: 'Prohibido - Solo puedes actualizar tu propio perfil' })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    updateProfile(
        @Param('user_id') user_id: string,
        @Body() updateProfileDto: UpdateProfileDto,
        @CurrentUser() user: any,
    ) {
        // Verificar que el usuario solo pueda actualizar su propio perfil
        if (user.userId !== user_id) {
            throw new UnauthorizedException('You can only update your own profile');
        }
        return this.usersService.updateProfile(user_id, updateProfileDto);
    }

    @Get('profile/:user_id')
    @ApiOperation({
        summary: 'Obtener perfil de usuario por ID',
        description: 'Retorna el perfil completo de un usuario específico basado en su ID'
    })
    @ApiParam({
        name: 'user_id',
        required: true,
        description: 'ID único del usuario',
        schema: { type: 'string' },
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiResponse({
        status: 200,
        description: 'Perfil del usuario encontrado exitosamente',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
                firstName: { type: 'string', example: 'Juan' },
                lastName: { type: 'string', example: 'Pérez' },
                phone: { type: 'string', example: '123456789' },
                user: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        email: { type: 'string' }
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 404, description: 'Perfil de usuario no encontrado' })
    async getUserProfile(@Param('user_id') userId: string) {
        const profile = await this.usersService.findUserWithProfile(userId);
        if (!profile) {
            throw new NotFoundException('Perfil de usuario no encontrado');
        }
        return profile;
    }

    @Delete(':user_id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Eliminar usuario y su perfil',
        description: 'Elimina un usuario y su perfil asociado de la base de datos'
    })
    @ApiParam({
        name: 'user_id',
        required: true,
        description: 'ID del usuario a eliminar',
        schema: { type: 'string', format: 'uuid' }
    })
    @ApiResponse({
        status: 204,
        description: 'Usuario y perfil eliminados exitosamente'
    })
    @ApiResponse({
        status: 404,
        description: 'Usuario no encontrado'
    })
    @ApiResponse({
        status: 403,
        description: 'No tiene permisos para eliminar este usuario'
    })
    async deleteUser(@Param('user_id') userId: string): Promise<void> {
        await this.usersService.deleteUser(userId);
    }

    @Patch(':user_id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Actualizar usuario',
        description: 'Actualiza la información de un usuario existente'
    })
    @ApiParam({
        name: 'user_id',
        required: true,
        description: 'ID del usuario a actualizar',
        schema: { type: 'string', format: 'uuid' }
    })
    @ApiBody({ type: UpdateUserDto })
    @ApiResponse({
        status: 200,
        description: 'Usuario actualizado exitosamente',
        type: User
    })
    @ApiResponse({
        status: 404,
        description: 'Usuario no encontrado'
    })
    @ApiResponse({
        status: 409,
        description: 'El email ya está en uso'
    })
    @ApiResponse({
        status: 403,
        description: 'No tiene permisos para actualizar este usuario'
    })
    async updateUser(
        @Param('user_id') userId: string,
        @Body() updateUserDto: UpdateUserDto,
        @Req() req
    ): Promise<User> {
        // Verificar si el usuario autenticado tiene permiso para actualizar
        const authenticatedUserId = req.user.userId;

        // Solo permite que un usuario se actualice a sí mismo o que un admin actualice cualquier usuario
        if (authenticatedUserId !== userId && req.user.role !== 'admin') {
            throw new ForbiddenException('No tiene permisos para actualizar este usuario');
        }

        return this.usersService.updateUser(userId, updateUserDto);
    }
}