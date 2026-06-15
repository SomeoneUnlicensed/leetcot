import { chromium } from 'playwright';

async function run() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Log all console messages
  page.on('console', (msg) => {
    console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`);
  });

  try {
    console.log('Navigating to http://localhost:3000/challenge/literal-types...');
    await page.goto('http://localhost:3000/challenge/literal-types', { waitUntil: 'networkidle' });

    console.log('Waiting for Monaco editor...');
    await page.waitForTimeout(5000); // wait for monaco load

    console.log('Clicking "На проверочку! 🐾" button...');
    const submitButton = page.locator('button:has-text("На проверочку!")');
    await submitButton.click();

    console.log('Waiting for verification result...');
    await page.waitForTimeout(5000); // wait for cute animation and check

    console.log('Taking screenshot...');
    await page.screenshot({ path: 'scratch/result.png' });
    console.log('Screenshot saved to scratch/result.png');
  } catch (error) {
    console.error('Error during run:', error);
  } finally {
    await browser.close();
    console.log('Browser closed.');
  }
}

run();
