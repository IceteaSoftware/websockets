import { Expose } from 'class-transformer'
import { IsNotEmpty, IsString, IsUUID } from 'class-validator'

export class RoomFetchRequestDto {
  @Expose({ name: 'room_id' })
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  roomId: string
}
