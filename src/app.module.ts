import { DatabaseModule } from '@app/database/database.module'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import config from 'config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import redisConfig from './config/redis.config'
import { AuthModule } from './modules/auth/auth.module'
import { CacheModule } from './modules/cache/cache.module'
import { ChatModule } from './modules/chat/chat.module'
import { FileModule } from './modules/file/file.module'
import { LoggerModule } from './modules/logger/logger.module'
import { UserModule } from './modules/user/user.module'
import { ArticleModule } from './modules/article/article.module'
import { APP_GUARD } from '@nestjs/core'
import { AuthGuard } from './guards/auth/auth.guard'
import { CaslModule } from './modules/casl/casl.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => config.util.toObject(), redisConfig],
    }),
    CacheModule,
    AuthModule,
    LoggerModule,
    UserModule,
    DatabaseModule,
    ChatModule,
    FileModule,
    ArticleModule,
    CaslModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
