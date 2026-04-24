import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  IsNotEmpty,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Nom complet de l\'utilisateur',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'john@gmail.com',
    description: 'Email de l\'utilisateur',
  })
  @IsNotEmpty()
  @IsEmail({}, { message: 'Email invalide' })
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'Mot de passe (minimum 6 caractères)',
    minimum: 6,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'Minimum 6 caractères' })
  password: string;
}