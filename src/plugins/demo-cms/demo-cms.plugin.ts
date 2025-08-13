import { PluginCommonModule, Type, VendurePlugin } from '@vendure/core';

import { DEMO_CMS_PLUGIN_OPTIONS } from './constants';
import { PluginInitOptions } from './types';
import { Page } from './entities/page.entity';
import { PageService } from './services/page.service';
import { PageShopResolver } from './api/page.resolver';
import { PageAdminResolver } from './api/page-admin.resolver';
import { shopApiExtensions, adminApiExtensions } from './api/api-extensions';

@VendurePlugin({
    imports: [PluginCommonModule],
    providers: [{ provide: DEMO_CMS_PLUGIN_OPTIONS, useFactory: () => DemoCmsPlugin.options }, PageService],
    shopApiExtensions: {
        schema: shopApiExtensions,
        resolvers: [PageShopResolver],
    },
    adminApiExtensions: {
        schema: adminApiExtensions,
        resolvers: [PageAdminResolver],
    },
    dashboard: './dashboard/index.tsx',
    configuration: config => {
        // Plugin-specific configuration
        // such as custom fields, custom permissions,
        // strategies etc. can be configured here by
        // modifying the `config` object.
        return config;
    },
    compatibility: '^3.0.0',
    entities: [Page],
})
export class DemoCmsPlugin {
    static options: PluginInitOptions;

    static init(options: PluginInitOptions): Type<DemoCmsPlugin> {
        this.options = options;
        return DemoCmsPlugin;
    }
}
