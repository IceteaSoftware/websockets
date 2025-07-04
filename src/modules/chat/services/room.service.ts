import { Injectable, Logger } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { Room } from '../entities/room.entity'
import { DataSource, Repository } from 'typeorm'
import { MessageService } from './message.service'
import { AssignUsersDto } from '../dtos/room/assign-users.dto'
import { RoomParticipantsUser } from '../entities/room-participants-user'
import { WsException } from '@nestjs/websockets'
import { CreateRoomDto } from '../dtos/room/create-room.dto'
import { RoomDetailDto } from '../dtos/room/room-detail.dto'
import { plainToInstance } from 'class-transformer'
import { UpdateRoomDto } from '../dtos/room/update-room.dto'
import { Message } from '../entities/message.entity'
import { User } from '@app/modules/user/entities/user.entity'

@Injectable()
export class RoomService {
  private readonly logger = new Logger(RoomService.name)

  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectDataSource() private dataSource: DataSource,
    private readonly messageService: MessageService,
  ) {}

  async create(userId, createRoomDto: CreateRoomDto): Promise<Room> {
    const { participants, ...roomDetail } = createRoomDto
    try {
      const newRoom = this.roomRepository.create({
        ...roomDetail,
        createdBy: userId,
        updatedBy: userId,
      })
      const savedRoom = await this.roomRepository.save(newRoom)

      if (participants && participants.length > 0) {
        participants.push(userId) // Ensure the user creating the room is also a participant
        await this.assignUsersToRoom(userId, {
          roomId: savedRoom.id,
          participants,
        })
      }

      this.logger.log(
        `Room with ID ${savedRoom.id} created successfully by User ID: ${userId}`,
      )
      return savedRoom
    } catch (error) {
      this.logger.error(`Failed to create room: ${error.message}`, error.stack)
      throw new WsException('Error occurred while creating the room.')
    }
  }

  async findAll(): Promise<Room[]> {
    try {
      return await this.roomRepository.find({ relations: ['participants'] })
    } catch (error) {
      this.logger.error(
        `Failed to find all rooms: ${error.message}`,
        error.stack,
      )
      throw new WsException('Error occurred while retrieving rooms.')
    }
  }

  async findOne(userId: string, id: string): Promise<Room> {
    try {
      const room = await this.roomRepository.findOne({
        where: { id },
        relations: ['participants', 'participants.connectedUsers', 'messages'],
      })

      if (!room) {
        this.logger.warn(`Room with ID ${id} not found for User ID: ${userId}`)
        throw new WsException('Room not found.')
      }

      const isParticipant = room.participants.some(
        (participant) => participant.id === userId,
      )

      if (!isParticipant) {
        this.logger.warn(
          `User ID ${userId} is not a participant in Room ID ${id}`,
        )
        throw new WsException('You are not a participant in this room.')
      }

      return room
    } catch (error) {
      this.logger.error(
        `Failed to find room with ID ${id} for user ID ${userId}: ${error.message}`,
        error.stack,
      )
      throw new WsException('Error occurred while retrieving the room.')
    }
  }

  async findByUserId(userId: string): Promise<RoomDetailDto[]> {
    try {
      const rooms = await this.roomRepository
        .createQueryBuilder('room')
        .innerJoin(
          'room.participants',
          'participant',
          'participant.id = :userId',
          { userId },
        )
        .leftJoinAndSelect('room.participants', 'allParticipants')
        .getMany()

      const roomDetailsList: RoomDetailDto[] = []

      for (const room of rooms) {
        const lastMessageResult = await this.messageService.findByRoomId({
          roomId: room.id,
          first: 0,
          rows: 1,
        })

        const roomDetail = plainToInstance(RoomDetailDto, {
          ...room,
          lastMessage: lastMessageResult.total
            ? lastMessageResult.result[0]
            : null,
          participants: room.participants,
        })

        roomDetailsList.push(roomDetail)
      }

      return roomDetailsList
    } catch (error) {
      this.logger.error(
        `Failed to find rooms for user ID ${userId}: ${error.message}`,
        { userId, errorStack: error.stack },
      )
      throw new WsException(
        'An error occurred while retrieving user rooms. Please try again later.',
      )
    }
  }

  async update(
    userId: string,
    roomId: string,
    updateRoomDto: UpdateRoomDto,
  ): Promise<Room> {
    const { name, participants } = updateRoomDto

    try {
      const room = await this.roomRepository.findOne({ where: { id: roomId } })

      if (name !== undefined) {
        room.name = name
      }

      if (participants !== undefined) {
        participants.push(userId) // Ensure the user updating the room is also a participant
        await this.assignUsersToRoom(userId, {
          roomId,
          participants,
        })
      }

      room.updatedBy = userId
      const updatedRoom = await this.roomRepository.save(room)
      this.logger.log(
        `Room with ID ${roomId} updated successfully by User ID: ${userId}`,
      )
      return updatedRoom
    } catch (error) {
      this.logger.error(
        `Failed to update room with ID ${roomId}: ${error.message}`,
        error.stack,
      )
      throw new WsException('Error occurred while updating the room.')
    }
  }

  async deleteRoom(roomId: string): Promise<void> {
    try {
      await this.dataSource.transaction(async (transactionalEntityManager) => {
        await transactionalEntityManager.delete(Message, { roomId })

        await transactionalEntityManager.delete(RoomParticipantsUser, {
          roomId,
        })

        const deletionResult = await transactionalEntityManager.delete(Room, {
          id: roomId,
        })

        if (deletionResult.affected === 0) {
          this.logger.warn(`Room with ID ${roomId} not found for deletion`)
          throw new WsException('Room not found.')
        }

        this.logger.log(
          `Room with ID ${roomId} and all associated data deleted successfully.`,
        )
      })
    } catch (error) {
      this.logger.error(
        `Failed to delete room with ID ${roomId}: ${error.message}`,
        error.stack,
      )
      throw new WsException(
        'An error occurred while attempting to delete the room. Please try again.',
      )
    }
  }

  private async assignUsersToRoom(
    userId: string,
    assignUsersDto: AssignUsersDto,
  ): Promise<void> {
    try {
      await this.dataSource.transaction(async (manager) => {
        const room = await manager.findOne(Room, {
          where: { id: assignUsersDto.roomId },
          relations: ['participants'],
        })

        if (!room) {
          throw new Error(`Room ${assignUsersDto.roomId} not found`)
        }

        const operationType =
          room.participants && room.participants.length > 0
            ? 're-assigned'
            : 'assigned'

        room.participants = []

        const users = await manager.findByIds(User, assignUsersDto.participants)

        if (users.length !== assignUsersDto.participants.length) {
          throw new Error(`Some users not found`)
        }

        room.participants = users

        await manager.save(Room, room)

        this.logger.log(
          `Users ${operationType} to room ${assignUsersDto.roomId} successfully.`,
        )
      })
    } catch (error) {
      this.logger.error(
        `Failed to assign users to room: ${error.message}`,
        error.stack,
      )
      throw new WsException(
        `Failed to assign users to the room: ${error.message}`,
      )
    }
  }
}
