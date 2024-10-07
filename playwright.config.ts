import { defineConfig, devices } from '@playwright/test';
require("dotenv").config({ path: "./.env.local" });


const BASE_URL = process.env.TEST_BASE_URL || process.env.NEXTAUTH_URL;

export default defineConfig({

  testDir: './tests',
  fullyParallel: true,
  reporter: [
    [ 
      'html', 
    ]
  ],
  // Number of parallel workers (1 == serial)
  workers: 1,

  // CI specific config
  forbidOnly: !!process.env.CI, // fail if tests contain a test.only
  retries: process.env.CI ? 2 : 0, // Retry only if in CI
    
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },

  /* 
    Configure projects for major browsers 
    Can also be branded browsers as MS Edge 
    as well as mobile browsers.
  */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // }
  ],

});
