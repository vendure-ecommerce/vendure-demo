import { Injectable, Inject } from '@nestjs/common';
import { DeletionResponse, DeletionResult, LanguageCode } from '@vendure/common/lib/generated-types';
import { CustomFieldsObject, ID, PaginatedList } from '@vendure/common/lib/shared-types';
import {
    assertFound,
    CustomFieldRelationService,
    HasCustomFields,
    ListQueryBuilder,
    ListQueryOptions,
    RelationPaths,
    RequestContext,
    TransactionalConnection,
    Translatable,
    TranslatableSaver,
    Translated,
    Translation,
    TranslationInput,
    TranslatorService,
    VendureEntity,
    patchEntity,
} from '@vendure/core';
import { Page } from '../entities/page.entity';
import { DEMO_CMS_PLUGIN_OPTIONS } from '../constants';
import { PluginInitOptions } from '../types';

// These can be replaced by generated types if you set up code generation
interface CreatePageInput {
    title: string;
    slug: string;
    content: string;
    // Define the input fields here
}
interface UpdatePageInput {
    id: ID;
    title?: string;
    slug?: string;
    content?: string;
    // Define the input fields here
}

@Injectable()
export class PageService {
    constructor(
        private connection: TransactionalConnection,
        private listQueryBuilder: ListQueryBuilder, @Inject(DEMO_CMS_PLUGIN_OPTIONS) private options: PluginInitOptions
    ) {}

    findAll(
        ctx: RequestContext,
        options?: ListQueryOptions<Page>,
        relations?: RelationPaths<Page>,
    ): Promise<PaginatedList<Page>> {
        return this.listQueryBuilder
            .build(Page, options, {
                relations,
                ctx,
            }
            ).getManyAndCount().then(([items, totalItems]) => {
                return {
                    items,
                    totalItems,
                }
            }
            );
    }

    findOne(
        ctx: RequestContext,
        id: ID,
        relations?: RelationPaths<Page>,
    ): Promise<Page | null> {
        return this.connection
            .getRepository(ctx, Page)
            .findOne({
                where: { id },
                relations,
            });
    }

    findBySlug(
        ctx: RequestContext,
        slug: string,
        relations?: RelationPaths<Page>,
    ): Promise<Page | null> {
        return this.connection
            .getRepository(ctx, Page)
            .findOne({
                where: { slug },
                relations,
            });
    }

    async create(ctx: RequestContext, input: CreatePageInput): Promise<Page> {
        const newEntityInstance = new Page(input);
        const newEntity = await this.connection.getRepository(ctx, Page).save(newEntityInstance);
        return assertFound(this.findOne(ctx, newEntity.id));
    }

    async update(ctx: RequestContext, input: UpdatePageInput): Promise<Page> {
        const entity = await this.connection.getEntityOrThrow(ctx, Page, input.id);
        const updatedEntity = patchEntity(entity, input);
        await this.connection.getRepository(ctx, Page).save(updatedEntity, { reload: false });
        return assertFound(this.findOne(ctx, updatedEntity.id));
    }

    async delete(ctx: RequestContext, id: ID): Promise<DeletionResponse> {
        const entity = await this.connection.getEntityOrThrow(ctx, Page, id);
        try {
            await this.connection.getRepository(ctx, Page).remove(entity);
            return {
                result: DeletionResult.DELETED,
            };
        } catch (e: any) {
            return {
                result: DeletionResult.NOT_DELETED,
                message: e.toString(),
            };
        }
    }
}
