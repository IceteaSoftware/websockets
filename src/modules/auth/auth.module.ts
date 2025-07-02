import { jwtConstants } from '@app/common/constant/jwt.constant'
import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { UserModule } from '../user/user.module'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
// import { UserService } from '../user/user.service'

@Module({
  imports: [
    UserModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      global: true,
      signOptions: {
        expiresIn: process.env.NODE_ENV === 'development' ? '30d' : '1d',
      },
    }),
  ],

  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
