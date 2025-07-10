import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import { Request } from 'express'
import { ArticleService } from './article.service'
import { PoliciesGuard } from '@app/guards/policies/policies.guard'
import { CheckPolicies } from '@app/metadata/policy.metadata'
import { Action, AppAbility } from '../casl/casl-ability.factory'
import { Article } from './entities/article.entity'

@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  create(@Req() req: Request) {
    return this.articleService.create(req.user.id)
  }

  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, Article))
  @Get()
  findAll() {
    return this.articleService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.articleService.findOne(+id)
  }

  @Patch(':id')
  update(@Param('id') id: string) {
    return this.articleService.update(id)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.articleService.remove(+id)
  }
}
