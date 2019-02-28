// @ts-check
const fs = require('fs-extra');
const path = require('path');

/**
 * This plugin just serves the index.html file at the root.
 */
class LandingPagePlugin {
    configure(config) {
        const assetRe = /^\/assets\/(.*)/;
        config.middleware.push({
            handler: (req, res, next) => {
                if (req.url.indexOf('/admin-api') !== 0 && req.url.indexOf('/shop-api') !== 0) {
                    const file = req.url === '/' ? 'index.html' : req.url;
                    res.sendFile(path.join(__dirname, file));
                } else {
                    next();
                }
            },
            route: '/',
        });
        return config;
    }
}

module.exports = { LandingPagePlugin };
