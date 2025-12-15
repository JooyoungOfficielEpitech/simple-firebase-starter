/**
 * Full App Scraper
 * Lumi 버튼 클릭 → 로그인 → 모든 화면 수집
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
  await page.screenshot({
    path: path.join(OUTPUT_DIR, 'screenshots', filename),
    fullPage: true
  });
  console.log(`  📸 [${screenIndex}] ${filename} ${description ? '- ' + description : ''}`);
  screenIndex++;
  return filename;
}

async function savePageData(page, pageName) {
  console.log(`  💾 Saving data: ${pageName}`);

  // HTML
  const html = await page.content();
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'source', `${pageName}.html`),
    html,
    'utf-8'
  );

  // Styles
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
            display: computed.display,
            position: computed.position,
            color: computed.color,
            bgColor: computed.backgroundColor,
            fontSize: computed.fontSize,
            fontWeight: computed.fontWeight,
            padding: computed.padding,
            margin: computed.margin,
            borderRadius: computed.borderRadius,
            boxShadow: computed.boxShadow,
            background: computed.background,
            backgroundImage: computed.backgroundImage,
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
}

async function scrapeFullApp() {
  console.log('🚀 Starting FULL app scraper (with Lumi button click)...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 200
  });

  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
    locale: 'ko-KR'
  });

  let page = await context.newPage();

  try {
    // 1. 초기 페이지 접속
    console.log('📱 Step 1: Accessing website...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await sleep(3000);

    await captureScreen(page, 'landing', 'Landing page (before Lumi click)');
    await savePageData(page, 'landing');

    // 2. "Lumi로 시작하기" 버튼 클릭 (새 창 열림)
    console.log('\n🔘 Step 2: Clicking "Lumi로 시작하기" button (will open new window)...');

    const lumiButton = await page.locator('button:has-text("Lumi로 시작하기")').first();

    if (await lumiButton.count() > 0) {
      console.log('  ✅ Found Lumi button, clicking and waiting for new window...');

      // 새 창이 열리는 것을 대기
      const [newPage] = await Promise.all([
        context.waitForEvent('page'), // 새 창 대기
        lumiButton.click() // 버튼 클릭
      ]);

      console.log('  ✅ New window opened!');
      await sleep(3000);

      // 이제부터 새 창(newPage)을 사용
      page = newPage;
      await page.waitForLoadState('networkidle');
      await sleep(2000);

      await captureScreen(page, 'new-window-opened', 'New window - initial state');
      await savePageData(page, 'new-window-opened');
    } else {
      console.log('  ❌ Lumi button not found!');
      throw new Error('Lumi button not found');
    }

    // 3. 로그인 폼 찾기 및 입력
    console.log('\n🔐 Step 3: Looking for login form...');
    await sleep(2000);

    // 다양한 방법으로 이메일 입력 찾기
    const emailSelectors = [
      'input[type="email"]',
      'input[name="email"]',
      'input[placeholder*="이메일"]',
      'input[placeholder*="email" i]',
      'input[autocomplete="email"]'
    ];

    let emailInput = null;
    for (const selector of emailSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        emailInput = page.locator(selector).first();
        console.log(`  ✅ Found email input: ${selector}`);
        break;
      }
    }

    // 비밀번호 입력 찾기
    const passwordSelectors = [
      'input[type="password"]',
      'input[name="password"]',
      'input[placeholder*="비밀번호"]',
      'input[autocomplete="current-password"]'
    ];

    let passwordInput = null;
    for (const selector of passwordSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        passwordInput = page.locator(selector).first();
        console.log(`  ✅ Found password input: ${selector}`);
        break;
      }
    }

    if (emailInput && passwordInput) {
      // 로그인 정보 입력
      console.log('\n📝 Step 4: Filling login credentials...');
      await emailInput.fill(CREDENTIALS.email);
      await sleep(500);
      await passwordInput.fill(CREDENTIALS.password);
      await sleep(500);

      await captureScreen(page, 'login-filled', 'Login form filled');

      // 로그인 버튼 찾기
      const loginButtonSelectors = [
        'button[type="submit"]',
        'button:has-text("로그인")',
        'button:has-text("Login")',
        'button:has-text("시작")',
        'button:has-text("계속")'
      ];

      let loginButton = null;
      for (const selector of loginButtonSelectors) {
        const count = await page.locator(selector).count();
        if (count > 0) {
          loginButton = page.locator(selector).first();
          const text = await loginButton.textContent();
          console.log(`  ✅ Found login button: "${text?.trim()}"`);
          break;
        }
      }

      if (loginButton) {
        console.log('\n🚀 Step 5: Clicking login button...');

        try {
          // 새 페이지가 열릴 수 있으므로 대기
          const pagePromise = context.waitForEvent('page', { timeout: 10000 }).catch(() => null);

          await loginButton.click();
          await sleep(2000);

          // 새 페이지가 열렸는지 확인
          const newLoginPage = await pagePromise;

          if (newLoginPage) {
            console.log('  ✅ New page opened after login!');
            page = newLoginPage;
            await page.waitForLoadState('networkidle').catch(() => {});
            await sleep(3000);
          } else {
            // 같은 페이지에서 로그인
            await sleep(3000);
          }

          // 페이지가 살아있는지 확인
          if (!page.isClosed()) {
            await captureScreen(page, 'logged-in', 'After successful login');
            await savePageData(page, 'logged-in');
            console.log('  ✅ Login successful!');
          } else {
            // 모든 페이지 확인
            const allPages = context.pages();
            console.log(`  ℹ️  Current page closed. Total pages: ${allPages.length}`);

            if (allPages.length > 0) {
              page = allPages[allPages.length - 1]; // 가장 최근 페이지 사용
              console.log(`  ✅ Switched to most recent page`);
              await sleep(2000);
              await captureScreen(page, 'logged-in', 'After successful login (new page)');
              await savePageData(page, 'logged-in');
            }
          }
        } catch (e) {
          console.log(`  ⚠️  Login error: ${e.message}`);
        }
      }
    } else {
      console.log('  ⚠️  Login form not found, continuing exploration...');
    }

    // 4. 모든 탭/네비게이션 탐색
    console.log('\n🗺️  Step 6: Exploring all navigation...');

    if (page.isClosed()) {
      console.log('  ⚠️  Page is closed, cannot explore navigation');
      return;
    }

    const exploreNavigation = async () => {
      // 하단 탭바 찾기 (다양한 방법 시도)
      const tabSelectors = [
        '[role="tab"]',
        '[role="tablist"] button',
        'nav button',
        '[class*="tab"] button',
        '[class*="Tab"] button',
        'footer button', // 하단 네비게이션
        'footer a',
        '[class*="navigation"] button',
        '[class*="Navigation"] button',
        'button[aria-label*="홈"]',
        'button[aria-label*="연습실"]',
        'button:has(svg)' // 아이콘이 있는 버튼
      ];

      let tabs = [];
      for (const selector of tabSelectors) {
        const found = await page.locator(selector).all();
        if (found.length > 0) {
          console.log(`  ✅ Found ${found.length} tabs with selector: ${selector}`);
          tabs = found;
          break;
        }
      }

      if (tabs.length === 0) {
        console.log(`  ⚠️  No navigation tabs found, trying alternative approach...`);

        // SVG 아이콘이 있는 요소 찾기 (보통 탭바)
        tabs = await page.locator('button:has(svg), a:has(svg)').all();
        console.log(`  Found ${tabs.length} buttons/links with SVG icons`);
      }

      console.log(`  Total navigation elements to explore: ${tabs.length}`);

      for (let i = 0; i < tabs.length; i++) {
        try {
          const tab = tabs[i];
          const text = await tab.textContent().catch(() => '');
          console.log(`\n  📍 Tab ${i + 1}: "${text?.trim()}"`);

          await tab.click();
          await sleep(2000);

          const screenName = `tab-${i}-${text?.trim().replace(/[^a-zA-Z0-9가-힣]/g, '_').substring(0, 20) || i}`;
          await captureScreen(page, screenName, `Tab: ${text?.trim()}`);
          await savePageData(page, screenName);

          // 각 탭에서 스크롤
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
          await sleep(1000);
          await captureScreen(page, `${screenName}-scrolled`, `Tab scrolled`);

        } catch (e) {
          console.log(`    ⚠️  Error on tab ${i}: ${e.message}`);
        }
      }
    };

    await exploreNavigation();

    // 5. 모든 버튼 찾아서 클릭
    console.log('\n🔘 Step 7: Exploring all clickable elements...');

    if (page.isClosed()) {
      console.log('  ⚠️  Page is closed, cannot explore buttons');
      return;
    }

    const buttons = await page.locator('button:not(:has-text("Lumi"))').all();
    console.log(`  Found ${buttons.length} buttons (excluding Lumi)`);

    for (let i = 0; i < Math.min(buttons.length, 50); i++) {
      try {
        if (page.isClosed()) break;

        const button = buttons[i];
        const text = await button.textContent().catch(() => '');
        const isVisible = await button.isVisible().catch(() => false);

        if (!isVisible) continue;

        console.log(`  🔘 Button ${i + 1}/${buttons.length}: "${text?.trim() || 'no text'}"`);

        await button.click();
        await sleep(2500);

        const screenName = `button-${i}-${text?.trim().replace(/[^a-zA-Z0-9가-힣]/g, '_').substring(0, 20)}`;
        await captureScreen(page, screenName, `Button: ${text?.trim()}`);

        // 모달 체크
        const hasModal = await page.locator('[role="dialog"], .modal, [class*="Modal"]').count() > 0;
        if (hasModal) {
          console.log('    📦 Modal detected!');
          await savePageData(page, `${screenName}-modal`);

          // 모달 닫기
          const closeBtn = await page.locator('[aria-label="Close"], [aria-label="닫기"], button:has-text("닫기"), button:has-text("×")').first();
          if (await closeBtn.count() > 0) {
            await closeBtn.click();
            await sleep(1000);
          } else {
            // ESC 키로 닫기 시도
            await page.keyboard.press('Escape');
            await sleep(1000);
          }
        }

        // 뒤로가기
        if (page.url() !== BASE_URL) {
          await page.goBack();
          await sleep(1000);
        }

      } catch (e) {
        console.log(`    ⚠️  Error: ${e.message}`);
      }
    }

    // 6. 전체 디자인 토큰 재수집
    console.log('\n🎨 Step 8: Collecting comprehensive design tokens...');

    const tokens = await page.evaluate(() => {
      const collect = {
        colors: new Set(),
        gradients: new Set(),
        fonts: new Set(),
        fontSizes: new Set(),
        fontWeights: new Set(),
        spacing: new Set(),
        borderRadius: new Set(),
        shadows: new Set(),
        transitions: new Set()
      };

      document.querySelectorAll('*').forEach(el => {
        const style = window.getComputedStyle(el);

        // Colors
        if (style.color && style.color !== 'rgb(0, 0, 0)') collect.colors.add(style.color);
        if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
          collect.colors.add(style.backgroundColor);
        }

        // Gradients
        if (style.backgroundImage?.includes('gradient')) {
          collect.gradients.add(style.backgroundImage);
        }

        // Typography
        if (style.fontFamily) collect.fonts.add(style.fontFamily);
        if (style.fontSize) collect.fontSizes.add(style.fontSize);
        if (style.fontWeight) collect.fontWeights.add(style.fontWeight);

        // Spacing
        ['padding', 'margin', 'gap'].forEach(prop => {
          if (style[prop] && style[prop] !== '0px' && style[prop] !== 'normal') {
            collect.spacing.add(style[prop]);
          }
        });

        // Border Radius
        if (style.borderRadius && style.borderRadius !== '0px') {
          collect.borderRadius.add(style.borderRadius);
        }

        // Box Shadow
        if (style.boxShadow && style.boxShadow !== 'none') {
          collect.shadows.add(style.boxShadow);
        }

        // Transitions
        if (style.transition && !style.transition.includes('all 0s')) {
          collect.transitions.add(style.transition);
        }
      });

      return {
        colors: Array.from(collect.colors).sort(),
        gradients: Array.from(collect.gradients),
        fonts: Array.from(collect.fonts),
        fontSizes: Array.from(collect.fontSizes).sort(),
        fontWeights: Array.from(collect.fontWeights).sort(),
        spacing: Array.from(collect.spacing).sort(),
        borderRadius: Array.from(collect.borderRadius).sort(),
        shadows: Array.from(collect.shadows),
        transitions: Array.from(collect.transitions)
      };
    });

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'tokens', 'full-app-tokens.json'),
      JSON.stringify(tokens, null, 2),
      'utf-8'
    );

    console.log('\n✅ Full app scraping completed!');
    console.log(`📸 Total screenshots: ${screenIndex}`);
    console.log(`📁 Output: ${OUTPUT_DIR}`);

  } catch (error) {
    console.error('\n❌ Error:', error);
    try {
      if (page && !page.isClosed()) {
        await captureScreen(page, 'error', 'Error state');
      }
    } catch (e) {
      console.log('Could not capture error screenshot');
    }
  } finally {
    await sleep(3000);
    await browser.close();
  }
}

scrapeFullApp();
