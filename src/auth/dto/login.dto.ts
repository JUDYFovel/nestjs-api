import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'john@gmail.com',
    description: 'Email de l\'utilisateur',
  })
  @IsNotEmpty()
  @IsEmail({}, { message: 'Email invalide' })
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'Mot de passe',
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}