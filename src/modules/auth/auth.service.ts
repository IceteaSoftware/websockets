import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { SignInDto, SignInResponseDto } from './dto/sign-in.dto'
import { verifyMessage } from 'ethers'
import { JwtService } from '@nestjs/jwt'
import { JwtPayload } from '@app/common/interfaces/jwt-payload.interface'
import { UserService } from '../user/user.service'
import { ConfigService } from '@nestjs/config'
@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name)

  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private readonly configService: ConfigService,
  ) {
    this.logger.log('AuthService instantiated')
  }

  async signIn(signInDto: SignInDto): Promise<SignInResponseDto> {
    // Validate signature
    const { walletAddress, signature } = signInDto
    try {
      const message = `websockets`
      const recovered = verifyMessage(message, signature)

      if (recovered.toLowerCase() !== walletAddress.toLowerCase()) {
        this.logger.error(
          `Signature verification failed for wallet: ${walletAddress}`,
        )
        throw new Error('Invalid signature')
      }

      const user = await this.userService.firstOrCreate(walletAddress)

      const payload = {
        sub: user.id,
        walletAddress: user.walletAddress,
      } as JwtPayload
      const response = new SignInResponseDto()
      response.accessToken = await this.jwtService.signAsync(payload)

      return response
    } catch (error) {
      this.logger.error('Auth Guard error: ', error)
      throw new UnauthorizedException()
    }
  }
}
