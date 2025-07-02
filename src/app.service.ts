import { Inject, Injectable } from '@nestjs/common'
import { CACHE_INSTANCE } from './common/constant/provider.constant'
import { Cacheable } from 'cacheable'

@Injectable()
export class AppService {
  constructor(@Inject(CACHE_INSTANCE) private cacheable: Cacheable) {}
  async getHello(): Promise<string> {
    await this.cacheable.set('Hello', 'world')
    return 'Hello World!'
  }
}
