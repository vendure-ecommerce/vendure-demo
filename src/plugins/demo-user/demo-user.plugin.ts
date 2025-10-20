import { PluginCommonModule, Type, VendurePlugin } from '@vendure/core';

import { DEMO_USER_PLUGIN_OPTIONS } from './constants';
import { PluginInitOptions } from './types';
import { DemoUserService } from './services/demo-user.service';

/**
 * This plugin creates admin users that are needed for demo purposes.
 */
@VendurePlugin({
    imports: [PluginCommonModule],
    providers: [{ provide: DEMO_USER_PLUGIN_OPTIONS, useFactory: () => DemoUserPlugin.options }, DemoUserService],
    compatibility: '^3.0.0',
})
export class DemoUserPlugin {
    static options: PluginInitOptions;

    static init(options: PluginInitOptions): Type<DemoUserPlugin> {
        this.options = options;
        return DemoUserPlugin;
    }
}
