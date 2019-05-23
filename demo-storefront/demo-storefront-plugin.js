// @ts-check
const { createProxyHandler } = require('@vendure/core');
const fs = require('fs-extra');
const path = require('path');
const { spawn }  = require('child_process');
const os = require('os');

/**
 * This plugin runs the storefront demo server and proxies it to the /storefront path.
 */
class DemoStorefrontPlugin {
    onBootstrap() {
        this.serverProcess = spawn(`node`, ['storefront/dist/server.js'], { cwd: __dirname });
        this.serverProcess.stdout.on('data', (data) => {
          console.log(`Storefront server: ${data}`);
        });

        this.serverProcess.stderr.on('data', (data) => {
          console.log(`Storefront server error: ${data}`);
        });

        this.serverProcess.on('close', (code) => {
          console.log(`Storefront server exited with code ${code}`);
        });
        return this.overwriteAdminUiConfig('https://demo.vendure.io', 80);
    }

    configure(config) {
        config.middleware.push({
            handler: createProxyHandler({
                label: 'Demo Storefront',
                port: 4000,
                route: 'storefront'
            }),
            route: 'storefront',
        });
        return config;
    }

    onClose() {
        this.serverProcess.kill();
    }

    /**
     * Overwrites the parts of the admin-ui app's `vendure-ui-config.json` file relating to connecting to
     * the server admin API.
     */
    async overwriteAdminUiConfig(host, port) {
        const configPath = path.join(__dirname, 'storefront/dist/browser/storefront-config.json');
        const storefrontConfig = await fs.readFile(configPath, 'utf-8');
        const config = JSON.parse(storefrontConfig);
        config.apiHost = host;
        config.apiPort = port;
        await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    }
}

module.exports = { DemoStorefrontPlugin };

