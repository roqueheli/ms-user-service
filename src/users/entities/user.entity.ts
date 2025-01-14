import { ApiProperty } from '@nestjs/swagger';
import {
    Column,
    CreateDateColumn,
    Entity,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import { Profile } from './profile.entity';

export enum UserAuthType {
    LOCAL = 'local',
    GOOGLE = 'google',
    GITHUB = 'github'
}

@Entity('users')
export class User {
    @ApiProperty({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'ID único del usuario'
    })
    @PrimaryGeneratedColumn('uuid')
    user_id: string;

    @ApiProperty({
        example: 'test@example.com',
        description: 'Correo electrónico del usuario'
    })
    @Column({ unique: true })
    email: string;

    @Column({ name: 'password_hash', nullable: true })
    password_hash?: string;

    @ApiProperty({
        example: 'Juan',
        description: 'Nombre del usuario'
    })
    @Column({ name: 'first_name' })
    first_name: string;

    @ApiProperty({
        example: 'Pérez',
        description: 'Apellido del usuario'
    })
    @Column({ name: 'last_name' })
    last_name: string;

    @ApiProperty({
        example: '+1234567890',
        description: 'Número de teléfono del usuario'
    })
    @Column({ nullable: true })
    phone?: string;

    @ApiProperty({
        example: '1990-01-01',
        description: 'Fecha de nacimiento del usuario'
    })
    @Column({ type: 'date', nullable: true })
    birth_date?: Date;

    @ApiProperty({
        enum: UserAuthType,
        example: UserAuthType.LOCAL,
        description: 'Tipo de autenticación del usuario'
    })
    @Column({
        type: 'enum',
        enum: UserAuthType,
        name: 'auth_type'
    })
    auth_type: UserAuthType;

    @ApiProperty({
        description: 'Fecha de creación del usuario'
    })
    @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
    created_at: Date;

    @ApiProperty({
        description: 'Fecha de última actualización del usuario'
    })
    @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
    updated_at: Date;

    @OneToOne(() => Profile, profile => profile.user)
    profile: Profile;
}