import { Args, Mutation, Resolver } from '@nestjs/graphql';
import {
    Administrator,
    AdministratorService,
    Allow,
    Ctx,
    IllegalOperationError,
    Permission,
    RequestContext,
    Transaction,
} from '@vendure/core';

@Resolver()
export class DemoAdminResolver {

    constructor(private administratorService: AdministratorService) {
    }

    @Transaction()
    @Mutation()
    @Allow(Permission.UpdateAdministrator)
    updateAdministrator(
        @Ctx() ctx: RequestContext,
        @Args() args: any,
    ): Promise<Administrator> {
        const {input} = args;
        if (input.id === 1) {
            throw new IllegalOperationError('The superadmin account may not be modified in the demo!');
        }
        return this.administratorService.update(ctx, input);
    }

    @Mutation()
    @Allow(Permission.DeleteCatalog)
    deleteProduct(): Promise<Administrator> {
        throw new IllegalOperationError('This action is not allowed in the demo');
    }

    @Mutation()
    @Allow(Permission.UpdateCatalog)
    updateCollection() {
        throw new IllegalOperationError('This action is not allowed in the demo');
    }

    @Mutation()
    @Allow(Permission.UpdateCatalog)
    moveCollection(): Promise<Administrator> {
        throw new IllegalOperationError('This action is not allowed in the demo');
    }

    @Mutation()
    @Allow(Permission.DeleteCatalog)
    deleteCollection(): Promise<Administrator> {
        throw new IllegalOperationError('This action is not allowed in the demo');
    }
}
