/**
 * Advanced Design Spec Scraper
 * 모든 화면과 인터랙션을 수집
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
const visitedUrls = new Set();
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
  console.log(`  📸 Captured: ${filename} ${description ? '- ' + description : ''}`);
  screenIndex++;
  return filename;
}

async function extractPageData(page, pageName) {
  console.log(`\n🔍 Extracting data for: ${pageName}`);

  // HTML 저장
  const html = await page.content();
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'source', `${pageName}.html`),
    html,
    'utf-8'
  );

  // 페이지별 상세 스타일 추출
  const pageStyles = await page.evaluate(() => {
    const elements = document.querySelectorAll('*');
    const styles = [];

    elements.forEach((el, idx) => {
      const computed = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();

      // 눈에 보이는 요소만
      if (rect.width > 0 && rect.height > 0) {
        styles.push({
          tag: el.tagName.toLowerCase(),
          id: el.id,
          classes: el.className,
          text: el.innerText?.substring(0, 100),
          position: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
          },
          styles: {
            display: computed.display,
            position: computed.position,
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            fontSize: computed.fontSize,
            fontWeight: computed.fontWeight,
            fontFamily: computed.fontFamily,
            padding: computed.padding,
            margin: computed.margin,
            borderRadius: computed.borderRadius,
            boxShadow: computed.boxShadow,
            transform: computed.transform,
            transition: computed.transition,
            animation: computed.animation
          }
        });
      }
    });

    return styles;
  });

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'source', `${pageName}-styles.json`),
    JSON.stringify(pageStyles, null, 2),
    'utf-8'
  );

  // 인터랙티브 요소들 추출
  const interactive = await page.evaluate(() => {
    const elements = {
      buttons: [],
      inputs: [],
      links: [],
      clickable: []
    };

    // Buttons
    document.querySelectorAll('button').forEach((btn, idx) => {
      const rect = btn.getBoundingClientRect();
      if (rect.width > 0) {
        elements.buttons.push({
          index: idx,
          text: btn.innerText?.trim(),
          classes: btn.className,
          position: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
        });
      }
    });

    // Inputs
    document.querySelectorAll('input, textarea').forEach((input, idx) => {
      const rect = input.getBoundingClientRect();
      if (rect.width > 0) {
        elements.inputs.push({
          index: idx,
          type: input.type,
          placeholder: input.placeholder,
          name: input.name,
          classes: input.className,
          position: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
        });
      }
    });

    // Links
    document.querySelectorAll('a').forEach((link, idx) => {
      const rect = link.getBoundingClientRect();
      if (rect.width > 0) {
        elements.links.push({
          index: idx,
          href: link.href,
          text: link.innerText?.trim(),
          classes: link.className,
          position: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
        });
      }
    });

    // Other clickable
    document.querySelectorAll('[onclick], [role="button"], .clickable, [class*="click"]').forEach((el, idx) => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && !el.matches('button, a, input')) {
        elements.clickable.push({
          index: idx,
          tag: el.tagName.toLowerCase(),
          text: el.innerText?.trim()?.substring(0, 50),
          classes: el.className,
          position: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
        });
      }
    });

    return elements;
  });

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'source', `${pageName}-interactive.json`),
    JSON.stringify(interactive, null, 2),
    'utf-8'
  );

  return interactive;
}

async function scrapeApp() {
  console.log('🚀 Starting advanced design spec scraper...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 100  // 천천히 실행
  });

  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
    locale: 'ko-KR'
  });

  const page = await context.newPage();

  try {
    // 1. 초기 접속
    console.log('📱 Accessing website...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await sleep(5000);  // React 앱 렌더링 대기

    // React root가 렌더링될 때까지 대기
    await page.waitForSelector('body', { state: 'attached' });
    await sleep(2000);

    await captureScreen(page, 'initial', 'Initial landing page');
    await extractPageData(page, '00-initial');

    // 2. 로그인 시도
    console.log('\n🔐 Attempting login...');

    // 이메일 입력 필드 찾기 (다양한 선택자 시도)
    const emailSelectors = [
      'input[type="email"]',
      'input[name="email"]',
      'input[placeholder*="이메일"]',
      'input[placeholder*="email"]',
      'input[id*="email"]'
    ];

    let emailInput = null;
    for (const selector of emailSelectors) {
      emailInput = await page.$(selector);
      if (emailInput) {
        console.log(`  Found email input: ${selector}`);
        break;
      }
    }

    // 비밀번호 입력 필드 찾기
    const passwordSelectors = [
      'input[type="password"]',
      'input[name="password"]',
      'input[placeholder*="비밀번호"]',
      'input[placeholder*="password"]'
    ];

    let passwordInput = null;
    for (const selector of passwordSelectors) {
      passwordInput = await page.$(selector);
      if (passwordInput) {
        console.log(`  Found password input: ${selector}`);
        break;
      }
    }

    if (emailInput && passwordInput) {
      await emailInput.fill(CREDENTIALS.email);
      await sleep(500);
      await passwordInput.fill(CREDENTIALS.password);
      await sleep(500);

      await captureScreen(page, 'login-filled', 'Login form filled');

      // 로그인 버튼 찾기 (Lumi 버튼 제외)
      const loginButtonSelectors = [
        'button[type="submit"]:not(:has-text("Lumi"))',
        'button:has-text("로그인")',
        'button:has-text("Login")',
        'button:has-text("시작")',
        '[role="button"]:has-text("로그인")'
      ];

      let loginButton = null;
      for (const selector of loginButtonSelectors) {
        try {
          loginButton = await page.$(selector);
          if (loginButton) {
            const text = await loginButton.innerText();
            if (!text.includes('Lumi')) {
              console.log(`  Found login button: ${selector} - "${text}"`);
              break;
            }
          }
        } catch (e) {}
      }

      if (loginButton) {
        await loginButton.click();
        console.log('  ✅ Login button clicked');
        await sleep(3000);

        await captureScreen(page, 'after-login', 'After login');
        await extractPageData(page, '01-after-login');
      } else {
        console.log('  ⚠️  Login button not found, proceeding without login');
      }
    } else {
      console.log('  ℹ️  No login form found, continuing exploration');
    }

    // 3. 모든 네비게이션 요소 탐색
    console.log('\n🗺️  Exploring all navigation elements...');

    // 탭바, 네비게이션 메뉴 등 찾기
    const navElements = await page.evaluate(() => {
      const navs = [];

      // 탭바 찾기
      const tabs = document.querySelectorAll('[role="tablist"] button, [class*="tab"] button, [class*="nav"] button');
      tabs.forEach((tab, idx) => {
        navs.push({
          type: 'tab',
          index: idx,
          text: tab.innerText?.trim(),
          selector: `[role="tablist"] button:nth-child(${idx + 1})`
        });
      });

      // 메뉴 아이템
      const menuItems = document.querySelectorAll('[role="menuitem"], [class*="menu"] a, [class*="menu"] button');
      menuItems.forEach((item, idx) => {
        navs.push({
          type: 'menu',
          index: idx,
          text: item.innerText?.trim()
        });
      });

      // 리스트 아이템
      const listItems = document.querySelectorAll('li a, li button, [role="listitem"]');
      listItems.forEach((item, idx) => {
        if (item.innerText?.trim()) {
          navs.push({
            type: 'list',
            index: idx,
            text: item.innerText.trim().substring(0, 50)
          });
        }
      });

      return navs;
    });

    console.log(`  Found ${navElements.length} navigation elements`);

    // 각 네비게이션 요소 클릭하며 탐색
    for (let i = 0; i < Math.min(navElements.length, 30); i++) {
      const nav = navElements[i];
      try {
        console.log(`\n  Navigating to: ${nav.type} - ${nav.text}`);

        if (nav.selector) {
          const element = await page.$(nav.selector);
          if (element) {
            await element.click();
            await sleep(2000);

            const screenName = `${nav.type}-${nav.text?.replace(/[^a-zA-Z0-9가-힣]/g, '_').substring(0, 30) || i}`;
            await captureScreen(page, screenName, `${nav.type}: ${nav.text}`);
            await extractPageData(page, `nav-${i}-${nav.type}`);
          }
        }
      } catch (e) {
        console.log(`    ⚠️  Error: ${e.message}`);
      }
    }

    // 4. 모든 버튼 클릭 (Lumi 제외)
    console.log('\n🔘 Exploring all buttons...');

    const buttons = await page.$$('button');
    for (let i = 0; i < Math.min(buttons.length, 20); i++) {
      try {
        const button = buttons[i];
        const text = await button.innerText().catch(() => '');

        if (text && !text.includes('Lumi')) {
          console.log(`  Clicking button: "${text}"`);

          await button.click();
          await sleep(2000);

          const screenName = `button-${text.replace(/[^a-zA-Z0-9가-힣]/g, '_').substring(0, 30)}`;
          await captureScreen(page, screenName, `Button: ${text}`);

          // 모달이나 팝업이 열렸는지 확인
          const hasModal = await page.evaluate(() => {
            return !!document.querySelector('[role="dialog"], .modal, [class*="popup"]');
          });

          if (hasModal) {
            console.log('    📦 Modal detected');
            await extractPageData(page, `modal-${i}`);

            // 모달 닫기
            const closeButton = await page.$('[aria-label="Close"], [class*="close"], button:has-text("닫기")');
            if (closeButton) {
              await closeButton.click();
              await sleep(1000);
            }
          }
        }
      } catch (e) {
        console.log(`    ⚠️  Error: ${e.message}`);
      }
    }

    // 5. 스크롤하며 모든 컨텐츠 캡처
    console.log('\n📜 Scrolling to capture all content...');

    const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
    const viewportHeight = 812;
    const scrollSteps = Math.ceil(scrollHeight / viewportHeight);

    for (let i = 0; i < Math.min(scrollSteps, 10); i++) {
      await page.evaluate(({ step, vpHeight }) => {
        window.scrollTo(0, step * vpHeight);
      }, { step: i, vpHeight: viewportHeight });

      await sleep(1000);
      await captureScreen(page, `scroll-${i}`, `Scroll position ${i}`);
    }

    // 6. 전체 디자인 토큰 수집
    console.log('\n🎨 Collecting comprehensive design tokens...');

    const comprehensiveTokens = await page.evaluate(() => {
      const tokens = {
        colors: new Set(),
        gradients: new Set(),
        fontFamilies: new Set(),
        fontSizes: new Set(),
        fontWeights: new Set(),
        lineHeights: new Set(),
        letterSpacings: new Set(),
        spacing: new Set(),
        borderRadius: new Set(),
        boxShadows: new Set(),
        transitions: new Set(),
        transforms: new Set()
      };

      document.querySelectorAll('*').forEach(el => {
        const computed = window.getComputedStyle(el);

        // Colors
        if (computed.color && computed.color !== 'rgb(0, 0, 0)') {
          tokens.colors.add(computed.color);
        }
        if (computed.backgroundColor && computed.backgroundColor !== 'rgba(0, 0, 0, 0)') {
          tokens.colors.add(computed.backgroundColor);
        }

        // Gradients
        if (computed.backgroundImage && computed.backgroundImage.includes('gradient')) {
          tokens.gradients.add(computed.backgroundImage);
        }

        // Typography
        if (computed.fontFamily) tokens.fontFamilies.add(computed.fontFamily);
        if (computed.fontSize) tokens.fontSizes.add(computed.fontSize);
        if (computed.fontWeight) tokens.fontWeights.add(computed.fontWeight);
        if (computed.lineHeight && computed.lineHeight !== 'normal') {
          tokens.lineHeights.add(computed.lineHeight);
        }
        if (computed.letterSpacing && computed.letterSpacing !== 'normal') {
          tokens.letterSpacings.add(computed.letterSpacing);
        }

        // Spacing
        ['padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
         'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'gap'].forEach(prop => {
          const value = computed[prop];
          if (value && value !== '0px' && value !== 'normal') {
            tokens.spacing.add(value);
          }
        });

        // Border Radius
        if (computed.borderRadius && computed.borderRadius !== '0px') {
          tokens.borderRadius.add(computed.borderRadius);
        }

        // Box Shadow
        if (computed.boxShadow && computed.boxShadow !== 'none') {
          tokens.boxShadows.add(computed.boxShadow);
        }

        // Transitions
        if (computed.transition && computed.transition !== 'all 0s ease 0s') {
          tokens.transitions.add(computed.transition);
        }

        // Transforms
        if (computed.transform && computed.transform !== 'none') {
          tokens.transforms.add(computed.transform);
        }
      });

      return {
        colors: Array.from(tokens.colors).sort(),
        gradients: Array.from(tokens.gradients).sort(),
        fontFamilies: Array.from(tokens.fontFamilies).sort(),
        fontSizes: Array.from(tokens.fontSizes).sort(),
        fontWeights: Array.from(tokens.fontWeights).sort(),
        lineHeights: Array.from(tokens.lineHeights).sort(),
        letterSpacings: Array.from(tokens.letterSpacings).sort(),
        spacing: Array.from(tokens.spacing).sort(),
        borderRadius: Array.from(tokens.borderRadius).sort(),
        boxShadows: Array.from(tokens.boxShadows).sort(),
        transitions: Array.from(tokens.transitions).sort(),
        transforms: Array.from(tokens.transforms).sort()
      };
    });

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'tokens', 'comprehensive-tokens.json'),
      JSON.stringify(comprehensiveTokens, null, 2),
      'utf-8'
    );

    console.log('\n✅ Advanced scraping completed!');
    console.log(`📸 Total screenshots: ${screenIndex}`);
    console.log(`📁 Output directory: ${OUTPUT_DIR}`);

  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    await sleep(2000);
    await browser.close();
  }
}

scrapeApp();
