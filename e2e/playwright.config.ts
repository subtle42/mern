import { defineConfig, devices } from "playwright/test";


const allProjects = [
    {name: 'chromium', use: {...devices["Desktop Chrome"]}},
    {name: 'firefox', use: {...devices["Desktop Firefox"]}},
    {name: 'safari', use: {...devices["Desktop Safari"]}},
    {name: 'edge', use: {...devices["Desktop Edge"], channel: 'msedge'}},
    {name: 'chrome', use: {...devices["Desktop Chrome"], channel: 'chrome'}}
]

const hasProject = () => {
    const tmp = !!process.argv.find(x => x.includes('--project='))
    return tmp ? allProjects : undefined
}

export default defineConfig({
    use: {
        headless: true,
        launchOptions: {
            slowMo: 1000
        }
    },
    
    // projects: hasProject()
    projects: [
        {name: 'chromium', use: {...devices["Desktop Chrome"]}},
        {name: 'firefox', use: {...devices["Desktop Firefox"]}},
        {name: 'webkit', use: {...devices["Desktop Safari"]}},
        {name: 'edge', use: {...devices["Desktop Edge"], channel: 'msedge'}},
        {name: 'chrome', use: {...devices["Desktop Chrome"], channel: 'chrome'}}
    ]
})