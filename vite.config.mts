import { vendureDashboardPlugin } from "@vendure/dashboard/plugin";
import { pathToFileURL } from "url";
import { defineConfig } from "vite";
import { resolve, join } from "path";

export default defineConfig({
  base: "admin",
  build: {
    outDir: join(__dirname, "dist/dashboard"),
  },
  plugins: [
    vendureDashboardPlugin({
      // The vendureDashboardPlugin will scan your configuration in order
      // to find any plugins which have dashboard extensions, as well as
      // to introspect the GraphQL schema based on any API extensions
      // and custom fields that are configured.
      vendureConfigPath: pathToFileURL("./src/vendure-config.ts"),
      // Points to the location of your Vendure server.
      adminUiConfig: {
        apiHost: process.env.API_PUBLIC_URL || "http://localhost",
        apiPort: process.env.API_PUBLIC_PORT
          ? +process.env.API_PUBLIC_PORT
          : "auto",
      },
      // When you start the Vite server, your Admin API schema will
      // be introspected and the types will be generated in this location.
      // These types can be used in your dashboard extensions to provide
      // type safety when writing queries and mutations.
      gqlTadaOutputPath: "./src/gql",
    }),
  ],
  resolve: {
    alias: {
      // This allows all plugins to reference a shared set of
      // GraphQL types.
      "@/gql": resolve(__dirname, "./src/gql/graphql.ts"),
    },
  },
});
