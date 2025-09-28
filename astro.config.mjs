// @ts-check
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import cloudflare from "@astrojs/cloudflare";
import wix from "@wix/astro";
import react from "@astrojs/react";
import sourceAttrsPlugin from "@wix/babel-plugin-jsx-source-attrs";
import dynamicDataPlugin from "@wix/babel-plugin-jsx-dynamic-data";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import customErrorOverlayPlugin from "./vite-error-overlay-plugin.js";

const isBuild = process.env.NODE_ENV == "production";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [
    {
      name: "framewire",
      hooks: {
        "astro:config:setup": ({ injectScript, command }) => {
          if (command === "dev") {
            injectScript(
              "page",
              `import { init } from "@wix/framewire";
              console.log("Framewire initialized");
              init();`,
            );
          }
        },
      },
    },
    tailwind(),
    wix({
      enableHtmlEmbeds: isBuild,
      enableAuthRoutes: true
    }),
    react({ babel: { plugins: [sourceAttrsPlugin, dynamicDataPlugin] } }),
  ],
  vite: {
    plugins: [
      customErrorOverlayPlugin(),
      ...(isBuild ? [nodePolyfills()] : []),
    ],
  },
  adapter: isBuild ? cloudflare() : undefined,
  devToolbar: {
    enabled: false,
  },
  image: {
    domains: ["static.wixstatic.com"],
  },
  server: {
    allowedHosts: true,
    host: true,
  },
});
