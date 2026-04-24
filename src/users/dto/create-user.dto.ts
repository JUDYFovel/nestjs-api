import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  IsNotEmpty,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Nom de l\'utilisateur',
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
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}