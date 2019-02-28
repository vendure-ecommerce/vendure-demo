const { bootstrap } = require('@vendure/core');
const { config } = require('./vendure-config');
const { exec } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const { request } = require('graphql-request');
const CronJob = require('cron').CronJob;

const CACHE_DIR = 'data-cache';

let app;
// Reset the server every hour
const job = new CronJob('0 0 */1 * * *', resetServer);

resetServer().then(() => job.start()).catch(err => console.error(err));

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
                return populate().then(() => cachePopulatedContent());
            }
        })
        .then(async () => {
            app = await bootstrap(config).catch(err => {
                // tslint:disable-next-line:no-console
                console.log(err);
            });
        })
        .then(() => createTestCustomer())
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
function populate() {
    console.log('Populating');
    return new Promise(((resolve, reject) => {
        exec('yarn vendure populate', (err, stdin, stderr) => {
            if (err) {
                console.log(stderr);
                reject(err);
            } else {
                console.log(stdin);
                resolve();
            }
        });
    }));
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
    const query = `
        mutation {
          registerCustomerAccount(input: {
            firstName: "Rio"
            lastName: "Zephyr"
            emailAddress: "test@vendure.io"
            password: "test"
          })
        }
    `;
    return request('http://localhost:3000/shop-api', query);
}