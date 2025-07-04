import { User } from '@app/modules/user/entities/user.entity'
import { ApiProperty } from '@nestjs/swagger'

export class MessageDto {
  @ApiProperty({ name: 'id' })
  id: string

  @ApiProperty({ name: 'room_id' })
  roomId: string

  @ApiProperty({ name: 'text' })
  text: string

  @ApiProperty({ name: 'creator' })
  creator: User

  @ApiProperty({ name: 'created_by' })
  createdBy: string

  @ApiProperty({ name: 'created_at' })
  createdAt: Date

  @ApiProperty({ name: 'updated_by' })
  updatedBy: string

  @ApiProperty({ name: 'updated_at' })
  updatedAt: Date
}
