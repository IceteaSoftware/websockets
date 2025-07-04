import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator'

export class FilterMessageDto {
  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  first?: number

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  rows?: number

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  filter?: string

  @ApiProperty({ required: false })
  @Expose({ name: 'room_id' })
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  roomId: string
}
