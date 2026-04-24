import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Récupérer les rôles requis
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
      ROLES_KEY,
      [
        context.getHandler(),
        context.getClass(),
      ],
    );

    // 2. Si pas de rôles requis = route accessible
    if (!requiredRoles) {
      return true;
    }

    // 3. Récupérer le user depuis la requête
    const { user } = context.switchToHttp().getRequest();

    // 4. Vérifier si user a le bon rôle
    const hasRole = requiredRoles.some(role => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException(
        'Vous n\'avez pas les droits nécessaires',
      );
    }

    return true;
  }
}