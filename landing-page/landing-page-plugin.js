// @ts-check
const fs = require('fs-extra');
const path = require('path');

/**
 * This plugin just serves the index.html file at the root.
 */
class LandingPagePlugin {

    constructor(ignorePaths) {
        this.ignorePaths = ignorePaths;
    }

    configure(config) {
        config.middleware.push({
            handler: (req, res, next) => {
                for (const path of this.ignorePaths) {
                    if (req.url.indexOf(path) !== 0) {
                        next();
                        return;
                    }
                }
                const file = req.url === '/' ? 'index.html' : req.url;
                res.sendFile(path.join(__dirname, file));
            },
            route: '/',
        });
        return config;
    }
}

module.exports = { LandingPagePlugin };
