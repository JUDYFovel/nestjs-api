import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { StringValue } from 'ms';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // 📌 REGISTER
  async register(registerDto: RegisterDto) {
    // 1. Vérifier si email existe déjà
    const emailExists = await this.prisma.client.user.findUnique({
      where: { email: registerDto.email },
    });

    if (emailExists) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    // 2. Hasher le password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // 3. Créer le user
    const user = await this.prisma.client.user.create({
      data: {
        name: registerDto.name,
        email: registerDto.email,
        password: hashedPassword,
      },
    });

    // 4. Générer les tokens
    const tokens = await this.generateTokens(user.id, user.email);

    // 5. Sauvegarder le refresh token hashé
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      message: 'Inscription réussie',
      ...tokens,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  // 📌 LOGIN
  async login(loginDto: LoginDto) {
    // 1. Vérifier si user existe
    const user = await this.prisma.client.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Email ou password incorrect');
    }

    // 2. Vérifier le password
    const passwordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!passwordValid) {
      throw new UnauthorizedException('Email ou password incorrect');
    }

    // 3. Générer les tokens
    const tokens = await this.generateTokens(user.id, user.email);

    // 4. Sauvegarder le refresh token hashé
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      message: 'Connexion réussie',
      ...tokens,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  // 📌 REFRESH TOKEN
  async refreshTokens(userId: number, email: string) {
    // 1. Générer nouveaux tokens
    const tokens = await this.generateTokens(userId, email);

    // 2. Sauvegarder nouveau refresh token (rotation)
    await this.saveRefreshToken(userId, tokens.refreshToken);

    return {
      message: 'Tokens renouvelés',
      ...tokens,
    };
  }

  // 📌 LOGOUT 👈 nouveau
  async logout(userId: number) {
    // Vérifier si user est connecté
    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
    });

    // Si pas de refresh token = déjà déconnecté
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Vous êtes déjà déconnecté');
    }

    // Supprimer le refresh token en base
    await this.prisma.client.user.update({
      where: { id: userId },
      data: { refreshToken: null }, // 👈 null = révoqué
    });

    return {
      message: 'Déconnexion réussie',
    };
  }

  // 📌 Sauvegarder refresh token hashé en base
  private async saveRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await this.prisma.client.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRefreshToken },
    });
  }

  // 📌 Générer Access Token + Refresh Token
  async generateTokens(userId: number, email: string) {
    const payload = { sub: userId, email };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(payload, {
      secret:
        this.configService.get<string>('JWT_REFRESH_SECRET') ||
        'refreshDefaultSecret',
      expiresIn: (this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ||
        '7d') as StringValue,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
