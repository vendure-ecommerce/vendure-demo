import {INestApplication} from '@nestjs/common';
import {
    bootstrap,
    CustomerService,
    isGraphQlErrorResult,
    JobQueueService,
    OrderService,
    RequestContextService,
    Permission
} from '@vendure/core';
import {populate} from '@vendure/core/cli';
import {config} from './vendure-config';
import {DemoUserService} from './plugins/demo-user/services/demo-user.service';
import fs from 'fs-extra';
import path from 'path';

const CACHE_DIR = '../data-cache';
let app: INestApplication;

// Allow graceful restarts by pm2. See http://pm2.keymetrics.io/docs/usage/signals-clean-restart/#graceful-stop
process.on('SIGINT', async () => {
    if (app) {
        return app.close()
            .then(
                () => {
                    process.exit(0)
                },
                (err) => {
                    process.exit(1)
                }
            );
    }
});


export async function resetServer() {
    console.log(`[${(new Date()).toISOString()}] Resetting Vendure server to a pristine condition...`);
    if (app) {
        await app.close();
    }
    return clean()
        .then(() => {
            if (cacheExists()) {
                return resetFromCache();
            } else {
                return populateServer().then(() => cachePopulatedContent());
            }
        })
        .then(async () => {
            app = await bootstrap(config)
                .then(async _app => {
                    await _app.get(JobQueueService).start();
                    return _app;
                })
                .catch(err => {
                    // tslint:disable-next-line:no-console
                    console.log(err);
                    throw err;
                });
        })
}

/**
 * Cleans up the sqlite database and assets.
 */
async function clean() {
    console.log(`Cleaning up data`);
    await fs.remove('vendure.sqlite');
    await fs.remove('static/assets');
    await fs.remove('static/import-assets');
}

/**
 * Runs the Vendure CLI `populate` command
 */
function populateServer() {
    console.log('Populating');
    return populate(
        () => {
            return bootstrap({
                ...config,
                authOptions: {
                    ...config.authOptions,
                    requireVerification: false,
                },
                dbConnectionOptions: {
                    ...config.dbConnectionOptions,
                    synchronize: true,
                },
                importExportOptions: {
                    importAssetsDir: getVendureCreateAsset('assets/images'),
                },
            })
                .then(async (app) => {
                    await app.get(JobQueueService).start();
                    return app;
                });
        },
        getVendureCreateAsset('assets/initial-data.json'),
        getVendureCreateAsset('assets/products.csv'),
    ).then((app) => createTestCustomer(app).then(() => app))
        .then((app) => createDemoAdministrators(app).then(() => app))
        .then(app => app.close());
}

function getVendureCreateAsset(fileName: string): string {
    return path.join(
        path.dirname(require.resolve('@vendure/create')), fileName
    );
}

/**
 * Copies the pristine database and product images from the cached directory.
 */
async function resetFromCache() {
    console.log('Re-populating from cache');
    await fs.copy(path.join(__dirname, `${CACHE_DIR}/vendure.sqlite`), path.join(__dirname, '../vendure.sqlite'));
    await fs.copy(path.join(__dirname, `${CACHE_DIR}/static/assets`), path.join(__dirname, '../static/assets'));
}

/**
 * Saves the populated database and product images to a cache directory
 */
async function cachePopulatedContent() {
    if (!cacheExists()) {
        console.log('Saving populated data to cache');
        await fs.copy(path.join(__dirname, '../vendure.sqlite'), path.join(__dirname, `${CACHE_DIR}/vendure.sqlite`));
        await fs.copy(path.join(__dirname, '../static/assets'), path.join(__dirname, `${CACHE_DIR}/static/assets`));
    }
}

function cacheExists() {
    return fs.existsSync(path.join(__dirname, CACHE_DIR));
}

/**
 * Creates a test customer
 */
async function createTestCustomer(app: INestApplication) {
    const customerService = app.get(CustomerService);
    const requestContextService = app.get(RequestContextService);
    const orderService = app.get(OrderService);
    const ctx = await requestContextService.create({apiType: 'admin'});


    console.log('Creating test customer');
    const customer = await customerService.create(ctx, {
        firstName: 'Rio',
        lastName: 'Zephyr',
        emailAddress: 'test@vendure.io',
    }, 'test');
    if (isGraphQlErrorResult(customer)) {
        return;
    }
    const addressInput = {
        fullName: 'Rio Zephyr',
        streetLine1: '253 North Avenue',
        city: 'Malcolm',
        province: 'South Westcott',
        postalCode: '133002',
        countryCode: 'US',
        defaultBillingAddress: true,
        defaultShippingAddress: true,
        phoneNumber: '03342 4488822',
    }
    await customerService.createAddress(ctx, customer.id, addressInput)
    const order = await orderService.create(ctx, customer.user?.id);
    await pause(1000);
    const variantIds = [67, 77, 23];
    for (const id of variantIds) {
        await orderService.addItemToOrder(ctx, order.id, id, 1);
    }
    await orderService.setShippingAddress(ctx, order.id, addressInput);
    await orderService.setShippingMethod(ctx, order.id, [1]);
    await orderService.transitionToState(ctx, order.id, 'ArrangingPayment');
    await pause(1000);
    const completedOrder = await orderService.addPaymentToOrder(ctx, order.id, {
        method: 'standard-payment',
        metadata: {},
    });
    await pause(1000);
    if (!isGraphQlErrorResult(completedOrder)) {
        await orderService.settlePayment(ctx, completedOrder.payments?.[0].id);
        console.log(`Created Order ${completedOrder.code}`);
    } else {
        console.log(`Failed to complete Order`);
    }

}

/**
 * Creates demo administrators with custom roles
 */
async function createDemoAdministrators(app: INestApplication) {
    const demoUserService = app.get(DemoUserService);

    const storybookUsername = process.env.STORYBOOK_USERNAME;
    const storybookPassword = process.env.STORYBOOK_PASSWORD;

    if (storybookUsername && storybookPassword) {
        console.log('Creating demo administrator');
        // This is the user required for the Storybook docs
        // to be able to access the data needed to render the list/detail
        // components at storybook.vendure.io
        await demoUserService.createDemoAdministrators(
            'Storybook User',
            [Permission.ReadCatalog, Permission.ReadSettings],
            'Storybook',
            'User',
            storybookUsername,
            storybookPassword,
        );
        console.log('Demo administrator created');
    }
}

// Used to make the order history items follow in the correct sequence.
function pause(durationInMs: number) {
    return new Promise(resolve => setTimeout(resolve, durationInMs));
}
