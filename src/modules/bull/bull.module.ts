import { BullModule } from '@nestjs/bullmq'
import { Module } from '@nestjs/common'
import { LoggerModule } from '../logger/logger.module'

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.BULL_REDIS_HOST || '127.0.0.1',
        port: Number(process.env.BULL_REDIS_PORT) || 6379,
        slotsRefreshTimeout: 3000,
      },
    }),
    LoggerModule,
  ],
  providers: [],
})
export class BullQueueModule {}
