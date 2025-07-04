import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsNotEmpty, IsString, IsUUID } from 'class-validator'

export class UpdateMessageDto {
  @ApiProperty({ required: true })
  @Expose({ name: 'message_id' })
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  messageId: string

  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  text: string
}
