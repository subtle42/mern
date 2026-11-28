import { defineConfig, devices } from "playwright/test";


export default defineConfig({
    use: {
        headless: true,
        launchOptions: {
            slowMo: 1000
        }
    },
    reporter: process.env.CI ? [['github'], ['html']] : 'list',
    projects: [
        {name: 'setup-chromium', testMatch: /.*\.setup\.ts/, use: {...devices["Desktop Chrome"]}},
        {name: 'chromium', dependencies: ['setup-chromium'], use: {...devices["Desktop Chrome"], storageState: './auth.json'}},

        {name: 'setup-firefox', testMatch: /.*\.setup\.ts/, use: {...devices["Desktop Firefox"]}},
        {name: 'firefox', dependencies: ['setup-firefox'], use: {...devices["Desktop Firefox"], storageState: './auth.json'}},

        {name: 'setup-webkit', testMatch: /.*\.setup\.ts/, use: {...devices["Desktop Safari"]}},
        {name: 'webkit', dependencies: ['setup-webkit'], use: {...devices["Desktop Safari"], storageState: './auth.json'}},
    ]
})