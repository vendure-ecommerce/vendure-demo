import path from 'path';
import { VendurePlugin } from '@vendure/core';

/**
 * This plugin just serves the index.html file at the root.
 */
@VendurePlugin({
    configuration: config => {
        config.apiOptions.middleware.push({
            handler: (req, res, next) => {
                if (req.url.indexOf('/health') !== 0 &&
                    req.url.indexOf('/admin-api') !== 0 &&
                    req.url.indexOf('/shop-api') !== 0 &&
                    req.url.indexOf('/storefront') !== 0) {
                    const file = req.url === '/' ? 'index.html' : req.url;
                    res.sendFile(path.join(__dirname, '../../../static/landing-page', file));
                } else {
                    next();
                }
            },
            route: '/',
        });
        return config;
    }
})
export class LandingPagePlugin {}
