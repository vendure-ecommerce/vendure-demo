import { Args, Query, Resolver } from '@nestjs/graphql';
import { Ctx, RequestContext } from '@vendure/core';
import { PageService } from '../services/page.service';
import { Page } from '../entities/page.entity';

@Resolver()
export class PageShopResolver {
    constructor(private pageService: PageService) {}

    @Query()
    async getPage(
        @Ctx() ctx: RequestContext,
        @Args() args: { slug: string }
    ): Promise<Page | null> {
        return this.pageService.findBySlug(ctx, args.slug);
    }
}