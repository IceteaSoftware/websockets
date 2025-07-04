import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator'

export class UpdateRoomDto {
  @ApiProperty({ required: true })
  @Expose({ name: 'room_id' })
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  roomId: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name: string

  @ApiProperty({ required: false })
  @IsArray()
  @IsString({ each: true })
  @IsUUID(undefined, {
    each: true,
    message: 'Each participant must be a valid UUID',
  })
  @IsOptional()
  participants: string[]
}
