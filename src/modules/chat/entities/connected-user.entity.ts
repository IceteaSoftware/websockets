import { BaseUuidEntity } from '@app/modules/shared/base/base.entity'
import { User } from '@app/modules/user/entities/user.entity'
import { Expose } from 'class-transformer'
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'

@Entity({ name: 'connected_users' })
export class ConnectedUser extends BaseUuidEntity {
  @Expose({ name: 'user_id' })
  @Column({ name: 'user_id' })
  userId: string

  @Expose({ name: 'socket_id' })
  @Column({ name: 'socket_id' })
  socketId: string

  @ManyToOne(() => User, (user) => user.connectedUsers)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User
}
