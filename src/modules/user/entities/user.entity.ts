import { ConnectedUser } from '@app/modules/chat/entities/connected-user.entity'
import { Message } from '@app/modules/chat/entities/message.entity'
import { Room } from '@app/modules/chat/entities/room.entity'
import { BaseUuidEntity } from '@app/modules/shared/base/base.entity'
import { Expose } from 'class-transformer'
import { Column, Entity, ManyToMany, OneToMany } from 'typeorm'

@Entity('users')
export class User extends BaseUuidEntity {
  @Expose({ name: 'wallet_address' })
  @Column({ name: 'wallet_address', unique: true })
  walletAddress: string

  @OneToMany(() => ConnectedUser, (connectedUser) => connectedUser.user)
  connectedUsers: ConnectedUser[]

  @ManyToMany(() => Room, (room) => room.participants)
  rooms: Room[]

  @OneToMany(() => Message, (message) => message.creator)
  messages: Message[]
}
