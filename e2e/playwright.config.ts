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
        {name: 'setup', testMatch: /.*\.setup\.ts/},
        {name: 'chromium', dependencies: ['setup'], use: {...devices["Desktop Chrome"], storageState: './auth.json'}},
        {name: 'firefox', use: {...devices["Desktop Firefox"]}},
        {name: 'webkit', use: {...devices["Desktop Safari"]}},
        {name: 'edge', use: {...devices["Desktop Edge"], channel: 'msedge'}},
        {name: 'chrome', use: {...devices["Desktop Chrome"], channel: 'chrome'}}
    ]
})