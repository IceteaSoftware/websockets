import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Article } from './entities/article.entity'

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
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

  remove(id: number) {
    return `This action removes a #${id} article`
  }
}
