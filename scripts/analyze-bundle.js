#!/usr/bin/env node
/**
 * Bundle Size Analyzer
 * React Native 번들 사이즈를 분석하고 최적화 제안을 제공
 *
 * 사용법: node scripts/analyze-bundle.js [--json] [--threshold <kb>]
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const THRESHOLDS = {
  bundleSize: 15 * 1024 * 1024, // 15MB warning
  criticalSize: 20 * 1024 * 1024, // 20MB critical
};

const ANALYSIS_DIR = path.join(__dirname, "../bundle-analysis");

/**
 * 번들 분석 실행
 */
async function analyzeBundles() {
  console.log("📦 Bundle Size Analysis\n");
  console.log("=".repeat(50));

  // bundle-analysis 디렉토리 확인
  if (!fs.existsSync(ANALYSIS_DIR)) {
    fs.mkdirSync(ANALYSIS_DIR, { recursive: true });
  }

  // Metro 번들 생성 (분석용)
  console.log("\n🔍 Analyzing iOS bundle...");
  try {
    const iosBundlePath = path.join(ANALYSIS_DIR, "ios-bundle.js");
    execSync(
      `npx react-native bundle --platform ios --dev false --entry-file index.tsx --bundle-output ${iosBundlePath} --assets-dest ${ANALYSIS_DIR}/ios-assets 2>/dev/null`,
      { stdio: "pipe" }
    );

    const iosStats = fs.statSync(iosBundlePath);
    console.log(`  iOS Bundle: ${formatSize(iosStats.size)}`);
    checkThreshold("iOS", iosStats.size);
  } catch (error) {
    console.log("  ⚠️  iOS bundle analysis skipped (build environment required)");
  }

  console.log("\n🔍 Analyzing Android bundle...");
  try {
    const androidBundlePath = path.join(ANALYSIS_DIR, "android-bundle.js");
    execSync(
      `npx react-native bundle --platform android --dev false --entry-file index.tsx --bundle-output ${androidBundlePath} --assets-dest ${ANALYSIS_DIR}/android-assets 2>/dev/null`,
      { stdio: "pipe" }
    );

    const androidStats = fs.statSync(androidBundlePath);
    console.log(`  Android Bundle: ${formatSize(androidStats.size)}`);
    checkThreshold("Android", androidStats.size);
  } catch (error) {
    console.log("  ⚠️  Android bundle analysis skipped (build environment required)");
  }

  // Dependencies 분석
  console.log("\n📊 Dependency Analysis\n");
  analyzeDependencies();

  // 최적화 제안
  console.log("\n💡 Optimization Suggestions\n");
  printOptimizationSuggestions();
}

/**
 * 의존성 분석
 */
function analyzeDependencies() {
  const packageJsonPath = path.join(__dirname, "../package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

  const deps = {
    ...packageJson.dependencies,
  };

  const largeDeps = [];

  // node_modules에서 각 패키지 크기 측정
  Object.keys(deps).forEach((dep) => {
    const depPath = path.join(__dirname, "../node_modules", dep);
    if (fs.existsSync(depPath)) {
      try {
        const size = getDirectorySize(depPath);
        if (size > 1024 * 1024) {
          // 1MB 이상
          largeDeps.push({ name: dep, size });
        }
      } catch (e) {
        // Skip
      }
    }
  });

  // 크기순 정렬
  largeDeps.sort((a, b) => b.size - a.size);

  console.log("Largest dependencies (>1MB):");
  largeDeps.slice(0, 10).forEach((dep, i) => {
    console.log(`  ${i + 1}. ${dep.name}: ${formatSize(dep.size)}`);
  });
}

/**
 * 디렉토리 크기 계산
 */
function getDirectorySize(dirPath) {
  let size = 0;
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      size += getDirectorySize(filePath);
    } else {
      size += stats.size;
    }
  }

  return size;
}

/**
 * 크기 포맷팅
 */
function formatSize(bytes) {
  const units = ["B", "KB", "MB", "GB"];
  let unitIndex = 0;
  let size = bytes;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * 임계값 확인
 */
function checkThreshold(platform, size) {
  if (size > THRESHOLDS.criticalSize) {
    console.log(`  ❌ ${platform} bundle exceeds critical threshold!`);
  } else if (size > THRESHOLDS.bundleSize) {
    console.log(`  ⚠️  ${platform} bundle exceeds warning threshold`);
  } else {
    console.log(`  ✅ ${platform} bundle size is healthy`);
  }
}

/**
 * 최적화 제안 출력
 */
function printOptimizationSuggestions() {
  const suggestions = [
    {
      title: "Tree Shaking",
      description: "Import only what you need from libraries",
      example: "import { Button } from 'react-native' // instead of * as RN",
    },
    {
      title: "Dynamic Imports",
      description: "Use React.lazy() for code splitting",
      example: "const Screen = React.lazy(() => import('./Screen'))",
    },
    {
      title: "Image Optimization",
      description: "Use WebP format and proper sizing",
      example: "expo-image for optimized loading",
    },
    {
      title: "Remove Unused Dependencies",
      description: "Audit and remove unused packages",
      example: "npx depcheck",
    },
    {
      title: "Hermes Engine",
      description: "Ensure Hermes is enabled for better performance",
      example: "Check app.json: jsEngine: 'hermes'",
    },
  ];

  suggestions.forEach((s, i) => {
    console.log(`${i + 1}. ${s.title}`);
    console.log(`   ${s.description}`);
    console.log(`   Example: ${s.example}\n`);
  });
}

// 실행
analyzeBundles().catch(console.error);
