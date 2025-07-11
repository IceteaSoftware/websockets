import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common'
import { WsException } from '@nestjs/websockets'
import { Socket } from 'socket.io'

@Catch(WsException)
export class WsExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<Socket>()
    client.emit('exception', {
      status: 'error',
      message: exception.getError(),
    })
  }
}
