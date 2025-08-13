import {PluginCommonModule, Type, VendurePlugin,} from "@vendure/core";

import {DemoAdminResolver} from "./demo-admin.resolver";

export interface DemoModePluginOptions {

}

const loggerCtx = "DemoModePlugin";

/**
 * Modifies some default behaviours for the demo
 */
@VendurePlugin({
  imports: [PluginCommonModule],
  adminApiExtensions: {
    resolvers: [DemoAdminResolver],
  },
})
export class DemoModePlugin  {
  static options: DemoModePluginOptions;

  static init(options: DemoModePluginOptions): Type<DemoModePlugin> {
    this.options = {
      ...options,
    };
    return DemoModePlugin;
  }

}
