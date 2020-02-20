// @ts-check
const { createProxyHandler, VendurePlugin } = require('@vendure/core');
const fs = require('fs-extra');
const path = require('path');

/**
 * This plugin runs the storefront demo server and proxies it to the /storefront path.
 */
class DemoStorefrontPlugin {

    static configure(config) {
        config.middleware.push({
            handler: createProxyHandler({
                label: 'Demo Storefront',
                port: 4000,
                route: 'storefront'
            }),
            route: 'storefront',
        });
        return config;
    }
}

Reflect.decorate(
    [
        VendurePlugin({
            configuration: config => DemoStorefrontPlugin.configure(config),
        })
    ],
    DemoStorefrontPlugin
);

module.exports = { DemoStorefrontPlugin };

