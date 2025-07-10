import { AppAbility } from '@app/modules/casl/casl-ability.factory'

interface IPolicyHandler {
  handle(ability: AppAbility): boolean
}

type PolicyHandlerCallback = (ability: AppAbility) => boolean

export type PolicyHandler = IPolicyHandler | PolicyHandlerCallback
