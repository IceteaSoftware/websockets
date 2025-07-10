import { forwardRef, Module } from '@nestjs/common'
import { ArticleService } from './article.service'
import { ArticleController } from './article.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Article } from './entities/article.entity'
import { CaslModule } from '../casl/casl.module'

@Module({
  imports: [TypeOrmModule.forFeature([Article]), forwardRef(() => CaslModule)],
  controllers: [ArticleController],
  providers: [ArticleService],
})
export class ArticleModule {}
