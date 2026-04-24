import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validation globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Exception Filter global
  app.useGlobalFilters(new HttpExceptionFilter());

  // 👇 Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('Mon API NestJS') // titre
    .setDescription('Documentation complète de l\'API') // description
    .setVersion('1.0') // version
    .addBearerAuth( // 👈 support JWT
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Entrer le token JWT',
        in: 'header',
      },
      'access-token', // 👈 nom de la sécurité
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // 👇 Route de la documentation
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // 👈 garder le token entre les requêtes
    },
  });

  // Port
  const configService = app.get(ConfigService);
   const port = configService.get<number>('PORT') || 3000;

  await app.listen(port);
  console.log(`🚀 App lancée sur : http://localhost:${port}`);
  console.log(`📄 Swagger sur : http://localhost:${port}/api/docs`);
}
bootstrap();