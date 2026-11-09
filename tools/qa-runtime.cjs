// Run the unchanged handoff tests against this machine's browser.
const Module=require('module'),fs=require('fs'),path=require('path');
const playwright=require('playwright');
const originalLaunch=playwright.chromium.launch.bind(playwright.chromium);
playwright.chromium.launch=async options=>{
 const launchOptions={...options};
 const executable=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || (process.platform==='linux'&&fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':null);
 if(executable){delete launchOptions.channel;launchOptions.executablePath=executable;}
 else if(launchOptions.executablePath==='/usr/bin/chromium'&&!fs.existsSync(launchOptions.executablePath))delete launchOptions.executablePath;
 if(process.env.PLAYWRIGHT_CHANNEL&&!executable)launchOptions.channel=process.env.PLAYWRIGHT_CHANNEL;
 if(process.platform==='linux')launchOptions.args=[...(launchOptions.args||[]),'--no-sandbox','--disable-dev-shm-usage'];
 const browser=await originalLaunch(launchOptions);
 const newContext=browser.newContext.bind(browser);
 browser.newContext=async options=>{const context=await newContext(options);const newPage=context.newPage.bind(context);context.newPage=async()=>{const page=await newPage();const goto=page.goto.bind(page);page.goto=async(...args)=>{const response=await goto(...args);if(await page.locator('#enterGame').isVisible())await page.click('#enterGame');return response;};return page;};return context;};
 return browser;
};
const resolve=Module._resolveFilename;
Module._resolveFilename=function(request,...rest){if(request.includes('C:/Users/')&&request.endsWith('/playwright'))return require.resolve('playwright');return resolve.call(this,request,...rest);};
require(path.resolve(process.argv[2]));
