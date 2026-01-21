#!/usr/bin/env node
/**
 * Code Generator CLI
 * 코드 생성 CLI 도구
 *
 * 사용법: node scripts/generators/index.js <type> <name> [options]
 */

const { spawn } = require("child_process");
const path = require("path");

const GENERATORS = {
  component: "component.js",
  screen: "screen.js",
  service: "service.js",
  function: "function.js",
  i18n: "i18n.js",
};

function printHelp() {
  console.log(`
📦 Fast-Matching Code Generator
================================

사용법:
  node scripts/generators/index.js <type> <name> [options]
  npm run generate <type> <name> [options]

생성기 타입:
  component   새 컴포넌트 생성
  screen      새 스크린 생성
  service     새 서비스 생성
  function    새 Cloud Function 생성
  i18n        새 번역 키 추가 (모든 언어 파일)

예시:
  npm run generate component MyButton --variant --size
  npm run generate screen UserProfile --detail
  npm run generate service Product --firestore
  npm run generate function SendEmail --http
  npm run generate i18n common loading --value "Loading..."

각 생성기의 상세 옵션은 다음을 실행하세요:
  node scripts/generators/<type>.js --help
`);
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    printHelp();
    process.exit(0);
  }

  const generatorType = args[0].toLowerCase();
  const generatorFile = GENERATORS[generatorType];

  if (!generatorFile) {
    console.error(`❌ 알 수 없는 생성기 타입: ${generatorType}`);
    console.error(`사용 가능한 타입: ${Object.keys(GENERATORS).join(", ")}`);
    process.exit(1);
  }

  const generatorPath = path.join(__dirname, generatorFile);
  const generatorArgs = args.slice(1);

  const child = spawn("node", [generatorPath, ...generatorArgs], {
    stdio: "inherit",
    cwd: process.cwd(),
  });

  child.on("close", (code) => {
    process.exit(code);
  });
}

main();
