const { AdminUiPlugin } = require('@vendure/admin-ui-plugin');
const { AssetServerPlugin } = require('@vendure/asset-server-plugin');
const { examplePaymentHandler, DefaultSearchPlugin } = require('@vendure/core');
const { EmailPlugin, defaultEmailHandlers } = require('@vendure/email-plugin');
const path = require('path');
const { LandingPagePlugin } = require('./landing-page/landing-page-plugin');

const config = {
    authOptions: {
        sessionSecret: '9s8wl7vkd8',
        requireVerification: false,
    },
    port: 3000,
    adminApiPath: 'admin-api',
    shopApiPath: 'shop-api',
    dbConnectionOptions: {
        type: 'sqlite',
        synchronize: false, // not working with SQLite/SQL.js, see https://github.com/typeorm/typeorm/issues/2576
        logging: false,
        database: path.join(__dirname, 'vendure.sqlite'),
    },
    paymentOptions: {
        paymentMethodHandlers: [examplePaymentHandler],
    },
    customFields: {},
    importExportOptions: {
        importAssetsDir: path.join(__dirname, 'vendure/import-assets'),
    },
    plugins: [
        new AssetServerPlugin({
            route: 'assets',
            assetUploadDir: path.join(__dirname, 'vendure/assets'),
            port: 3001,
        }),
        new EmailPlugin({
            handlers: defaultEmailHandlers,
            templatePath: path.join(__dirname, 'vendure/email/templates'),
            outputPath: path.join(__dirname, 'vendure/email/output'),
            mailboxPort: 3003,
            devMode: true,
        }),
        new DefaultSearchPlugin(),
        new AdminUiPlugin({ port: 3002 }),
        new LandingPagePlugin(),
    ],
};

module.exports = { config };
