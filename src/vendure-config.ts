import { AdminUiPlugin } from '@vendure/admin-ui-plugin';
import { AssetServerPlugin } from '@vendure/asset-server-plugin';
import {
    createProxyHandler,
    DefaultJobQueuePlugin,
    DefaultSearchPlugin,
    dummyPaymentHandler,
    VendureConfig
} from '@vendure/core';
import {defaultEmailHandlers, EmailPlugin, FileBasedTemplateLoader} from '@vendure/email-plugin';
import path from 'path';
import { LandingPagePlugin } from './plugins/landing-page/landing-page-plugin';
import { DemoModePlugin } from './plugins/demo-mode/demo-mode-plugin';
import {HardenPlugin} from "@vendure/harden-plugin";

export const config: VendureConfig = {
    apiOptions: {
        port: 3000,
        adminApiPath: 'admin-api',
        shopApiPath: 'shop-api',
        adminApiPlayground: {
            settings: {'request.credentials': 'include'},
        },
        adminApiDebug: true,
        shopApiPlayground: {
            settings: {'request.credentials': 'include'},
        },
        shopApiDebug: true,
    },
    authOptions: {
        cookieOptions: {
            secret: '9s8wl7vkd8',
        },
        requireVerification: true,
        tokenMethod: ['cookie', 'bearer'],
        superadminCredentials: {
            identifier: process.env.SUPERADMIN_USERNAME ?? 'superadmin',
            password: process.env.SUPERADMIN_PASSWORD ?? 'superadmin',
        }
    },
    dbConnectionOptions: {
        type: 'better-sqlite3',
        synchronize: false,
        logging: false,
        database: path.join(__dirname, '../vendure.sqlite'),
    },
    paymentOptions: {
        paymentMethodHandlers: [dummyPaymentHandler],
    },
    customFields: {},
    plugins: [
        DefaultJobQueuePlugin,
        AssetServerPlugin.init({
            route: 'assets',
            assetUploadDir: path.join(__dirname, '../static/assets'),
            assetUrlPrefix: 'https://demo.vendure.io/assets/'
        }),
        EmailPlugin.init({
            route: 'mailbox',
            handlers: defaultEmailHandlers,
            templateLoader: new FileBasedTemplateLoader(path.join(__dirname, '../static/email/templates')),
            outputPath: path.join(__dirname, '../static/email/output'),
            globalTemplateVars: {
                fromAddress: '"Vendure Demo Store" <noreply@vendure.io>',
                verifyEmailAddressUrl: 'https://demo.vendure.io/storefront/account/verify',
                passwordResetUrl: 'https://demo.vendure.io/storefront/account/reset-password',
                changeEmailAddressUrl: 'https://demo.vendure.io/storefront/account/change-email-address'
            },
            devMode: true,
        }),
        DefaultSearchPlugin,
        AdminUiPlugin.init({
            route: 'admin',
            port: 3002,
            adminUiConfig: {
                apiHost: 'auto',
                apiPort: 'auto',
            },
        }),
        LandingPagePlugin,
        DemoModePlugin,
        HardenPlugin.init({
           hideFieldSuggestions: false,
           apiMode: 'dev',
        }),
    ],
};
