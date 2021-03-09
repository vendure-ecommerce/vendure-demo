import { INestApplication } from '@nestjs/common';
import { bootstrap, JobQueueService } from '@vendure/core';
import { populate } from '@vendure/core/cli';
import { config } from './vendure-config';
import fs from 'fs-extra';
import path from 'path';
import { request } from 'graphql-request';

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
        getVendureCreateAsset('assets/products.csv')
    ).then((app) => createTestCustomer().then(() => app))
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
function createTestCustomer() {
    console.log('Creating test customer');
    const query = `
        mutation {
          registerCustomerAccount(input: {
            firstName: "Rio"
            lastName: "Zephyr"
            emailAddress: "test@vendure.io"
            password: "test"
          }) {
            ...on Success {
              success
            }
          }
        }
    `;
    return request('http://localhost:3000/shop-api', query);
}
