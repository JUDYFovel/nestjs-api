import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh', // 👈 nom unique
) {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey:
        configService.get<string>('JWT_REFRESH_SECRET') ||
        'refreshDefaultSecret',
      passReqToCallback: true,
    } as any);
  }

  async validate(req: Request, payload: { sub: number; email: string }) {
    // 1. Récupérer le refresh token brut du header
    const authHeader = req.get('Authorization');
    const refreshToken = authHeader?.replace('Bearer ', '').trim();

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token manquant');
    }

    // 2. Récupérer le user
    const user = await this.prisma.client.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Accès refusé');
    }

    // 3. Comparer le refresh token hashé en base
    const refreshTokenValid = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    if (!refreshTokenValid) {
      throw new UnauthorizedException('Refresh token invalide');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }
}
