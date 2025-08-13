import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Permission } from '@vendure/common/lib/generated-types';
import { 
    Allow, 
    Ctx, 
    ID, 
    ListQueryOptions, 
    PaginatedList, 
    RequestContext, 
    Transaction 
} from '@vendure/core';
import { PageService } from '../services/page.service';
import { Page } from '../entities/page.entity';

@Resolver()
export class PageAdminResolver {
    constructor(private pageService: PageService) {}

    @Query()
    @Allow(Permission.ReadCatalog)
    async pages(
        @Ctx() ctx: RequestContext,
        @Args() args: { options?: ListQueryOptions<Page> }
    ): Promise<PaginatedList<Page>> {
        return this.pageService.findAll(ctx, args.options);
    }

    @Query()
    @Allow(Permission.ReadCatalog)
    async page(
        @Ctx() ctx: RequestContext,
        @Args() args: { id: ID }
    ): Promise<Page | null> {
        return this.pageService.findOne(ctx, args.id);
    }

    @Mutation()
    @Transaction()
    @Allow(Permission.CreateCatalog)
    async createPage(
        @Ctx() ctx: RequestContext,
        @Args() args: { input: CreatePageInput }
    ): Promise<Page> {
        return this.pageService.create(ctx, args.input);
    }

    @Mutation()
    @Transaction()
    @Allow(Permission.UpdateCatalog)
    async updatePage(
        @Ctx() ctx: RequestContext,
        @Args() args: { input: UpdatePageInput }
    ): Promise<Page> {
        return this.pageService.update(ctx, args.input);
    }

    @Mutation()
    @Transaction()
    @Allow(Permission.DeleteCatalog)
    async deletePage(
        @Ctx() ctx: RequestContext,
        @Args() args: { id: ID }
    ): Promise<{ result: string }> {
        const result = await this.pageService.delete(ctx, args.id);
        return { result: result.result };
    }
}

interface CreatePageInput {
    title: string;
    slug: string;
    content: string;
}

interface UpdatePageInput {
    id: ID;
    title?: string;
    slug?: string;
    content?: string;
}