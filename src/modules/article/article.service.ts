import { ForbiddenException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Article } from './entities/article.entity'
import { Action, CaslAbilityFactory } from '../casl/casl-ability.factory'
import { User } from '../user/entities/user.entity'

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async create(userId: string) {
    const article = new Article()
    article.authorId = userId
    article.isPublished = false
    return this.articleRepository.save(article)
  }

  findAll() {
    return `This action returns all article`
  }

  findOne(id: number) {
    return `This action returns a #${id} article`
  }

  update(articleId: string) {
    return this.articleRepository.update(articleId, {
      isPublished: true,
    })
  }

  async remove(id: string, user: User) {
    const article = await this.articleRepository.findOneByOrFail({ id })
    const ability = this.caslAbilityFactory.createForUser(user)

    if (!ability.cannot(Action.Delete, article)) {
      throw new ForbiddenException('You cannot delete this article')
    }
    return `This action removes a #${id} article`
  }
}
