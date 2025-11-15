import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { join } from 'path'
import * as express from 'express'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  const config = new DocumentBuilder()
    .setTitle('Car Connect API')
    .setDescription('API do Software Web para Garagistas')
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT-auth',
    )
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('docs', app, document)

  app.use(
    '/uploads',
    express.static(join(process.cwd(), process.env.UPLOAD_DIR || 'uploads')),
  )

  app.enableCors({ origin: ['http://127.0.0.1:3010'], credentials: true })

  await app.listen(process.env.PORT ?? 4000, '0.0.0.0')
}
bootstrap()
