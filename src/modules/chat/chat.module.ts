import { Module } from '@nestjs/common'
import { ChatGateway } from './chat.gateway'
import { RoomService } from './services/room.service'
import { ConnectedUserService } from './services/connected-user.service'
import { MessageService } from './services/message.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Room } from './entities/room.entity'
import { ConnectedUser } from './entities/connected-user.entity'
import { Message } from './entities/message.entity'
import { RoomParticipantsUser } from './entities/room-participants-user'
import { UserModule } from '../user/user.module'

@Module({
  providers: [ChatGateway, RoomService, ConnectedUserService, MessageService],
  imports: [
    TypeOrmModule.forFeature([
      Room,
      ConnectedUser,
      Message,
      RoomParticipantsUser,
    ]),
    UserModule,
  ],
})
export class ChatModule {}
