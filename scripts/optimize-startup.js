#!/usr/bin/env node
/**
 * App Startup Optimization Checker
 * 앱 시작 속도 최적화 상태를 확인하고 제안 제공
 *
 * 사용법: node scripts/optimize-startup.js
 */

const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.join(__dirname, "..");

/**
 * 최적화 체크리스트
 */
const CHECKLIST = [
  {
    name: "Hermes Engine",
    check: checkHermes,
    recommendation: "Enable Hermes for faster JS execution",
  },
  {
    name: "Inline Requires",
    check: checkInlineRequires,
    recommendation: "Enable inline requires in metro.config.js",
  },
  {
    name: "RAM Bundles",
    check: checkRamBundles,
    recommendation: "Consider RAM bundles for large apps",
  },
  {
    name: "Lazy Loading",
    check: checkLazyLoading,
    recommendation: "Use React.lazy() for screen components",
  },
  {
    name: "Firebase Initialization",
    check: checkFirebaseInit,
    recommendation: "Defer non-critical Firebase services",
  },
  {
    name: "Image Preloading",
    check: checkImagePreloading,
    recommendation: "Preload critical images on splash",
  },
];

/**
 * Hermes 활성화 확인
 */
function checkHermes() {
  const appJsonPath = path.join(ROOT_DIR, "app.json");
  const appConfigPath = path.join(ROOT_DIR, "app.config.ts");

  let enabled = false;

  if (fs.existsSync(appJsonPath)) {
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf-8"));
    enabled = appJson.expo?.jsEngine === "hermes";
  }

  if (fs.existsSync(appConfigPath)) {
    const content = fs.readFileSync(appConfigPath, "utf-8");
    enabled = enabled || content.includes('jsEngine: "hermes"');
  }

  return {
    passed: enabled,
    details: enabled ? "Hermes is enabled" : "Hermes is not enabled",
  };
}

/**
 * Inline Requires 확인
 */
function checkInlineRequires() {
  const metroConfigPath = path.join(ROOT_DIR, "metro.config.js");

  if (!fs.existsSync(metroConfigPath)) {
    return { passed: false, details: "metro.config.js not found" };
  }

  const content = fs.readFileSync(metroConfigPath, "utf-8");
  const hasInlineRequires = content.includes("inlineRequires");

  return {
    passed: hasInlineRequires,
    details: hasInlineRequires
      ? "Inline requires is configured"
      : "Inline requires not configured",
  };
}

/**
 * RAM Bundles 확인
 */
function checkRamBundles() {
  // RAM bundles는 Expo에서는 자동 처리됨
  return {
    passed: true,
    details: "Expo handles RAM bundle optimization",
  };
}

/**
 * Lazy Loading 확인
 */
function checkLazyLoading() {
  const navigatorDir = path.join(ROOT_DIR, "app/navigators");

  if (!fs.existsSync(navigatorDir)) {
    return { passed: false, details: "Navigators directory not found" };
  }

  const files = fs.readdirSync(navigatorDir);
  let hasLazyLoading = false;

  for (const file of files) {
    if (file.endsWith(".tsx")) {
      const content = fs.readFileSync(path.join(navigatorDir, file), "utf-8");
      if (content.includes("React.lazy") || content.includes("lazy(")) {
        hasLazyLoading = true;
        break;
      }
    }
  }

  return {
    passed: hasLazyLoading,
    details: hasLazyLoading
      ? "Lazy loading is used in navigators"
      : "Consider using React.lazy for screen components",
  };
}

/**
 * Firebase 초기화 확인
 */
function checkFirebaseInit() {
  const appPath = path.join(ROOT_DIR, "app/app.tsx");

  if (!fs.existsSync(appPath)) {
    return { passed: true, details: "app.tsx not found" };
  }

  const content = fs.readFileSync(appPath, "utf-8");
  const hasEarlyFirebase = content.indexOf("firebase") < content.indexOf("return");

  return {
    passed: !hasEarlyFirebase || content.includes("useEffect"),
    details: hasEarlyFirebase
      ? "Firebase initialized early - consider deferring"
      : "Firebase initialization appears deferred",
  };
}

/**
 * 이미지 프리로딩 확인
 */
function checkImagePreloading() {
  // expo-asset 또는 Image.prefetch 사용 확인
  const utilsDir = path.join(ROOT_DIR, "app/utils");

  if (!fs.existsSync(utilsDir)) {
    return { passed: false, details: "Utils directory not found" };
  }

  const files = fs.readdirSync(utilsDir);
  let hasPreloading = false;

  for (const file of files) {
    if (file.endsWith(".ts") || file.endsWith(".tsx")) {
      const content = fs.readFileSync(path.join(utilsDir, file), "utf-8");
      if (content.includes("prefetch") || content.includes("Asset.loadAsync")) {
        hasPreloading = true;
        break;
      }
    }
  }

  return {
    passed: hasPreloading,
    details: hasPreloading
      ? "Image preloading is configured"
      : "Consider preloading critical images",
  };
}

/**
 * 분석 실행
 */
function analyze() {
  console.log("🚀 Startup Optimization Analysis\n");
  console.log("=".repeat(50));

  let passedCount = 0;
  const results = [];

  CHECKLIST.forEach((item) => {
    const result = item.check();
    const status = result.passed ? "✅" : "⚠️";

    console.log(`\n${status} ${item.name}`);
    console.log(`   ${result.details}`);

    if (!result.passed) {
      console.log(`   💡 ${item.recommendation}`);
    } else {
      passedCount++;
    }

    results.push({
      name: item.name,
      ...result,
      recommendation: item.recommendation,
    });
  });

  console.log("\n" + "=".repeat(50));
  console.log(`\n📊 Score: ${passedCount}/${CHECKLIST.length} checks passed`);

  if (passedCount === CHECKLIST.length) {
    console.log("🎉 Your app is well-optimized for fast startup!");
  } else {
    console.log("\n🔧 Apply the recommendations above to improve startup time.");
  }

  // 추가 팁
  console.log("\n💡 Additional Tips:");
  console.log("   1. Profile with Flipper Performance plugin");
  console.log("   2. Use React DevTools Profiler to find slow components");
  console.log("   3. Measure cold start time on real devices");
  console.log("   4. Consider using react-native-fast-image for images");
  console.log("   5. Minimize synchronous operations in app initialization");
}

analyze();
