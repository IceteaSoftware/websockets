import { BaseUuidEntity } from '@app/modules/shared/base/base.entity'
import { Expose } from 'class-transformer'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { Room } from './room.entity'
import { User } from '@app/modules/user/entities/user.entity'

@Entity({ name: 'message' })
export class Message extends BaseUuidEntity {
  @Expose({ name: 'room_id' })
  @Column({ name: 'room_id' })
  roomId: string

  @Expose({ name: 'text' })
  @Column({ name: 'text' })
  text: string

  @ManyToOne(() => Room, (roomEntity) => roomEntity.messages)
  room: Room

  @Expose({ name: 'created_by' })
  @Column({ name: 'created_by' })
  createdBy: string

  @Expose({ name: 'updated_by' })
  @Column({ name: 'updated_by' })
  updatedBy: string

  @ManyToOne(() => User, (user) => user.messages)
  @JoinColumn([{ name: 'created_by', referencedColumnName: 'id' }])
  creator: User
}
