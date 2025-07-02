import { Injectable } from '@nestjs/common'
@Injectable()
export class UserService {
  async findOne(id: string): Promise<any> {
    return id
  }

  async findOneBy(conditions: Record<any, any>): Promise<any> {
    return conditions
  }

  async firstOrCreate(walletAddress: string): Promise<any> {
    return walletAddress
  }
}
