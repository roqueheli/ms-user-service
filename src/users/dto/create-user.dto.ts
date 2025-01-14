import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UserAuthType } from '../entities/user.entity';

export class CreateUserDto {
    @ApiProperty({
        example: 'test@example.com',
        description: 'Correo electrónico del usuario. Debe ser único.',
    })
    @IsEmail()
    email: string;

    @ApiPropertyOptional({
        example: 'password123',
        description: 'Contraseña del usuario. Requerida solo para autenticación local.',
    })
    @IsString()
    @MinLength(6)
    @IsOptional() // Marcamos como opcional para auth social
    password?: string | null; // Permitimos null

    @ApiProperty({
        example: 'John',
        description: 'Nombre del usuario.',
    })
    @IsString()
    @IsNotEmpty()
    first_name: string;

    @ApiProperty({
        example: 'Doe',
        description: 'Apellido del usuario.',
    })
    @IsString()
    @IsNotEmpty()
    last_name: string;

    @ApiPropertyOptional({
        example: '+1234567890',
        description: 'Número de teléfono del usuario. Opcional.',
    })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiPropertyOptional({
        example: '1990-01-01',
        description: 'Fecha de nacimiento del usuario. Opcional.',
        type: 'string',
        format: 'date',
    })
    @IsOptional()
    birth_date?: Date;

    @ApiPropertyOptional({
        example: UserAuthType.LOCAL,
        description: 'Tipo de autenticación del usuario. Puede ser LOCAL o SOCIAL.',
        enum: UserAuthType,
    })
    @IsEnum(UserAuthType)
    @IsOptional()
    auth_type?: UserAuthType;
}