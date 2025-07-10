import { BaseUuidEntity } from '@app/modules/shared/base/base.entity'
import { User } from '@app/modules/user/entities/user.entity'
import { Expose } from 'class-transformer'
import { Column, Entity, ManyToOne } from 'typeorm'

@Entity('articles')
export class Article extends BaseUuidEntity {
  @Expose({ name: 'is_published' })
  @Column({ name: 'is_published' })
  isPublished: boolean

  @Expose({ name: 'author_id' })
  @Column({ name: 'author_id' })
  authorId: string

  @ManyToOne(() => User, (user) => user.articles)
  user: User
}
