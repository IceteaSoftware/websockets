import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import config from 'config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthGuard } from './guards/auth/auth.guard'
import { AuthModule } from './modules/auth/auth.module'
import { LoggerModule } from './modules/logger/logger.module'
import redisConfig from './config/redis.config'
import { CacheModule } from './modules/cache/cache.module'
import { UserModule } from './modules/user/user.module'
import { DatabaseModule } from '@app/database/database.module'
import { ChatModule } from './modules/chat/chat.module'

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
