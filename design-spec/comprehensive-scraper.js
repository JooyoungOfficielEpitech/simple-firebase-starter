/**
 * Comprehensive App Scraper
 * 모든 탭, 모든 버튼, 모든 화면을 철저히 수집
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
const visitedScreens = new Set();

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function captureScreen(page, name, description = '') {
  const filename = `${String(screenIndex).padStart(3, '0')}-${name}.png`;
  const filepath = path.join(OUTPUT_DIR, 'screenshots', filename);

  try {
    await page.screenshot({ path: filepath, fullPage: true });
    console.log(`  📸 [${screenIndex}] ${description || name}`);
    screenIndex++;
    visitedScreens.add(name);
    return filename;
  } catch (e) {
    console.log(`  ⚠️  Screenshot failed: ${e.message}`);
    return null;
  }
}

async function savePageData(page, pageName) {
  try {
    const html = await page.content();
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'source', `${pageName}.html`),
      html,
      'utf-8'
    );

    const styles = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const data = [];
      elements.forEach(el => {
        const computed = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          data.push({
            tag: el.tagName.toLowerCase(),
            id: el.id,
            class: el.className,
            text: el.innerText?.substring(0, 100),
            rect: { x: rect.x, y: rect.y, w: rect.width, h: rect.height },
            styles: {
              color: computed.color,
              bgColor: computed.backgroundColor,
              fontSize: computed.fontSize,
              fontWeight: computed.fontWeight,
              padding: computed.padding,
              margin: computed.margin,
              borderRadius: computed.borderRadius,
              boxShadow: computed.boxShadow,
              background: computed.background,
            }
          });
        }
      });
      return data;
    });

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'source', `${pageName}-styles.json`),
      JSON.stringify(styles, null, 2),
      'utf-8'
    );
  } catch (e) {
    console.log(`  ⚠️  Save data failed: ${e.message}`);
  }
}

async function scrapeComprehensively() {
  console.log('🚀 Starting COMPREHENSIVE app scraper...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 150
  });

  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
    locale: 'ko-KR'
  });

  let page = await context.newPage();

  try {
    // === STEP 1: 랜딩 페이지 ===
    console.log('📱 STEP 1: Landing Page');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await sleep(3000);
    await captureScreen(page, 'landing', 'Landing Page');
    await savePageData(page, 'landing');

    // === STEP 2: Lumi 버튼 클릭 → 새 창 ===
    console.log('\n🔘 STEP 2: Click Lumi Button');
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('button:has-text("Lumi로 시작하기")').click()
    ]);
    page = newPage;
    await page.waitForLoadState('networkidle');
    await sleep(3000);
    await captureScreen(page, 'login-form', 'Login Form');
    await savePageData(page, 'login-form');

    // === STEP 3: 로그인 ===
    console.log('\n🔐 STEP 3: Login');
    await page.locator('input[name="email"]').fill(CREDENTIALS.email);
    await page.locator('input[type="password"]').fill(CREDENTIALS.password);
    await sleep(500);
    await captureScreen(page, 'login-filled', 'Login Filled');

    const pagePromise = context.waitForEvent('page', { timeout: 10000 }).catch(() => null);
    await page.locator('button:has-text("로그인")').click();
    await sleep(2000);

    const newLoginPage = await pagePromise;
    if (newLoginPage) {
      page = newLoginPage;
    } else {
      const allPages = context.pages();
      if (allPages.length > 0) {
        page = allPages[allPages.length - 1];
      }
    }

    await page.waitForLoadState('networkidle').catch(() => {});
    await sleep(3000);

    await captureScreen(page, 'app-home', 'App Home Screen');
    await savePageData(page, 'app-home');

    // === STEP 4: 하단 탭바 모든 탭 탐색 ===
    console.log('\n🗺️  STEP 4: Exploring Bottom Tabs');

    // 하단 탭 찾기
    const bottomTabs = await page.locator('footer button, footer a, [class*="tab-bar"] button, [class*="TabBar"] button').all();
    console.log(`  Found ${bottomTabs.length} bottom tabs`);

    for (let i = 0; i < bottomTabs.length; i++) {
      try {
        const tab = bottomTabs[i];
        const ariaLabel = await tab.getAttribute('aria-label').catch(() => '');
        const text = await tab.textContent().catch(() => '');
        const tabName = ariaLabel || text || `tab-${i}`;

        console.log(`\n  📍 Tab ${i + 1}/${bottomTabs.length}: ${tabName}`);

        await tab.click();
        await sleep(2500);

        const screenName = `tab-${i}-${tabName.replace(/[^a-zA-Z0-9가-힣]/g, '_').substring(0, 20)}`;
        await captureScreen(page, screenName, `Tab: ${tabName}`);
        await savePageData(page, screenName);

        // 스크롤해서 전체 화면 캡처
        const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
        if (scrollHeight > 812) {
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
          await sleep(1000);
          await captureScreen(page, `${screenName}-scrolled`, `Tab ${tabName} scrolled`);
          await page.evaluate(() => window.scrollTo(0, 0));
          await sleep(500);
        }

      } catch (e) {
        console.log(`  ⚠️  Tab ${i} error: ${e.message}`);
      }
    }

    // === STEP 5: 플로팅 액션 버튼 (+) ===
    console.log('\n➕ STEP 5: Floating Action Button');
    const fabButton = await page.locator('button[class*="fab"], button[class*="floating"], button:has-text("+")').first();
    if (await fabButton.count() > 0) {
      console.log('  ✅ Found FAB button');
      await fabButton.click();
      await sleep(2000);
      await captureScreen(page, 'fab-action', 'FAB Action');
      await savePageData(page, 'fab-action');

      // 닫기
      await page.keyboard.press('Escape');
      await sleep(1000);
    }

    // === STEP 6: 공고 카드 클릭 ===
    console.log('\n📄 STEP 6: Exploring Cards');

    // 첫 번째 탭으로 돌아가기 (공고 탭)
    const firstTab = await page.locator('footer button, footer a').first();
    if (await firstTab.count() > 0) {
      await firstTab.click();
      await sleep(2000);
    }

    const cards = await page.locator('[class*="card"], [class*="Card"], article, li').all();
    console.log(`  Found ${cards.length} card elements`);

    for (let i = 0; i < Math.min(cards.length, 3); i++) {
      try {
        const card = cards[i];
        const isVisible = await card.isVisible().catch(() => false);
        if (!isVisible) continue;

        console.log(`  📋 Card ${i + 1}`);
        await card.click();
        await sleep(2500);

        await captureScreen(page, `card-${i}-detail`, `Card ${i} Detail`);
        await savePageData(page, `card-${i}-detail`);

        // 뒤로가기
        await page.goBack().catch(() => {});
        await sleep(1500);

      } catch (e) {
        console.log(`  ⚠️  Card ${i} error: ${e.message}`);
      }
    }

    // === STEP 7: 모든 버튼 탐색 ===
    console.log('\n🔘 STEP 7: Exploring All Buttons');

    const allButtons = await page.locator('button:not(:has-text("Lumi"))').all();
    console.log(`  Found ${allButtons.length} buttons`);

    let exploredCount = 0;
    for (let i = 0; i < Math.min(allButtons.length, 20); i++) {
      try {
        const button = allButtons[i];
        const text = await button.textContent().catch(() => '');
        const isVisible = await button.isVisible().catch(() => false);

        if (!isVisible || !text.trim()) continue;

        const buttonName = text.trim().substring(0, 20);
        if (visitedScreens.has(`button-${buttonName}`)) continue;

        console.log(`  🔘 Button: "${text.trim()}"`);
        await button.click();
        await sleep(2000);

        await captureScreen(page, `button-${buttonName}`, `Button: ${text.trim()}`);
        exploredCount++;

        // 모달 체크
        const hasModal = await page.locator('[role="dialog"], [class*="modal"], [class*="Modal"]').count() > 0;
        if (hasModal) {
          console.log('    📦 Modal detected');
          await savePageData(page, `modal-${buttonName}`);

          // 모달 닫기
          await page.keyboard.press('Escape');
          await sleep(1000);
        } else {
          // 뒤로가기
          await page.goBack().catch(() => {});
          await sleep(1000);
        }

      } catch (e) {
        console.log(`  ⚠️  Button error: ${e.message}`);
      }
    }

    console.log(`  ✅ Explored ${exploredCount} unique buttons`);

    // === STEP 8: 디자인 토큰 수집 ===
    console.log('\n🎨 STEP 8: Collecting Design Tokens');

    const tokens = await page.evaluate(() => {
      const collect = {
        colors: new Set(),
        gradients: new Set(),
        fontFamilies: new Set(),
        fontSizes: new Set(),
        fontWeights: new Set(),
        lineHeights: new Set(),
        spacing: new Set(),
        borderRadius: new Set(),
        boxShadows: new Set(),
        transitions: new Set()
      };

      document.querySelectorAll('*').forEach(el => {
        const style = window.getComputedStyle(el);

        if (style.color !== 'rgb(0, 0, 0)') collect.colors.add(style.color);
        if (style.backgroundColor !== 'rgba(0, 0, 0, 0)') collect.colors.add(style.backgroundColor);
        if (style.backgroundImage?.includes('gradient')) collect.gradients.add(style.backgroundImage);
        if (style.fontFamily) collect.fontFamilies.add(style.fontFamily);
        if (style.fontSize) collect.fontSizes.add(style.fontSize);
        if (style.fontWeight) collect.fontWeights.add(style.fontWeight);
        if (style.lineHeight !== 'normal') collect.lineHeights.add(style.lineHeight);

        ['padding', 'margin', 'gap'].forEach(prop => {
          if (style[prop] && style[prop] !== '0px' && style[prop] !== 'normal') {
            collect.spacing.add(style[prop]);
          }
        });

        if (style.borderRadius !== '0px') collect.borderRadius.add(style.borderRadius);
        if (style.boxShadow !== 'none') collect.boxShadows.add(style.boxShadow);
        if (style.transition && !style.transition.includes('all 0s')) {
          collect.transitions.add(style.transition);
        }
      });

      return {
        colors: Array.from(collect.colors).sort(),
        gradients: Array.from(collect.gradients),
        fontFamilies: Array.from(collect.fontFamilies),
        fontSizes: Array.from(collect.fontSizes).sort(),
        fontWeights: Array.from(collect.fontWeights).sort(),
        lineHeights: Array.from(collect.lineHeights).sort(),
        spacing: Array.from(collect.spacing).sort(),
        borderRadius: Array.from(collect.borderRadius).sort(),
        boxShadows: Array.from(collect.boxShadows),
        transitions: Array.from(collect.transitions)
      };
    });

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'tokens', 'complete-tokens.json'),
      JSON.stringify(tokens, null, 2),
      'utf-8'
    );

    console.log('\n✅ Comprehensive scraping completed!');
    console.log(`📸 Total screenshots: ${screenIndex}`);
    console.log(`📁 Output: ${OUTPUT_DIR}`);

  } catch (error) {
    console.error('\n❌ Error:', error);
    try {
      if (page && !page.isClosed()) {
        await captureScreen(page, 'error', 'Error State');
      }
    } catch (e) {}
  } finally {
    await sleep(3000);
    await browser.close();
  }
}

scrapeComprehensively();
