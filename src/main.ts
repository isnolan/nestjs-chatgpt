import { NestFactory } from '@nestjs/core';
// import { ValidationPipe } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // logger
  const nestWinston = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(nestWinston);
  // app.useGlobalPipes(new ValidationPipe());

  // listen
  // await app.startAllMicroservices();
  await app.listen(process.env.NODE_PORT);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
