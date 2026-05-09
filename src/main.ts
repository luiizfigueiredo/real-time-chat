import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { envValues } from './shared/env-values';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const corsOrigin = envValues.CORS_ORIGIN?.split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  app.enableCors({
    origin: corsOrigin?.length ? corsOrigin : false,
    credentials: true,
  });

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.listen(envValues.PORT);
}
bootstrap();
