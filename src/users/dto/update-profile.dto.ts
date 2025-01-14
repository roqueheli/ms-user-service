import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateProfileDto {
    @ApiPropertyOptional({
        example: 'Desarrollador Full Stack con 5 años de experiencia en tecnologías web.',
        description: 'Resumen profesional del usuario. Opcional.',
    })
    @IsString()
    @IsOptional()
    professional_summary?: string;

    @ApiPropertyOptional({
        example: 'https://mi-cv.com/cv.pdf',
        description: 'URL del currículum vitae del usuario. Opcional.',
    })
    @IsUrl()
    @IsOptional()
    cv_url?: string;

    @ApiPropertyOptional({
        example: 'https://www.linkedin.com/in/mi-perfil',
        description: 'URL del perfil de LinkedIn del usuario. Opcional.',
    })
    @IsUrl()
    @IsOptional()
    linkedin_url?: string;

    @ApiPropertyOptional({
        example: 'https://github.com/mi-usuario',
        description: 'URL del perfil de GitHub del usuario. Opcional.',
    })
    @IsUrl()
    @IsOptional()
    github_url?: string;

    @ApiPropertyOptional({
        example: 'https://mi-portfolio.com',
        description: 'URL del portafolio del usuario. Opcional.',
    })
    @IsUrl()
    @IsOptional()
    portfolio_url?: string;
}