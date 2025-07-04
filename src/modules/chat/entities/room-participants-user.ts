import { BaseUuidEntity } from '@app/modules/shared/base/base.entity'
import { Expose } from 'class-transformer'
import { Column, Entity } from 'typeorm'

@Entity({ name: 'room_participants_user' })
export class RoomParticipantsUser extends BaseUuidEntity {
  @Expose({ name: 'user_id' })
  @Column({ name: 'user_id' })
  userId: string

  @Expose({ name: 'room_id' })
  @Column({ name: 'room_id' })
  roomId: string

  @Expose({ name: 'created_by' })
  @Column({ name: 'created_by' })
  createdBy: string

  @Expose({ name: 'updated_by' })
  @Column({ name: 'updated_by' })
  updatedBy: string
}
