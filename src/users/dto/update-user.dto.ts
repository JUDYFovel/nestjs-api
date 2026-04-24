import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'John Updated',
    description: 'Nouveau nom',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'john.updated@gmail.com',
    description: 'Nouvel email',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email invalide' })
  email?: string;

  @ApiPropertyOptional({
    example: 'newpassword123',
    description: 'Nouveau mot de passe',
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}