import { AdminUiPlugin } from "@vendure/admin-ui-plugin";
import { AssetServerPlugin } from "@vendure/asset-server-plugin";
import {
    DefaultGuestCheckoutStrategy,
    DefaultJobQueuePlugin,
    DefaultSchedulerPlugin,
    DefaultSearchPlugin,
    dummyPaymentHandler,
    VendureConfig,
} from "@vendure/core";
import { DashboardPlugin } from "@vendure/dashboard/plugin";
import { defaultEmailHandlers, EmailPlugin, FileBasedTemplateLoader, } from "@vendure/email-plugin";
import { GraphiqlPlugin } from "@vendure/graphiql-plugin";
import path from "path";
import { DemoCmsPlugin } from './plugins/demo-cms/demo-cms.plugin';
import { DemoModePlugin } from "./plugins/demo-mode/demo-mode-plugin";
import { DemoUserPlugin } from './plugins/demo-user/demo-user.plugin';
import { LandingPagePlugin } from "./plugins/landing-page/landing-page-plugin";
import { isPublicMode, isReadonlyMode } from './tenant-config';

const VENDURE_BASE_URL = process.env.VENDURE_BASE_URL || "https://demo.vendure.io";
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || "https://demo.vendure.io/storefront";

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
    orderOptions: {
        guestCheckoutStrategy: new DefaultGuestCheckoutStrategy({
            allowGuestCheckouts: true,
            allowGuestCheckoutForRegisteredCustomers: false, 
        })
    },
    customFields: {},
    plugins: [
        DefaultJobQueuePlugin,
        AssetServerPlugin.init({
            route: "assets",
            assetUploadDir: path.join(__dirname, "../static/assets"),
            assetUrlPrefix: `${VENDURE_BASE_URL}/assets/`,
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

        // Conditional plugins (PUBLIC mode only)
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
                        `${FRONTEND_BASE_URL}/account/verify`,
                    passwordResetUrl:
                        `${FRONTEND_BASE_URL}/account/reset-password`,
                    changeEmailAddressUrl:
                        `${FRONTEND_BASE_URL}/account/change-email-address`,
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
                        user: process.env.SMTP_USER ?? 'user',
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
                        `${FRONTEND_BASE_URL}/verify`,
                    passwordResetUrl:
                        `${FRONTEND_BASE_URL}/reset-password`,
                    changeEmailAddressUrl:
                        `${FRONTEND_BASE_URL}/account/profile`,
                }
            }),
        ] : []),

    ],
};
