const { bootstrap } = require('@vendure/core');
const { populate } = require('@vendure/core/cli');
const { config } = require('./vendure-config');
const { exec } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const { request } = require('graphql-request');

const CACHE_DIR = 'data-cache';
let app;

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


async function resetServer() {
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
            app = await bootstrap(config).catch(err => {
                // tslint:disable-next-line:no-console
                console.log(err);
            });
        })
}

/**
 * Cleans up the sqlite database and assets.
 */
async function clean() {
    console.log(`Cleaning up data`);
    await fs.remove('vendure.sqlite');
    await fs.remove('vendure/assets');
    await fs.remove('vendure/import-assets');
}

/**
 * Runs the Vendure CLI `populate` command
 */
function populateServer() {
    console.log('Populating');
    return populate(
        () => bootstrap({
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
                importAssetsDir: path.join(__dirname, './node_modules/@vendure/create/assets/images'),
            },
        }).then((app) => createTestCustomer().then(() => app)),
        path.join(__dirname, './node_modules/@vendure/create/assets/initial-data.json'),
        path.join(__dirname, './node_modules/@vendure/create/assets/products.csv'),
        path.join(__dirname, './node_modules/@vendure/create/assets/images'),
    ).then(app => app.close());
}

/**
 * Copies the pristine database and product images from the cached directory.
 */
async function resetFromCache() {
    console.log('Re-populating from cache');
    await fs.copy(path.join(__dirname, `${CACHE_DIR}/vendure.sqlite`), path.join(__dirname, 'vendure.sqlite'));
    await fs.copy(path.join(__dirname, `${CACHE_DIR}/vendure/assets`), path.join(__dirname, 'vendure/assets'));
}

/**
 * Saves the populated database and product images to a cache directory
 */
async function cachePopulatedContent() {
    if (!cacheExists()) {
        console.log('Saving populated data to cache');
        await fs.copy(path.join(__dirname, 'vendure.sqlite'), path.join(__dirname, `${CACHE_DIR}/vendure.sqlite`));
        await fs.copy(path.join(__dirname, 'vendure/assets'), path.join(__dirname, `${CACHE_DIR}/vendure/assets`));
    }
}

function cacheExists() {
    return fs.existsSync(CACHE_DIR);
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

module.exports = {
    resetServer,
};
