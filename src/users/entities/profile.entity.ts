import { ApiProperty } from '@nestjs/swagger';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import { User } from './user.entity';

@Entity('profiles')
export class Profile {
    @ApiProperty({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'ID único del perfil'
    })
    @PrimaryGeneratedColumn('uuid')
    profile_id: string;

    @ApiProperty({
        example: '987fcdeb-a654-12d3-b456-426614174000',
        description: 'ID del usuario asociado al perfil'
    })
    @Column()
    user_id: string;

    @ApiProperty({
        example: 'Desarrollador Full Stack con 5 años de experiencia...',
        description: 'Resumen profesional del usuario',
        nullable: true
    })
    @Column({ type: 'text', nullable: true })
    professional_summary?: string;

    @ApiProperty({
        example: 'https://storage.cloud.com/cv.pdf',
        description: 'URL del CV del usuario',
        nullable: true
    })
    @Column({ nullable: true })
    cv_url?: string;

    @ApiProperty({
        example: 'https://linkedin.com/in/usuario',
        description: 'URL del perfil de LinkedIn',
        nullable: true
    })
    @Column({ nullable: true })
    linkedin_url?: string;

    @ApiProperty({
        example: 'https://github.com/usuario',
        description: 'URL del perfil de GitHub',
        nullable: true
    })
    @Column({ nullable: true })
    github_url?: string;

    @ApiProperty({
        example: 'https://portfolio.com/usuario',
        description: 'URL del portafolio personal',
        nullable: true
    })
    @Column({ nullable: true })
    portfolio_url?: string;

    @ApiProperty({
        description: 'Fecha de creación del perfil'
    })
    @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
    created_at: Date;

    @ApiProperty({
        description: 'Fecha de última actualización del perfil'
    })
    @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
    updated_at: Date;

    @ApiProperty({
        description: 'Usuario asociado al perfil',
        type: () => User
    })
    @OneToOne(() => User, user => user.profile, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
}