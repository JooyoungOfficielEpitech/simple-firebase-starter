/**
 * Final Complete Scraper
 * 모든 탭 (홈, 연습실, 프로필, 설정) + 모든 화면 수집
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://mobile-app-design-1uruno.lumi.ing';
const CREDENTIALS = {
  email: '2000jooyoung@gmail.com',
  password: 'mmejy0317'
};

const OUTPUT_DIR = __dirname;
let screenIndex = 0;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function captureScreen(page, name, description = '') {
  const filename = `${String(screenIndex).padStart(3, '0')}-${name}.png`;
  try {
    await page.screenshot({
      path: path.join(OUTPUT_DIR, 'screenshots', filename),
      fullPage: true
    });
    console.log(`  📸 [${screenIndex}] ${description || name}`);
    screenIndex++;
    return filename;
  } catch (e) {
    console.log(`  ⚠️  Screenshot failed: ${e.message}`);
    return null;
  }
}

async function savePageData(page, pageName) {
  try {
    const html = await page.content();
    const styles = await page.evaluate(() => {
      const data = [];
      document.querySelectorAll('*').forEach(el => {
        const computed = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          data.push({
            tag: el.tagName.toLowerCase(),
            class: el.className,
            text: el.innerText?.substring(0, 50),
            styles: {
              color: computed.color,
              bgColor: computed.backgroundColor,
              fontSize: computed.fontSize,
              fontWeight: computed.fontWeight,
              borderRadius: computed.borderRadius,
            }
          });
        }
      });
      return data;
    });

    fs.writeFileSync(path.join(OUTPUT_DIR, 'source', `${pageName}.html`), html, 'utf-8');
    fs.writeFileSync(path.join(OUTPUT_DIR, 'source', `${pageName}-styles.json`), JSON.stringify(styles, null, 2), 'utf-8');
  } catch (e) {
    console.log(`  ⚠️  Save failed: ${e.message}`);
  }
}

async function scrape() {
  console.log('🚀 Final Complete Scraper\n');

  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
    locale: 'ko-KR'
  });

  let page = await context.newPage();

  try {
    // 1. 랜딩 페이지
    console.log('📱 STEP 1: Landing Page');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await sleep(2000);
    await captureScreen(page, 'landing', 'Landing Page');

    // 2. Lumi 버튼 클릭
    console.log('\n🔘 STEP 2: Lumi Button → Login');
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('button:has-text("Lumi로 시작하기")').click()
    ]);
    page = newPage;
    await page.waitForLoadState('networkidle');
    await sleep(2000);
    await captureScreen(page, 'login-form', 'Login Form');

    // 3. 로그인
    console.log('\n🔐 STEP 3: Login');
    await page.locator('input[name="email"]').fill(CREDENTIALS.email);
    await page.locator('input[type="password"]').fill(CREDENTIALS.password);
    await captureScreen(page, 'login-filled', 'Login Filled');

    const loginPagePromise = context.waitForEvent('page', { timeout: 10000 }).catch(() => null);
    await page.locator('button:has-text("로그인")').click();
    await sleep(2000);

    const loginResultPage = await loginPagePromise;
    if (loginResultPage) {
      page = loginResultPage;
    } else {
      const allPages = context.pages();
      page = allPages[allPages.length - 1];
    }

    await page.waitForLoadState('networkidle').catch(() => {});
    await sleep(3000);

    console.log('  ✅ Login successful!');

    // 4. 모든 탭 탐색 (nav a 사용)
    console.log('\n🗺️  STEP 4: Exploring All Tabs');

    const tabs = [
      { name: '홈', href: '#/' },
      { name: '연습실', href: '#/music' },
      { name: '프로필', href: '#/profile' },
      { name: '설정', href: '#/settings' }
    ];

    for (let i = 0; i < tabs.length; i++) {
      const tab = tabs[i];
      console.log(`\n  📍 Tab ${i + 1}/4: ${tab.name}`);

      try {
        // 탭 클릭
        const tabLink = await page.locator(`nav a[href="${tab.href}"]`).first();
        await tabLink.click();
        await sleep(3000);

        const screenName = `tab-${i}-${tab.name}`;
        await captureScreen(page, screenName, `Tab: ${tab.name}`);
        await savePageData(page, screenName);

        // 스크롤
        const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
        if (scrollHeight > 900) {
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
          await sleep(1500);
          await captureScreen(page, `${screenName}-scrolled`, `Tab: ${tab.name} (scrolled)`);
          await page.evaluate(() => window.scrollTo(0, 0));
          await sleep(500);
        }

      } catch (e) {
        console.log(`  ⚠️  Tab error: ${e.message}`);
      }
    }

    // 5. 공고 탭으로 돌아가서 카드 클릭
    console.log('\n📄 STEP 5: Exploring Job Cards');
    await page.locator('nav a[href="#/"]').click();
    await sleep(2000);

    const cards = await page.locator('.bg-white.rounded-2xl').all();
    console.log(`  Found ${cards.length} cards`);

    for (let i = 0; i < Math.min(cards.length, 2); i++) {
      try {
        console.log(`  📋 Card ${i + 1}`);
        await cards[i].click();
        await sleep(3000);

        await captureScreen(page, `card-${i}-detail`, `Card ${i + 1} Detail`);
        await savePageData(page, `card-${i}-detail`);

        await page.goBack().catch(() => {});
        await sleep(2000);
      } catch (e) {
        console.log(`  ⚠️  Card error: ${e.message}`);
      }
    }

    // 6. + 버튼 클릭
    console.log('\n➕ STEP 6: Floating Action Button');
    try {
      const fabButton = await page.locator('button:has(svg.lucide-plus)').first();
      if (await fabButton.count() > 0) {
        console.log('  ✅ Found FAB');
        await fabButton.click();
        await sleep(2500);
        await captureScreen(page, 'fab-modal', 'FAB Modal');
        await savePageData(page, 'fab-modal');

        await page.keyboard.press('Escape');
        await sleep(1000);
      }
    } catch (e) {
      console.log(`  ⚠️  FAB error: ${e.message}`);
    }

    // 7. 알림 버튼 클릭
    console.log('\n🔔 STEP 7: Notifications');
    try {
      const bellButton = await page.locator('button:has(svg.lucide-bell)').first();
      if (await bellButton.count() > 0) {
        console.log('  ✅ Found notification button');
        await bellButton.click();
        await sleep(2500);
        await captureScreen(page, 'notifications', 'Notifications');
        await savePageData(page, 'notifications');

        await page.goBack().catch(() => page.keyboard.press('Escape'));
        await sleep(1000);
      }
    } catch (e) {
      console.log(`  ⚠️  Notification error: ${e.message}`);
    }

    // 8. 디자인 토큰 수집
    console.log('\n🎨 STEP 8: Design Tokens');

    const tokens = await page.evaluate(() => {
      const collect = {
        colors: new Set(),
        gradients: new Set(),
        fontSizes: new Set(),
        fontWeights: new Set(),
        spacing: new Set(),
        borderRadius: new Set(),
        boxShadows: new Set()
      };

      document.querySelectorAll('*').forEach(el => {
        const s = window.getComputedStyle(el);
        if (s.color !== 'rgb(0, 0, 0)') collect.colors.add(s.color);
        if (s.backgroundColor !== 'rgba(0, 0, 0, 0)') collect.colors.add(s.backgroundColor);
        if (s.backgroundImage?.includes('gradient')) collect.gradients.add(s.backgroundImage);
        if (s.fontSize) collect.fontSizes.add(s.fontSize);
        if (s.fontWeight) collect.fontWeights.add(s.fontWeight);
        ['padding', 'margin', 'gap'].forEach(p => {
          if (s[p] && s[p] !== '0px') collect.spacing.add(s[p]);
        });
        if (s.borderRadius !== '0px') collect.borderRadius.add(s.borderRadius);
        if (s.boxShadow !== 'none') collect.boxShadows.add(s.boxShadow);
      });

      return {
        colors: Array.from(collect.colors).sort(),
        gradients: Array.from(collect.gradients),
        fontSizes: Array.from(collect.fontSizes).sort(),
        fontWeights: Array.from(collect.fontWeights).sort(),
        spacing: Array.from(collect.spacing).sort(),
        borderRadius: Array.from(collect.borderRadius).sort(),
        boxShadows: Array.from(collect.boxShadows)
      };
    });

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'tokens', 'orphi-tokens.json'),
      JSON.stringify(tokens, null, 2),
      'utf-8'
    );

    console.log('\n✅ Scraping Complete!');
    console.log(`📸 Total Screenshots: ${screenIndex}`);

  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    await sleep(2000);
    await browser.close();
  }
}

scrape();
