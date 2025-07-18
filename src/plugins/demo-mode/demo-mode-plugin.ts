import {
  Logger,
  Permission,
  PluginCommonModule,
  ProcessContext,
  registerPluginStartupMessage,
  Type,
  VendurePlugin,
} from "@vendure/core";
import { MiddlewareConsumer, NestModule } from "@nestjs/common";
import express from "express";
import rateLimit from "express-rate-limit";
import fs from "fs";
import path from "path";

import { DemoAdminResolver } from "./demo-admin.resolver";

export interface DemoModePluginOptions {
  dashboardAppPath: string;
  dashboardRoute?: string;
}

const loggerCtx = "DemoModePlugin";

/**
 * Modifies some default behaviours for the demo
 */
@VendurePlugin({
  imports: [PluginCommonModule],
  adminApiExtensions: {
    resolvers: [DemoAdminResolver],
  },
})
export class DemoModePlugin implements NestModule {
  static options: Required<DemoModePluginOptions>;

  static init(options: DemoModePluginOptions): Type<DemoModePlugin> {
    this.options = {
      ...options,
      dashboardRoute: options.dashboardRoute || "admin",
    };
    return DemoModePlugin;
  }

  constructor(private processContext: ProcessContext) {}

  configure(consumer: MiddlewareConsumer) {
    if (this.processContext.isWorker) {
      return;
    }

    const indexHtmlPath = path.join(
      DemoModePlugin.options.dashboardAppPath,
      "index.html"
    );

    if (!fs.existsSync(indexHtmlPath)) {
      Logger.error(
        `Dashboard app path ${indexHtmlPath} does not exist`,
        loggerCtx
      );
      return;
    }

    consumer
      .apply(this.createStaticServer(DemoModePlugin.options.dashboardAppPath))
      .forRoutes(DemoModePlugin.options.dashboardRoute);

    registerPluginStartupMessage(
      `Dashboard`,
      DemoModePlugin.options.dashboardRoute
    );
  }

  private createStaticServer(appPath: string) {
    const limiter = rateLimit({
      windowMs: 60 * 1000,
      limit: process.env.NODE_ENV === "production" ? 500 : 2000,
      standardHeaders: true,
      legacyHeaders: false,
    });

    const dashboardServer = express.Router();
    // This is a workaround for a type mismatch between express v5 (Vendure core)
    // and express v4 (several transitive dependencies). Can be removed once the
    // ecosystem has more significantly shifted to v5.
    dashboardServer.use(limiter as any);
    dashboardServer.use(express.static(appPath));
    dashboardServer.use((req, res) => {
      res.sendFile("index.html", { root: appPath });
    });

    return dashboardServer;
  }
}
