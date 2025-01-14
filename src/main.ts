import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('API de Entrevistas Técnicas')
    .setDescription('Documentación de la API para la webapp de entrevistas técnicas')
    .setVersion('1.0')
    .addBearerAuth() // Agrega soporte para autenticación con JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  app.useGlobalInterceptors(new TransformInterceptor());

  // Habilitar CORS
  app.enableCors({
    origin: '*', // Permitir todas las solicitudes (puedes restringirlo a dominios específicos)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true, // Si necesitas enviar cookies o encabezados de autenticación
  });

  await app.listen(3000);
}
bootstrap();