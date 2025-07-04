import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsNotEmpty, IsString, IsUUID } from 'class-validator'

export class DeleteMessageDto {
  @ApiProperty({ name: 'room_id' })
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  roomId: string

  @ApiProperty({ required: true, type: String, isArray: true })
  @IsArray()
  @IsUUID(4, { each: true })
  @IsNotEmpty()
  messageIds: string[]
}
