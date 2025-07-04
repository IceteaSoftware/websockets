import { BaseUuidEntity } from '@app/modules/shared/base/base.entity'
import { User } from '@app/modules/user/entities/user.entity'
import { Expose } from 'class-transformer'
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm'
import { Message } from './message.entity'

@Entity({ name: 'room' })
export class Room extends BaseUuidEntity {
  @Column({ name: 'name', unique: true })
  name: string

  @Column({ name: 'type' })
  type: string

  @ManyToMany(() => User, (user) => user.rooms)
  @JoinTable({
    name: 'room_participants_user',
    joinColumn: {
      name: 'room_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
  })
  participants: User[]

  @Expose({ name: 'created_by' })
  @Column({ name: 'created_by' })
  createdBy: string

  @Expose({ name: 'updated_by' })
  @Column({ name: 'updated_by' })
  updatedBy: string

  @OneToMany(() => Message, (message) => message.room)
  messages: Message[]
}
