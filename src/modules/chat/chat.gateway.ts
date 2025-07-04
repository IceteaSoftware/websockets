import { WsExceptionFilter } from '@app/common/filters/ws-exception.filter'
import { JwtPayload } from '@app/common/interfaces/jwt-payload.interface'
import { Logger, UnauthorizedException, UseFilters } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { User } from '../user/entities/user.entity'
import { UserService } from '../user/user.service'
import { ConnectedUserService } from './services/connected-user.service'
import { MessageService } from './services/message.service'
import { RoomService } from './services/room.service'
import { WsCurrentUser } from '@app/common/decoratios/ws-current-user.decorator'
import { UserPayload } from '@app/types/user-payload.type'
import { WsValidationPipe } from '@app/common/pipes/ws-validation.pipe'
import { CreateRoomDto } from './dtos/room/create-room.dto'
import { RoomTypeEnum } from './enums/room-type.enum'
import { RoomFetchRequestDto } from './dtos/room/room-fetch-request.dto'
import { UpdateRoomDto } from './dtos/room/update-room.dto'
import { DeleteRoomDto } from './dtos/room/delete-room.dto'
import { CreateMessageDto } from './dtos/message/create-message.dto'
import { FilterMessageDto } from './dtos/message/filter-message.dto'
import { UpdateMessageDto } from './dtos/message/update-message.dto'
import { DeleteMessageDto } from './dtos/message/delete-message.dto'

@UseFilters(WsExceptionFilter)
@WebSocketGateway(4800, { cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server
  private readonly logger = new Logger(ChatGateway.name)

  constructor(
    private readonly jwtService: JwtService,
    private readonly roomService: RoomService,
    private readonly connectedUserService: ConnectedUserService,
    private readonly messageService: MessageService,
    private readonly userService: UserService,
  ) {}

  async onModuleInit(): Promise<void> {
    this.logger.log('ChatGateway initialized')
    await this.connectedUserService.deleteAll()
  }

  async handleConnection(socket: Socket): Promise<void> {
    try {
      const user = await this.authenticateSocket(socket)
      await this.initializeUserConnection(user, socket)
    } catch (error) {
      this.handleConnectionError(socket, error)
    }
  }

  async handleDisconnect(socket: Socket): Promise<void> {
    await this.connectedUserService.delete(socket.id)
    this.logger.log(`Client disconnected: ${socket.id}`)
  }

  @SubscribeMessage('createRoom')
  async onCreateRoom(
    @WsCurrentUser() currentUser: UserPayload,
    @MessageBody(new WsValidationPipe()) createRoomDto: CreateRoomDto,
  ): Promise<void> {
    try {
      this.validateRoomTypeAndParticipants(
        createRoomDto.type,
        createRoomDto.participants,
        currentUser.id,
      )

      const newRoom = await this.roomService.create(
        currentUser.id,
        createRoomDto,
      )

      const createdRoomWithDetails = await this.roomService.findOne(
        currentUser.id,
        newRoom.id,
      )

      await this.notifyRoomParticipants(
        createdRoomWithDetails.participants,
        'roomCreated',
        createdRoomWithDetails,
      )

      this.logger.log(
        `Room with ID ${newRoom.id} created and participants notified successfully.`,
      )
    } catch (error) {
      this.logger.error(`Failed to create room: ${error.message}`, error.stack)
      throw new WsException('Error occurred while creating the room.')
    }
  }

  @SubscribeMessage('getRoomDetails')
  async onFetchRoomDetails(
    @WsCurrentUser() currentUser: UserPayload,
    @MessageBody(new WsValidationPipe())
    roomFetchRequestDto: RoomFetchRequestDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const { id: userId } = currentUser

    const { roomId } = roomFetchRequestDto
    try {
      const room = await this.roomService.findOne(userId, roomId)
      client.emit('roomDetailsFetched', room)
      this.logger.log(
        `User ID ${userId} fetched details for Room ID ${room.id} successfully.`,
      )
    } catch (error) {
      this.logger.error(
        `Error fetching details for Room ID ${roomId} by User ID ${userId}: ${error.message}`,
        error.stack,
      )
      throw new WsException('Error occurred while fetching room details.')
    }
  }

  @SubscribeMessage('updateRoom')
  async onUpdateRoom(
    @WsCurrentUser() currentUser: UserPayload,
    @MessageBody(new WsValidationPipe())
    updateRoomDto: UpdateRoomDto,
  ): Promise<void> {
    try {
      const room = await this.roomService.findOne(
        currentUser.id,
        updateRoomDto.roomId,
      )

      if (room.type === RoomTypeEnum.DIRECT && updateRoomDto.participants) {
        throw new WsException(
          'Direct rooms cannot have their participants updated.',
        )
      }

      this.validateRoomTypeAndParticipants(
        room.type,
        updateRoomDto.participants,
        currentUser.id,
      )

      await this.roomService.update(
        currentUser.id,
        updateRoomDto.roomId,
        updateRoomDto,
      )

      const updatedRoom = await this.roomService.findOne(
        currentUser.id,
        updateRoomDto.roomId,
      )

      await this.notifyRoomParticipants(
        updatedRoom.participants,
        'roomUpdated',
        updatedRoom,
      )
      this.logger.log(
        `Room with ID ${updateRoomDto.roomId} updated and participants notified successfully.`,
      )
    } catch (error) {
      this.logger.error(
        `Error updating room with ID ${updateRoomDto.roomId}: ${error.message}`,
        error.stack,
      )
      throw new WsException('Error occurred while updating room details.')
    }
  }

  @SubscribeMessage('deleteRoom')
  async onDeleteRoom(
    @WsCurrentUser() currentUser: UserPayload,
    @MessageBody(new WsValidationPipe()) deleteRoomDto: DeleteRoomDto,
  ): Promise<void> {
    const { id: userId } = currentUser
    const { roomId } = deleteRoomDto

    try {
      const roomToDelete = await this.roomService.findOne(userId, roomId)

      this.verifyUserAuthorization(roomToDelete.participants, userId)

      await this.roomService.deleteRoom(roomId)
      await this.notifyRoomParticipants(
        roomToDelete.participants.filter(
          (participant) => participant.id !== userId,
        ),
        'roomDeleted',
        { message: `Room with ID ${roomId} has been successfully deleted.` },
      )
      this.logger.log(
        `Room with ID ${roomId} deleted successfully by user ID ${userId}.`,
      )
    } catch (error) {
      this.logger.error(
        `Error deleting room with ID ${roomId} by user ID ${userId}: ${error.message}`,
        error.stack,
      )
      throw new WsException('Error occurred while deleting the room.')
    }
  }

  @SubscribeMessage('sendMessage')
  async onSendMessage(
    @WsCurrentUser() currentUser: UserPayload,
    @MessageBody(new WsValidationPipe()) createMessageDto: CreateMessageDto,
  ): Promise<void> {
    const userId = currentUser.id
    const { roomId } = createMessageDto

    try {
      const newMessage = await this.messageService.create(
        userId,
        createMessageDto,
      )

      this.logger.log(
        `User ID ${userId} sent a new message in Room ID ${roomId}`,
      )
      const room = await this.roomService.findOne(userId, roomId)
      await this.notifyRoomParticipants(
        room.participants,
        'messageSent',
        newMessage,
      )
    } catch (error) {
      this.logger.error(
        `Failed to send message in Room ID ${roomId} by User ID ${userId}: ${error.message}`,
        error.stack,
      )
      throw new WsException('Error occurred while sending the message.')
    }
  }

  @SubscribeMessage('findAllMessages')
  async onFindAllMessages(
    @WsCurrentUser() currentUser: UserPayload,
    @MessageBody(new WsValidationPipe()) filterMessageDto: FilterMessageDto,
    @ConnectedSocket() socket: Socket,
  ): Promise<void> {
    const { id: userId } = currentUser
    const { roomId } = filterMessageDto

    try {
      const room = await this.roomService.findOne(userId, roomId)

      const isParticipant = room.participants.some(
        (participant) => participant.id === userId,
      )
      if (!isParticipant) {
        throw new WsException(
          'You are not a participant in this room and cannot view messages.',
        )
      }

      const messages = await this.messageService.findByRoomId(filterMessageDto)
      this.server.to(socket.id).emit('allMessages', messages)
    } catch (error) {
      this.logger.error(
        `Failed to fetch messages for Room ID ${roomId} by User ID ${userId}: ${error.message}`,
        error.stack,
      )
      throw new WsException('Error occurred while fetching messages.')
    }
  }

  @SubscribeMessage('updateMessage')
  async onUpdateMessage(
    @WsCurrentUser() currentUser: UserPayload,
    @MessageBody(new WsValidationPipe()) updateMessageDto: UpdateMessageDto,
  ): Promise<void> {
    const userId = currentUser.id
    try {
      const updatedMessage = await this.messageService.update(
        userId,
        updateMessageDto,
      )

      const updatedConversation = await this.messageService.findByRoomId({
        roomId: updatedMessage.roomId,
      })

      const room = await this.roomService.findOne(userId, updatedMessage.roomId)
      await this.notifyRoomParticipants(
        room.participants,
        'messageUpdated',
        updatedConversation,
      )

      this.logger.log(
        `Message ID ${updateMessageDto.messageId} updated successfully by User ID ${userId}.`,
      )
    } catch (error) {
      this.logger.error(
        `Failed to update message ID ${updateMessageDto.messageId} by User ID ${userId}: ${error.message}`,
        error.stack,
      )
      throw new WsException('Error occurred while updating the message.')
    }
  }

  @SubscribeMessage('deleteMessage')
  async onDeleteMessage(
    @WsCurrentUser() currentUser: UserPayload,
    @MessageBody(new WsValidationPipe()) deleteMessageDto: DeleteMessageDto,
  ): Promise<void> {
    const userId = currentUser.id
    const { roomId, messageIds } = deleteMessageDto

    try {
      const room = await this.roomService.findOne(userId, roomId)

      await this.messageService.delete(userId, deleteMessageDto)

      await this.notifyRoomParticipants(room.participants, 'messageDeleted', {
        messageIds,
      })

      this.logger.log(
        `Messages deleted successfully in Room ID ${roomId} by User ID ${userId}. Notifications sent to all participants.`,
      )
    } catch (error) {
      this.logger.error(
        `Failed to delete messages in Room ID ${roomId} by User ID ${userId}: ${error.message}`,
        error.stack,
      )
      throw new WsException('Error occurred while deleting messages.')
    }
  }

  private async notifyRoomParticipants(
    participants: User[],
    event: string,
    payload: any,
  ): Promise<void> {
    const notificationPromises = participants.flatMap((participant) =>
      participant.connectedUsers.map(({ socketId }) => ({
        socketId,
        promise: this.emitToSocket(socketId, event, payload),
      })),
    )

    const results = await Promise.allSettled(
      notificationPromises.map(({ promise }) => promise),
    )

    results.forEach((result, index) => {
      const { socketId } = notificationPromises[index]
      if (result.status === 'fulfilled') {
        this.logger.log(
          `Notification sent successfully to Socket ID ${socketId} for event '${event}'`,
        )
      } else if (result.status === 'rejected') {
        this.logger.error(
          `Failed to notify Socket ID ${socketId} for event '${event}': ${result.reason}`,
        )
      }
    })
  }

  private async emitToSocket(
    socketId: string,
    event: string,
    payload: any,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.to(socketId).emit(event, payload, (response: any) => {
        if (response && response.error) {
          reject(new WsException(response.error))
        } else {
          resolve(response)
        }
      })
    })
  }

  private verifyUserAuthorization(participants: User[], userId: string): void {
    const isParticipant = participants.some(
      (participant) => participant.id === userId,
    )
    if (!isParticipant) {
      throw new WsException(
        `Deletion failed: You are not authorized to delete this room.`,
      )
    }
  }

  private validateRoomTypeAndParticipants(
    roomType: string,
    participants: string[],
    userId: string,
  ): void {
    if (participants.includes(userId)) {
      throw new WsException(
        'The room owner or updater should not be included in the participants list.',
      )
    }

    if (roomType === RoomTypeEnum.DIRECT && participants.length !== 1) {
      throw new WsException('Direct rooms must have exactly one participant.')
    }

    if (roomType === RoomTypeEnum.GROUP && participants.length < 1) {
      throw new WsException(
        'Group chat must include at least one participant aside from the room owner or updater.',
      )
    }

    const uniqueParticipants = new Set(participants)
    if (uniqueParticipants.size !== participants.length) {
      throw new WsException('Participants list must contain unique user IDs.')
    }
  }

  private async initializeUserConnection(
    user: User,
    socket: Socket,
  ): Promise<void> {
    socket.data.user = user
    await this.connectedUserService.create(user.id, socket.id)
    const rooms = await this.roomService.findByUserId(user.id)
    this.server.to(socket.id).emit('userAllRooms', rooms)
    this.logger.log(`Client connected: ${socket.id} - User ID: ${user.id}`)
  }

  async authenticateSocket(socket: Socket): Promise<User> {
    const token = this.extractJwtToken(socket)
    const payload = (await this.jwtService.verifyAsync(token)) as JwtPayload
    const user = await this.userService.findOne(payload.sub)

    return user
  }

  private handleConnectionError(socket: Socket, error: Error): void {
    this.logger.error(
      `Connection error for socket ${socket.id}: ${error.message}`,
    )
    socket.emit('exception', 'Authentication error')
    socket.disconnect()
  }

  private extractJwtToken(socket: Socket): string {
    const authHeader = socket.handshake.headers.authorization
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing')
    }

    const [bearer, token] = authHeader.split(' ')
    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization header format')
    }
    return token
  }
}
