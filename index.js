const { bootstrap } = require('@vendure/core');
const { config } = require('./vendure-config');

bootstrap(config).catch(err => {
    // tslint:disable-next-line:no-console
    console.log(err);
});
