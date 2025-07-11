import { PolicyHandler } from '@app/common/interfaces/policy-handler.interface'
import { CHECK_POLICIES_KEY } from '@app/metadata/policy.metadata'
import {
  AppAbility,
  CaslAbilityFactory,
} from '@app/modules/casl/casl-ability.factory'
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policyHandlers =
      this.reflector.get<PolicyHandler[]>(
        CHECK_POLICIES_KEY,
        context.getHandler(),
      ) || []

    const { user } = context.switchToHttp().getRequest()
    const ability = this.caslAbilityFactory.createForUser(user) as any
    return policyHandlers.every((handler) =>
      this.execPolicyHandler(handler, ability),
    )
  }

  private execPolicyHandler(handler: PolicyHandler, ability: AppAbility) {
    if (typeof handler === 'function') {
      return handler(ability)
    }
    return handler.handle(ability)
  }
}
