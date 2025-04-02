import { Args, Mutation, Resolver } from "@nestjs/graphql";
import {
  Administrator,
  AdministratorService,
  Allow,
  ChannelService,
  Ctx,
  ID,
  IllegalOperationError,
  Permission,
  RequestContext,
  Transaction,
} from "@vendure/core";
import {
  DeletionResponse,
  MutationDeleteAdministratorArgs,
} from "@vendure/common/lib/generated-types";

@Resolver()
export class DemoAdminResolver {
  constructor(
    private administratorService: AdministratorService,
    private channelService: ChannelService
  ) {}

  @Transaction()
  @Mutation()
  @Allow(Permission.UpdateAdministrator)
  updateAdministrator(
    @Ctx() ctx: RequestContext,
    @Args() args: any
  ): Promise<Administrator> {
    const { input } = args;
    if (input.id === 1) {
      throw new IllegalOperationError(
        "The superadmin account may not be modified in the demo!"
      );
    }
    return this.administratorService.update(ctx, input);
  }

  @Transaction()
  @Mutation()
  @Allow(Permission.DeleteAdministrator)
  deleteAdministrator(
    @Ctx() ctx: RequestContext,
    @Args() args: any
  ): Promise<DeletionResponse> {
    const { id } = args;

    if (id === 1) {
      throw new IllegalOperationError(
        "The superadmin account may not be deleted in the demo!"
      );
    }

    return this.administratorService.softDelete(ctx, id);
  }

  @Transaction()
  @Mutation()
  @Allow(Permission.DeleteAdministrator)
  deleteAdministrators(
    @Ctx() ctx: RequestContext,
    @Args() args: any
  ): Promise<DeletionResponse[]> {
    return Promise.all(
      args.ids.map((id: ID) => {
        if (id === 1) {
          throw new IllegalOperationError(
            "The superadmin account may not be deleted in the demo!"
          );
        }
        return this.administratorService.softDelete(ctx, id);
      })
    );
  }

  @Transaction()
  @Mutation()
  @Allow(Permission.DeleteChannel)
  deleteChannel(@Ctx() ctx: RequestContext, @Args() args: any): Promise<any> {
    const { id } = args;
    if (id === 1) {
      throw new IllegalOperationError(
        "The default channel may not be deleted in the demo!"
      );
    }
    return this.channelService.delete(ctx, id);
  }

  @Transaction()
  @Mutation()
  @Allow(Permission.Owner)
  async updateActiveAdministrator(
    @Ctx() ctx: RequestContext,
    @Args() args: any
  ): Promise<Administrator | undefined> {
    if (ctx.activeUserId) {
      const { input } = args;
      const administrator = await this.administratorService.findOneByUserId(
        ctx,
        ctx.activeUserId
      );
      if (administrator) {
        if (administrator.id === 1) {
          throw new IllegalOperationError(
            "The superadmin account may not be modified in the demo!"
          );
        }
        return this.administratorService.update(ctx, {
          ...input,
          id: administrator.id,
        });
      }
    }
  }

  @Mutation()
  @Allow(Permission.DeleteCatalog)
  deleteProduct(): Promise<Administrator> {
    throw new IllegalOperationError("This action is not allowed in the demo");
  }

  @Mutation()
  @Allow(Permission.UpdateCatalog)
  updateCollection() {
    throw new IllegalOperationError("This action is not allowed in the demo");
  }

  @Mutation()
  @Allow(Permission.UpdateCatalog)
  moveCollection(): Promise<Administrator> {
    throw new IllegalOperationError("This action is not allowed in the demo");
  }

  @Mutation()
  @Allow(Permission.DeleteCatalog)
  deleteCollection(): Promise<Administrator> {
    throw new IllegalOperationError("This action is not allowed in the demo");
  }
}
