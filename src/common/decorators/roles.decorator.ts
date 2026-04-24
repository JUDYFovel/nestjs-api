import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

// 👇 clé pour accéder aux metadata
export const ROLES_KEY = 'roles';

// 👇 décorateur custom
export const Roles = (...roles: Role[]) =>
  SetMetadata(ROLES_KEY, roles);