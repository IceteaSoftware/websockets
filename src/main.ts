import { NestFactory, Reflector } from '@nestjs/core'
import './loadenv'
import { AppModule } from './app.module'
import {
  ClassSerializerInterceptor,
  ValidationPipe as NestValidationPipe,
} from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { HttpExceptionFilter } from './exceptions/http-exception.filter'
import { ValidationException } from './exceptions/validation.exception'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.setGlobalPrefix('api/v1')
  app.useGlobalPipes(
    new NestValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      exceptionFactory: (errors) => {
        let messages: string[]
        if (errors[0].children?.length > 0) {
          messages = errors
            .map((error) =>
              error.children[0].children
                .map((child) => {
                  return Object.values(child.constraints)
                })
                .flat(),
            )
            .flat()
        } else {
          messages = errors
            .map((error) => Object.values(error.constraints))
            .flat()
        }

        return new ValidationException(messages)
      },
    }),
  )

  // app.enableCors({
  //   origin: true,
  //   allowedHeaders: ['Authorization', 'Content-Type'],
  //   credentials: true,
  //   methods: ['*'],
  // })

  app.enableCors({
    origin: '*',
    allowedHeaders: '*',
    credentials: false,
    methods: '*',
  })

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))

  const config = new DocumentBuilder()
    .setTitle('Fantasy Football Api Documentation')
    .setDescription(
      'This is the API documentation for the fantasy-football game',
    )
    .setVersion('1.0')
    .addTag('Auth')
    .addBearerAuth()
    .build()
  const documentFactory = () => SwaggerModule.createDocument(app, config)

  SwaggerModule.setup('docs', app, documentFactory)
  app.useGlobalFilters(new HttpExceptionFilter())

  await app.listen(process.env.APP_PORT ?? 3333)
}
bootstrap()
