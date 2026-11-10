import {defineConfig,devices} from '@playwright/test';

export default defineConfig({
  testDir:'./tests/e2e',
  testMatch:'designos3-icons.spec.mjs',
  timeout:30000,
  reporter:'list',
  use:{baseURL:'http://127.0.0.1:4175',headless:true,trace:'retain-on-failure'},
  projects:[{name:'iOS WebKit',use:{...devices['iPhone 13'],browserName:'webkit'}}],
  webServer:{
    command:'npm run build && python3 -m http.server 4175 --bind 127.0.0.1 --directory dist',
    url:'http://127.0.0.1:4175/',
    timeout:60000,
    reuseExistingServer:!process.env.CI
  }
});
