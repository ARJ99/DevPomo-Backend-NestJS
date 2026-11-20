import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Main');

  try {
    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    app.enableCors({
      origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
      methods: ['GET', 'POST', 'PATCH', 'DELETE']
    }); 

    const port = process.env.PORT ?? 3002;
    await app.listen(port);
    logger.log(`The app is running on: ${port}`);
  } catch (error) {
    const err = error as Error;
    logger.error(`Failed to start the application: ${err.message}`, err.stack);
    process.exit(1); // let Docker/nodemon/CI detect the failure
  }
}
void bootstrap();
