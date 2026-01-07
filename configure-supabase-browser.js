const puppeteer = require('puppeteer');

(async () => {
  console.log('🚀 Launching browser to configure Supabase...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null
  });
  
  const page = await browser.newPage();
  
  try {
    // Navigate to auth settings
    console.log('📍 Navigating to Supabase auth settings...');
    await page.goto('https://supabase.com/dashboard/project/drrrexovkxbhevwsueck/settings/auth', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    await page.waitForTimeout(3000);
    
    // Take screenshot
    await page.screenshot({ path: '/tmp/supabase-auth-settings.png', fullPage: true });
    console.log('📸 Screenshot saved to /tmp/supabase-auth-settings.png');
    
    console.log('\n✅ Browser opened. Please configure the following manually:');
    console.log('\n1. Site URL: https://godrive-academy.netlify.app');
    console.log('2. Redirect URLs:');
    console.log('   - https://godrive-academy.netlify.app/demo/coach.html');
    console.log('   - https://godrive-academy.netlify.app/demo/dashboard.html');
    console.log('3. Enable Email Confirmations: ON');
    console.log('4. Email Template (Confirm signup):');
    console.log('   Redirect URL: https://godrive-academy.netlify.app/demo/coach.html');
    console.log('\nPress Ctrl+C when done.');
    
    // Keep browser open
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await browser.close();
    process.exit(1);
  }
})();
