import { VendurePlugin } from '@vendure/core';
import { RequestHandler } from 'express';
import path from 'path';

/**
 * This plugin just serves the index.html file at the root.
 */
@VendurePlugin({
    configuration: config => {
        const handler: RequestHandler = (req, res, next) => {
            if (req.url.indexOf('/health') !== 0 &&
                req.url.indexOf('/admin-api') !== 0 &&
                req.url.indexOf('/shop-api') !== 0 &&
                req.url.indexOf('/admin') !== 0 &&
                req.url.indexOf('/legacy-admin') !== 0 &&
                req.url.indexOf('/mailbox') !== 0 &&
                req.url.indexOf('/assets') !== 0 &&
                req.url.indexOf('/storefront') !== 0) {
                // redirecting to Admin UI by default
                return res.redirect('/admin')
            } else {
                next();
            }
        };
        config.apiOptions.middleware.push({
            handler,
            route: '/',
        });
        return config;
    }
})
export class LandingPagePlugin {}
