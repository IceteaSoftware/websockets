import { jwtConstants } from '@app/common/constant/jwt.constant'
import { JwtPayload } from '@app/common/interfaces/jwt-payload.interface'
import { IS_PUBLIC_KEY } from '@app/metadata/public.metadata'
import { User } from '@app/modules/user/entities/user.entity'
import { UserService } from '@app/modules/user/user.service'
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { JwtService } from '@nestjs/jwt'
import { Request } from 'express'

declare module 'express' {
  interface Request {
    user: User
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  private logger = new Logger(AuthGuard.name)

  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (isPublic) {
      return true
    }

    const request = context.switchToHttp().getRequest<Request>()
    const token = this.extractTokenFromHeader(request)

    if (!token) {
      this.logger.error('Bearer token is undefined')
      throw new UnauthorizedException()
    }
    try {
      const payload = (await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      })) as JwtPayload

      // Find this user
      const user = await this.userService.findOne(payload.sub)

      if (!user) throw new UnauthorizedException()
      request['user'] = user
    } catch (err) {
      this.logger.error('Bearer token is invalid: ', err)
      throw new UnauthorizedException()
    }
    return true
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? []
    return type === 'Bearer' ? token : undefined
  }
}
