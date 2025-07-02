import { IsWalletAddress } from '@app/validators/is-wallet-address.validator'
import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsNotEmpty, IsString } from 'class-validator'

export class SignInDto {
  @ApiProperty({ name: 'wallet_address' })
  @Expose({ name: 'wallet_address' })
  @IsString()
  @IsNotEmpty()
  @IsWalletAddress()
  walletAddress: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  signature: string
}

export class SignInResponseDto {
  @Expose({ name: 'access_token' })
  accessToken: string
}
