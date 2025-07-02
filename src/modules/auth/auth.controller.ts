import { Controller, Post, Body } from '@nestjs/common'
import { AuthService } from './auth.service'
import { SignInDto } from './dto/sign-in.dto'
import { Public } from '@app/metadata/public.metadata'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  create(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto)
  }
}
