import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { validationSchema } from './config/app.config';

@Module({
  imports: [
    // 👇 ConfigModule en premier
    ConfigModule.forRoot({
      isGlobal: true,        // disponible partout sans réimporter
      validationSchema,      // validation des variables d'env
      envFilePath: '.env',   // chemin du fichier .env
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}