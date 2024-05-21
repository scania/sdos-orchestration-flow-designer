import { defineConfig } from "cypress";
import createBundler from "@bahmutov/cypress-esbuild-preprocessor";
import { addCucumberPreprocessorPlugin } from "@badeball/cypress-cucumber-preprocessor";
import createEsbuildPlugin from "@badeball/cypress-cucumber-preprocessor/esbuild";
require("dotenv").config({ path: "./.env.local" });
import { env } from "./src/lib/env";

const BASE_URL = env.BASE_URL || env.TEST_BASE_URL;

async function setupNodeEvents(
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions
): Promise<Cypress.PluginConfigOptions> {
  config.env = {
    TEST_USERNAME: env.TEST_USERNAME,
    TEST_PASSWORD: env.TEST_PASSWORD,
  };

  if (!BASE_URL) {
    throw new Error("base url missing");
  }
  // This is required for the preprocessor to be able to generate JSON reports after each run, and more,
  await addCucumberPreprocessorPlugin(on, config);
  // Include plugins
  require("cypress-mochawesome-reporter/plugin")(on);

  on(
    "file:preprocessor",
    createBundler({
      plugins: [createEsbuildPlugin(config)],
    })
  );

  // Make sure to return the config object as it might have been modified by the plugin.
  return config;
}

export default defineConfig({
  // Global config
  viewportHeight: 1080,
  viewportWidth: 1920,
  video: false,

  // Reporter config
  reporter: "cypress-mochawesome-reporter",
  reporterOptions: {
    reportFilename: "OFD-test-report-[datetime]",
    timestamp: "yyyymmdd",
    reportPageTitle: "Orchestration Flow Designer",
    reportTitle: "Orchestration Flow Designer",

    charts: true,
    code: false,
    embeddedScreenshots: true,
    inlineAssets: true,
  },

  // Specific for e2e tests
  e2e: {
    setupNodeEvents,
    specPattern: [
      "cypress/features/**/*.feature",
      "cypress/integration/**/*.test.ts",
    ],
    baseUrl: BASE_URL,
    experimentalModifyObstructiveThirdPartyCode: true,
    chromeWebSecurity: false,
  },
});
