import { Expose } from 'class-transformer'
import { IsArray, IsNotEmpty, IsString, IsUUID } from 'class-validator'

export class AssignUsersDto {
  @Expose({ name: 'room_id' })
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  roomId: string

  @Expose({ name: 'participants' })
  @IsArray()
  @IsString({ each: true })
  @IsUUID(undefined, { each: true })
  @IsNotEmpty()
  participants: string[]
}
