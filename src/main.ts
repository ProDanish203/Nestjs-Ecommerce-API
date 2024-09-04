import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: '*',
    credentials: true,
    allowedHeaders: '*',
  });
  await app.listen(8000);
}
bootstrap();
