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

export const config: VendureConfig = {
    apiOptions: {
        port: process.env.PORT ? +process.env.PORT : 3000,
    },
    authOptions: {
        cookieOptions: {
            secret: process.env.COOKIE_SECRET,
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
            assetUrlPrefix: "https://demo.vendure.io/assets/",
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
                    "https://demo.vendure.io/storefront/account/verify",
                passwordResetUrl:
                    "https://demo.vendure.io/storefront/account/reset-password",
                changeEmailAddressUrl:
                    "https://demo.vendure.io/storefront/account/change-email-address",
            },
            devMode: true,
        }),
        DefaultSearchPlugin,
        DefaultSchedulerPlugin.init({}),
        LandingPagePlugin,
        DemoModePlugin.init({}),
        GraphiqlPlugin.init(),
        DashboardPlugin.init({
            route: 'admin',
            appDir: path.join(__dirname, '../dist/dashboard')
        }),
        AdminUiPlugin.init({
            route: "legacy-admin",
            port: 3002,
            compatibilityMode: true,
            adminUiConfig: {
                apiHost: "auto",
                apiPort: "auto",
            },
        }),
        DemoCmsPlugin.init({}),
    ],
};
