import { Injectable } from '@nestjs/common'
import { User } from '../user/entities/user.entity'
import {
  AbilityBuilder,
  createMongoAbility,
  ExtractSubjectType,
  InferSubjects,
  MongoAbility,
} from '@casl/ability'
import { Article } from '../article/entities/article.entity'

export enum Action {
  Manage = 'manage',
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

type Subjects = InferSubjects<typeof Article | typeof User> | 'all'

export type AppAbility = MongoAbility<[Action, Subjects]>

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: User) {
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility)

    if (user.isAdmin) {
      can(Action.Manage, 'all') // Admin can manage everything
    } else {
      can(Action.Read, 'all')
    }

    can(Action.Update, Article, { authorId: user.id })

    cannot(Action.Delete, Article, { isPublished: false })

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    })
  }
}
