import * as esbuild from "esbuild";
import { copySync, ensureDir } from "@std/fs";
import { resolve } from "@std/path";
import { parseArgs } from "@std/cli";
import webExt, { ExtTarget } from "@nobody/web-ext-deno";

import {
  GenWebsite,
  JavaScriptUnit,
  Route,
  WebPageUnit,
} from "@nobody/tananoni";
interface BrowserManifestSettings {
  color: string;
  omits: string[];
  // deno-lint-ignore no-explicit-any
  overrides?: { [id: string]: any };
}

interface BrowserManifests {
  [id: string]: BrowserManifestSettings;
}

const args = parseArgs(Deno.args);
const isWatching = args.watch || args.w;

const browsers: BrowserManifests = {
  chrome: {
    color: "\x1b[32m",
    omits: ["applications", "options_ui", "browser_action"],
  },
  firefox: {
    color: "\x1b[91m",
    overrides: {
      manifest_version: 2,
      background: {
        scripts: ["background.js"],
      },
    },
    omits: ["options_page", "host_permissions", "action"],
  },
};

let browser: ExtTarget = "firefox";
let dist = "dist/firefox";
if (args._[0] === "chrome") {
  browser = "chrome";
  dist = "dist/chrome";
}

if (args._[0] === "chrome") delete browsers.firefox;
if (args._[0] === "firefox") delete browsers.chrome;

console.log("\x1b[37mPackager\n========\x1b[0m");

const styles_asserts = { path: "static/styles" };
const icon_asserts = { path: "static/icons" };

function genRoute(path: string): Route {
  const pluginRoute = new Route(path)
    .appendAssert(styles_asserts)
    .appendAssert(icon_asserts)
    .appendWebPage(
      new WebPageUnit("./source/options.tsx", [{ type: "div", id: "mount" }], [{
        type: "module",
        src: "options.js",
      }]),
    )
    .appendWebPage(
      new WebPageUnit("./source/popup.tsx", [{ type: "div", id: "mount" }], [{
        type: "module",
        src: "options.js",
      }]),
    )
    .appendJavaScript(new JavaScriptUnit("./source/content_script.tsx"))
    .appendJavaScript(new JavaScriptUnit("./source/background.ts"));
  return pluginRoute;
}

const builds = Object.keys(browsers).map(async (browserId) => {
  const distDir = `dist/${browserId}`;

  // Copy JS/HTML/CSS/ICONS
  ensureDir(`${distDir}/static`);

  const options = { overwrite: true };
  copySync("static", distDir, options);

  const browserManifestSettings = browsers[browserId];

  // Transform Manifest
  const manifest = {
    ...JSON.parse(Deno.readTextFileSync("source/manifest.json")),
    ...browserManifestSettings.overrides,
  };
  browserManifestSettings.omits.forEach((omit) => delete manifest[omit]);

  Deno.writeTextFileSync(
    distDir + "/manifest.json",
    JSON.stringify(manifest, null, 2),
  );

  const color = browserManifestSettings.color || "";
  const browserName = browserId.toUpperCase();
  const colorizedBrowserName = `\x1b[1m${color}${browserName}\x1b[0m`;
  const outdir = `dist/${browserId}/`;

  console.log(`Initializing ${colorizedBrowserName} build...`);

  const routeDir = browserId;
  const route = genRoute(routeDir);
  const webgen = new GenWebsite()
    .withLogLevel("info")
    .withImportSource("npm:preact")
    .withFormat("iife");

  // Add watch esbuild options
  if (isWatching) {
    const watchplugin: esbuild.Plugin = {
      name: "watch-plugin",
      setup(build) {
        build.onEnd((result) => {
          if (result.errors.length != 0) {
            console.error(
              `Rebuild for ${colorizedBrowserName} failed:`,
              result.errors,
            );
          } else console.log(`Rebuilt for ${colorizedBrowserName}`);
        });
      },
    };
    webgen.appendPlugin(watchplugin);
    const [ctxResult] = await webgen.generateWebsiteWithContext(route);
    await ctxResult.ctx.watch();
  } else {
    await webgen.generateWebsite(route);
  }

  console.log(`Build complete for ${colorizedBrowserName}: ${resolve(outdir)}`);
});

await Promise.all(builds);

if (!isWatching) Deno.exit(0);

await webExt.cmd(
  { browserInfo: { browser }, sourceDir: dist },
  { options: { port: 8080 } },
);
