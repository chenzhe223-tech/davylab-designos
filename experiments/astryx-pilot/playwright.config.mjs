import {defineConfig, devices} from '@playwright/test';
export default defineConfig({
  testDir:'./e2e',
  fullyParallel:true,
  retries:0,
  reporter:'list',
  use:{baseURL:'http://127.0.0.1:4174',trace:'retain-on-failure'},
  projects:[
    {name:'desktop',use:{...devices['Desktop Chrome']}},
    {name:'mobile-375',use:{...devices['iPhone SE'],browserName:'chromium'}},
    {name:'mobile-390',use:{...devices['iPhone 13'],browserName:'chromium'}},
    {name:'mobile-430',use:{...devices['iPhone 14 Pro Max'],browserName:'chromium'}}
  ],
  webServer:{command:'npm run dev -- --host 127.0.0.1 --port 4174',url:'http://127.0.0.1:4174',reuseExistingServer:!process.env.CI,timeout:30000}
});
