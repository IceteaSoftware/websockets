import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsNotEmpty, IsString } from 'class-validator'

export class CreateMessageDto {
  @ApiProperty({ name: 'room_id' })
  @Expose({ name: 'room_id' })
  @IsString()
  @IsNotEmpty()
  roomId: string

  @ApiProperty({ name: 'text' })
  @Expose({ name: 'text' })
  @IsString()
  @IsNotEmpty()
  text: string
}
