import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEmail, IsOptional, IsPhoneNumber, IsString, Length } from 'class-validator';

export class UpdateUserDto {
    @ApiProperty({
        example: 'usuario@ejemplo.com',
        description: 'Correo electrónico del usuario',
        required: false
    })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiProperty({
        example: 'Juan',
        description: 'Nombre del usuario',
        required: false
    })
    @IsOptional()
    @IsString()
    @Length(2, 100)
    first_name?: string;

    @ApiProperty({
        example: 'Pérez',
        description: 'Apellido del usuario',
        required: false
    })
    @IsOptional()
    @IsString()
    @Length(2, 100)
    last_name?: string;

    @ApiProperty({
        example: '+1234567890',
        description: 'Número de teléfono del usuario',
        required: false
    })
    @IsOptional()
    @IsPhoneNumber()
    phone?: string;

    @ApiProperty({
        example: '1990-01-01',
        description: 'Fecha de nacimiento del usuario',
        required: false
    })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    birth_date?: Date;
}