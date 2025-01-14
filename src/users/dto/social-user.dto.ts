import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { UserAuthType } from '../entities/user.entity';

export class SocialUserDto {
    @ApiProperty({
        example: 'usuario@gmail.com',
        description: 'Correo electrónico del usuario proveniente de autenticación social',
        format: 'email'
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: 'John',
        description: 'Nombre del usuario obtenido del proveedor de autenticación social'
    })
    @IsString()
    @IsNotEmpty()
    first_name: string;

    @ApiProperty({
        example: 'Doe',
        description: 'Apellido del usuario obtenido del proveedor de autenticación social'
    })
    @IsString()
    @IsNotEmpty()
    last_name: string;

    @ApiProperty({
        example: 'GOOGLE',
        description: 'Tipo de autenticación social utilizada',
        enum: UserAuthType,
        enumName: 'UserAuthType'
    })
    @IsEnum(UserAuthType)
    auth_type: UserAuthType;
}