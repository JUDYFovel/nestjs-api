import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // Créer un user
  async create(createUserDto: CreateUserDto) {
    const emailExists = await this.prisma.client.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (emailExists) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    return await this.prisma.client.user.create({
      data: createUserDto,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  // Récupérer tous les users (ADMIN)
  async findAll() {
    const users = await this.prisma.client.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (users.length === 0) {
      throw new NotFoundException('Aucun utilisateur trouvé');
    }

    return users;
  }

  // Récupérer un user
  async findOne(
    id: number,
    currentUser: { id: number; role: string },
  ) {
    // USER ne peut voir que son profil
    if (
      currentUser.role === Role.USER &&
      currentUser.id !== id
    ) {
      throw new ForbiddenException(
        'Vous ne pouvez voir que votre propre profil',
      );
    }

    const user = await this.prisma.client.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }

    return user;
  }

  // Modifier un user
  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    currentUser: { id: number; role: string },
  ) {
    // USER ne peut modifier que son propre profil
    if (
      currentUser.role === Role.USER &&
      currentUser.id !== id
    ) {
      throw new ForbiddenException(
        'Vous ne pouvez modifier que votre propre profil',
      );
    }

    // Vérifier si user existe
    await this.findOne(id, currentUser);

    // Vérifier si nouvel email déjà utilisé
    if (updateUserDto.email) {
      const emailExists = await this.prisma.client.user.findFirst({
        where: {
          email: updateUserDto.email,
          NOT: { id },
        },
      });

      if (emailExists) {
        throw new ConflictException('Cet email est déjà utilisé');
      }
    }

    return await this.prisma.client.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });
  }

  // Supprimer un user (ADMIN)
  async remove(id: number) {
    const user = await this.prisma.client.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }

    await this.prisma.client.user.delete({
      where: { id },
    });

    return { message: `User #${id} supprimé avec succès` };
  }
}