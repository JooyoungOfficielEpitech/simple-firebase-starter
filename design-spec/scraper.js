/**
 * Design Spec Scraper
 * Playwright를 사용해 웹사이트의 모든 디자인 정보를 수집
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

async function scrapeDesignSpec() {
  console.log('🚀 Starting design spec scraper...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 }, // iPhone X size
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
  });

  const page = await context.newPage();

  try {
    // 1. 웹사이트 접속
    console.log('📱 Accessing website...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // 초기 화면 캡처
    await page.screenshot({
      path: path.join(OUTPUT_DIR, 'screenshots', '00-initial-page.png'),
      fullPage: true
    });

    // 2. HTML 소스 저장
    console.log('💾 Saving HTML source...');
    const html = await page.content();
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'source', 'index.html'),
      html,
      'utf-8'
    );

    // 3. 모든 CSS 추출
    console.log('🎨 Extracting CSS...');
    const styles = await page.evaluate(() => {
      const allStyles = [];

      // Inline styles
      const styleSheets = Array.from(document.styleSheets);
      styleSheets.forEach((sheet, index) => {
        try {
          const rules = Array.from(sheet.cssRules || sheet.rules || []);
          const css = rules.map(rule => rule.cssText).join('\n');
          allStyles.push({ type: 'stylesheet', index, css });
        } catch (e) {
          console.log('Cannot access stylesheet:', e);
        }
      });

      // Computed styles for all elements
      const elements = document.querySelectorAll('*');
      const computedStyles = {};
      elements.forEach((el, idx) => {
        const tagName = el.tagName.toLowerCase();
        const className = el.className;
        const id = el.id;
        const key = `${tagName}${id ? '#' + id : ''}${className ? '.' + className.split(' ').join('.') : ''}_${idx}`;

        const computed = window.getComputedStyle(el);
        computedStyles[key] = {
          tag: tagName,
          id: id,
          classes: className,
          styles: {
            // Layout
            display: computed.display,
            position: computed.position,
            width: computed.width,
            height: computed.height,
            margin: computed.margin,
            padding: computed.padding,

            // Typography
            fontFamily: computed.fontFamily,
            fontSize: computed.fontSize,
            fontWeight: computed.fontWeight,
            lineHeight: computed.lineHeight,
            letterSpacing: computed.letterSpacing,
            textAlign: computed.textAlign,
            color: computed.color,

            // Background
            background: computed.background,
            backgroundColor: computed.backgroundColor,

            // Border
            border: computed.border,
            borderRadius: computed.borderRadius,

            // Flexbox
            flexDirection: computed.flexDirection,
            justifyContent: computed.justifyContent,
            alignItems: computed.alignItems,
            gap: computed.gap,

            // Transform & Animation
            transform: computed.transform,
            transition: computed.transition,
            animation: computed.animation,

            // Others
            opacity: computed.opacity,
            zIndex: computed.zIndex,
            overflow: computed.overflow,
            boxShadow: computed.boxShadow
          }
        };
      });

      return { allStyles, computedStyles };
    });

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'source', 'styles.json'),
      JSON.stringify(styles, null, 2),
      'utf-8'
    );

    // 4. 모든 JavaScript 추출
    console.log('⚡ Extracting JavaScript...');
    const scripts = await page.evaluate(() => {
      const allScripts = [];
      document.querySelectorAll('script').forEach((script, index) => {
        allScripts.push({
          index,
          src: script.src,
          content: script.innerHTML,
          type: script.type
        });
      });
      return allScripts;
    });

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'source', 'scripts.json'),
      JSON.stringify(scripts, null, 2),
      'utf-8'
    );

    // 5. 애니메이션 감지
    console.log('✨ Detecting animations...');
    const animations = await page.evaluate(() => {
      const animationData = {
        cssAnimations: [],
        transitions: [],
        transforms: []
      };

      // CSS Animations
      const styleSheets = Array.from(document.styleSheets);
      styleSheets.forEach(sheet => {
        try {
          const rules = Array.from(sheet.cssRules || []);
          rules.forEach(rule => {
            if (rule instanceof CSSKeyframesRule) {
              const keyframes = Array.from(rule.cssRules).map(kf => ({
                keyText: kf.keyText,
                style: kf.style.cssText
              }));
              animationData.cssAnimations.push({
                name: rule.name,
                keyframes
              });
            }
          });
        } catch (e) {}
      });

      // Elements with transitions/animations
      document.querySelectorAll('*').forEach(el => {
        const computed = window.getComputedStyle(el);

        if (computed.animation !== 'none') {
          animationData.transitions.push({
            element: el.tagName.toLowerCase(),
            class: el.className,
            animation: computed.animation
          });
        }

        if (computed.transition !== 'all 0s ease 0s') {
          animationData.transitions.push({
            element: el.tagName.toLowerCase(),
            class: el.className,
            transition: computed.transition
          });
        }

        if (computed.transform !== 'none') {
          animationData.transforms.push({
            element: el.tagName.toLowerCase(),
            class: el.className,
            transform: computed.transform
          });
        }
      });

      return animationData;
    });

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'animations', 'animations.json'),
      JSON.stringify(animations, null, 2),
      'utf-8'
    );

    // 6. 로그인 시도 (로그인 폼이 있는 경우)
    console.log('🔐 Checking for login form...');
    const hasLoginForm = await page.evaluate(() => {
      const emailInput = document.querySelector('input[type="email"], input[name="email"]');
      const passwordInput = document.querySelector('input[type="password"]');
      return !!(emailInput && passwordInput);
    });

    if (hasLoginForm) {
      console.log('📝 Login form detected, attempting login...');
      await page.fill('input[type="email"], input[name="email"]', CREDENTIALS.email);
      await page.fill('input[type="password"]', CREDENTIALS.password);

      // Submit button 찾기
      const submitButton = await page.locator('button[type="submit"], button:has-text("로그인"), button:has-text("Login")').first();
      if (submitButton) {
        await submitButton.click();
        await page.waitForTimeout(3000);

        // 로그인 후 화면 캡처
        await page.screenshot({
          path: path.join(OUTPUT_DIR, 'screenshots', '01-after-login.png'),
          fullPage: true
        });
      }
    }

    // 7. 모든 링크와 버튼 찾기 (네비게이션 맵핑)
    console.log('🗺️  Mapping navigation...');
    const navigation = await page.evaluate(() => {
      const nav = {
        links: [],
        buttons: [],
        clickableElements: []
      };

      // Links
      document.querySelectorAll('a').forEach((link, idx) => {
        nav.links.push({
          index: idx,
          href: link.href,
          text: link.innerText?.trim(),
          classes: link.className
        });
      });

      // Buttons
      document.querySelectorAll('button').forEach((btn, idx) => {
        nav.buttons.push({
          index: idx,
          text: btn.innerText?.trim(),
          classes: btn.className,
          type: btn.type
        });
      });

      // Other clickable elements
      document.querySelectorAll('[onclick], [role="button"]').forEach((el, idx) => {
        nav.clickableElements.push({
          index: idx,
          tag: el.tagName.toLowerCase(),
          text: el.innerText?.trim()?.substring(0, 50),
          classes: el.className
        });
      });

      return nav;
    });

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'source', 'navigation.json'),
      JSON.stringify(navigation, null, 2),
      'utf-8'
    );

    // 8. 각 링크/버튼 클릭하면서 모든 화면 캡처
    console.log('📸 Capturing all screens...');
    let screenIndex = 2;

    // 클릭 가능한 요소들 순회
    const clickableSelectors = [
      'a[href]',
      'button',
      '[role="button"]',
      '[onclick]'
    ];

    for (const selector of clickableSelectors) {
      const elements = await page.$$(selector);

      for (let i = 0; i < Math.min(elements.length, 20); i++) {  // 최대 20개까지만
        try {
          const element = elements[i];
          const text = await element.innerText().catch(() => '');
          const screenshot_name = `${String(screenIndex).padStart(2, '0')}-${selector.replace(/\[|\]/g, '')}-${text?.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '_') || i}.png`;

          console.log(`  Clicking: ${selector} [${i}] - ${text?.substring(0, 30)}`);

          await element.click();
          await page.waitForTimeout(1500);

          await page.screenshot({
            path: path.join(OUTPUT_DIR, 'screenshots', screenshot_name),
            fullPage: true
          });

          screenIndex++;

          // 뒤로가기 (가능한 경우)
          if (await page.url() !== BASE_URL) {
            await page.goBack();
            await page.waitForTimeout(1000);
          }
        } catch (e) {
          console.log(`  ⚠️  Error clicking element: ${e.message}`);
        }
      }
    }

    // 9. 디자인 토큰 추출
    console.log('🎨 Extracting design tokens...');
    const designTokens = await page.evaluate(() => {
      const tokens = {
        colors: new Set(),
        fontFamilies: new Set(),
        fontSizes: new Set(),
        fontWeights: new Set(),
        spacing: new Set(),
        borderRadius: new Set(),
        boxShadows: new Set()
      };

      document.querySelectorAll('*').forEach(el => {
        const computed = window.getComputedStyle(el);

        // Colors
        if (computed.color) tokens.colors.add(computed.color);
        if (computed.backgroundColor && computed.backgroundColor !== 'rgba(0, 0, 0, 0)') {
          tokens.colors.add(computed.backgroundColor);
        }

        // Typography
        if (computed.fontFamily) tokens.fontFamilies.add(computed.fontFamily);
        if (computed.fontSize) tokens.fontSizes.add(computed.fontSize);
        if (computed.fontWeight) tokens.fontWeights.add(computed.fontWeight);

        // Spacing
        if (computed.padding && computed.padding !== '0px') tokens.spacing.add(computed.padding);
        if (computed.margin && computed.margin !== '0px') tokens.spacing.add(computed.margin);
        if (computed.gap && computed.gap !== 'normal') tokens.spacing.add(computed.gap);

        // Border Radius
        if (computed.borderRadius && computed.borderRadius !== '0px') {
          tokens.borderRadius.add(computed.borderRadius);
        }

        // Box Shadow
        if (computed.boxShadow && computed.boxShadow !== 'none') {
          tokens.boxShadows.add(computed.boxShadow);
        }
      });

      return {
        colors: Array.from(tokens.colors).sort(),
        fontFamilies: Array.from(tokens.fontFamilies).sort(),
        fontSizes: Array.from(tokens.fontSizes).sort(),
        fontWeights: Array.from(tokens.fontWeights).sort(),
        spacing: Array.from(tokens.spacing).sort(),
        borderRadius: Array.from(tokens.borderRadius).sort(),
        boxShadows: Array.from(tokens.boxShadows).sort()
      };
    });

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'tokens', 'design-tokens.json'),
      JSON.stringify(designTokens, null, 2),
      'utf-8'
    );

    // 10. 컴포넌트 구조 분석
    console.log('🧩 Analyzing component structure...');
    const componentStructure = await page.evaluate(() => {
      const structure = [];

      function analyzeElement(el, depth = 0) {
        if (depth > 5) return null;  // 깊이 제한

        const computed = window.getComputedStyle(el);
        const children = Array.from(el.children);

        return {
          tag: el.tagName.toLowerCase(),
          id: el.id || undefined,
          classes: el.className || undefined,
          text: el.innerText?.substring(0, 100) || undefined,
          styles: {
            display: computed.display,
            position: computed.position,
            flexDirection: computed.flexDirection,
            justifyContent: computed.justifyContent,
            alignItems: computed.alignItems
          },
          children: children.map(child => analyzeElement(child, depth + 1)).filter(Boolean)
        };
      }

      const root = document.querySelector('#root, #app, body > div') || document.body;
      return analyzeElement(root);
    });

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'components', 'structure.json'),
      JSON.stringify(componentStructure, null, 2),
      'utf-8'
    );

    console.log('\n✅ Design spec scraping completed!');
    console.log(`📁 Output directory: ${OUTPUT_DIR}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

scrapeDesignSpec();
