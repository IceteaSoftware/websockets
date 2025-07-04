import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsNotEmpty, IsString, IsUUID } from 'class-validator'

export class DeleteRoomDto {
  @ApiProperty({ name: 'room_id' })
  @Expose({ name: 'room_id' })
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  roomId: string
}
