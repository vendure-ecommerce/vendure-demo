import {AssetServerPlugin} from "@vendure/asset-server-plugin";
import {
    DefaultJobQueuePlugin,
    DefaultSchedulerPlugin,
    DefaultSearchPlugin,
    dummyPaymentHandler,
    VendureConfig,
} from "@vendure/core";
import {defaultEmailHandlers, EmailPlugin, FileBasedTemplateLoader,} from "@vendure/email-plugin";
import path from "path";
import {LandingPagePlugin} from "./plugins/landing-page/landing-page-plugin";
import {DemoModePlugin} from "./plugins/demo-mode/demo-mode-plugin";
import {GraphiqlPlugin} from "@vendure/graphiql-plugin";
import {DashboardPlugin} from "@vendure/dashboard/plugin";
import {DemoCmsPlugin} from './plugins/demo-cms/demo-cms.plugin';
import {AdminUiPlugin} from "@vendure/admin-ui-plugin";
import {DemoUserPlugin} from './plugins/demo-user/demo-user.plugin';
import {isPublicMode, isReadonlyMode} from './tenant-config';

const BASE_URL = process.env.BASE_URL || "https://demo.vendure.io";

export const config: VendureConfig = {
    apiOptions: {
        port: process.env.PORT ? +process.env.PORT : 3000,
        trustProxy: true
    },
    authOptions: {
        cookieOptions: {
            secret: process.env.COOKIE_SECRET ?? 'SuperSecret',
        },
        requireVerification: true,
        tokenMethod: ["cookie", "bearer"],
        superadminCredentials: {
            identifier: process.env.SUPERADMIN_USERNAME ?? "superadmin",
            password: process.env.SUPERADMIN_PASSWORD ?? "superadmin",
        },
    },
    dbConnectionOptions: {
        type: "better-sqlite3",
        synchronize: true,
        logging: false,
        database: path.join(__dirname, "../vendure.sqlite"),
    },
    paymentOptions: {
        paymentMethodHandlers: [dummyPaymentHandler],
    },
    customFields: {},
    plugins: [
        DefaultJobQueuePlugin,
        AssetServerPlugin.init({
            route: "assets",
            assetUploadDir: path.join(__dirname, "../static/assets"),
            assetUrlPrefix: `${BASE_URL}/assets/`,
        }),
        DefaultSearchPlugin,
        DefaultSchedulerPlugin.init({}),
        LandingPagePlugin,
        GraphiqlPlugin.init(),
        DashboardPlugin.init({
            route: 'admin',
            appDir: path.join(__dirname, '../dist/dashboard')
        }),
        DemoModePlugin.init({}),

        // Conditional plugins (READONLY mode only)
        ...(isPublicMode() ? [

            DemoCmsPlugin.init({}),
            AdminUiPlugin.init({
                route: "legacy-admin",
                port: 3002,
                adminUiConfig: {
                    apiHost: "auto",
                    apiPort: "auto",
                },
            }),
            EmailPlugin.init({
                route: "mailbox",
                handlers: defaultEmailHandlers,
                templateLoader: new FileBasedTemplateLoader(
                    path.join(__dirname, "../static/email/templates")
                ),
                outputPath: path.join(__dirname, "../static/email/output"),
                globalTemplateVars: {
                    fromAddress: '"Vendure Demo Store" <noreply@vendure.io>',
                    verifyEmailAddressUrl:
                        `${BASE_URL}/storefront/account/verify`,
                    passwordResetUrl:
                        `${BASE_URL}/storefront/account/reset-password`,
                    changeEmailAddressUrl:
                        `${BASE_URL}/storefront/account/change-email-address`,
                },
                devMode: true,
            }),
        ] : []),

        // Conditional plugins (READONLY mode only)
        ...(isReadonlyMode() ? [
            DemoUserPlugin.init({}),
            EmailPlugin.init({
                transport: {
                    type: 'smtp',
                    host: process.env.SMTP_HOST,
                    auth: {
                        type: 'login',
                        user: process.env.STMP_USER ?? 'user',
                        pass: process.env.STMP_PASS ?? 'pass'
                    }
                },
                handlers: defaultEmailHandlers,
                templateLoader: new FileBasedTemplateLoader(
                    path.join(__dirname, "../static/email/templates")
                ),
                globalTemplateVars: {
                    fromAddress: '"Vendure Store" <noreply@vendure.io>',
                    verifyEmailAddressUrl:
                        `${BASE_URL}/verify`,
                    passwordResetUrl:
                        `${BASE_URL}/reset-password`,
                    changeEmailAddressUrl:
                        `${BASE_URL}/account/profile`,
                }
            }),
        ] : []),

    ],
};
