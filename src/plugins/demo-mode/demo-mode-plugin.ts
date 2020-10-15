import { Permission, PluginCommonModule, VendurePlugin } from '@vendure/core';

import { DemoAdminResolver } from './demo-admin.resolver';

/**
 * Modifies some default behaviours for the demo
 */
@VendurePlugin({
    imports: [PluginCommonModule],
    adminApiExtensions: {
        resolvers: [DemoAdminResolver]
    }
})
export class DemoModePlugin {}
