const { bootstrap } = require('@vendure/core');
const { config } = require('./vendure-config');
const rimraf = require('rimraf');

// clean().then(() => {
    bootstrap(config).catch(err => {
        // tslint:disable-next-line:no-console
        console.log(err);
    });
// })


function clean() {
    return new Promise(resolve => {
        rimraf('vendure.sqlite vendure/assets vendure/import-assets', resolve);
    });
}

