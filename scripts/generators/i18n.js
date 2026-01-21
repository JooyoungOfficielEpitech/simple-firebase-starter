#!/usr/bin/env node
/**
 * i18n Key Generator
 * 모든 언어 파일에 번역 키를 추가하는 스크립트
 *
 * 사용법: node scripts/generators/i18n.js <namespace> <key> [--value "English value"]
 * 예시: node scripts/generators/i18n.js common loading --value "Loading..."
 */

const fs = require("fs");
const path = require("path");

const I18N_DIR = path.resolve(__dirname, "../../app/i18n");

const LANGUAGES = {
  en: "English",
  ko: "Korean",
  ja: "Japanese",
  es: "Spanish",
  fr: "French",
  ar: "Arabic",
  hi: "Hindi",
};

// 언어별 기본 번역 (placeholder)
const getDefaultTranslation = (lang, key, englishValue) => {
  const placeholders = {
    en: englishValue || `[${key}]`,
    ko: `[${key}_KO]`,
    ja: `[${key}_JA]`,
    es: `[${key}_ES]`,
    fr: `[${key}_FR]`,
    ar: `[${key}_AR]`,
    hi: `[${key}_HI]`,
  };
  return placeholders[lang] || `[${key}]`;
};

// 파일 내용 파싱 (간단한 방식)
function parseI18nFile(content) {
  // const xx = { ... } 형태에서 객체 부분만 추출
  const match = content.match(/const \w+ = (\{[\s\S]*\});?\s*export/);
  if (match) {
    try {
      // eval 대신 Function 사용 (더 안전)
      return eval(`(${match[1]})`);
    } catch (e) {
      return null;
    }
  }
  return null;
}

// 객체를 TypeScript 문자열로 변환
function objectToString(obj, indent = 2) {
  const spaces = " ".repeat(indent);
  let result = "{\n";

  const entries = Object.entries(obj);
  entries.forEach(([key, value], index) => {
    const isLast = index === entries.length - 1;
    const comma = isLast ? "" : ",";

    if (typeof value === "object" && value !== null) {
      result += `${spaces}${key}: ${objectToString(value, indent + 2)}${comma}\n`;
    } else if (typeof value === "string") {
      // 문자열 이스케이프
      const escapedValue = value.replace(/"/g, '\\"').replace(/\n/g, "\\n");
      result += `${spaces}${key}: "${escapedValue}"${comma}\n`;
    } else {
      result += `${spaces}${key}: ${value}${comma}\n`;
    }
  });

  result += " ".repeat(indent - 2) + "}";
  return result;
}

// 네임스페이스에 키 추가
function addKeyToNamespace(obj, namespace, key, value) {
  if (!obj[namespace]) {
    obj[namespace] = {};
  }

  // 중첩 키 지원 (예: "hero.title")
  const keyParts = key.split(".");
  let current = obj[namespace];

  for (let i = 0; i < keyParts.length - 1; i++) {
    if (!current[keyParts[i]]) {
      current[keyParts[i]] = {};
    }
    current = current[keyParts[i]];
  }

  current[keyParts[keyParts.length - 1]] = value;
  return obj;
}

// i18n 파일 업데이트
function updateI18nFile(lang, namespace, key, value) {
  const filePath = path.join(I18N_DIR, `${lang}.ts`);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ 파일을 찾을 수 없습니다: ${filePath}`);
    return false;
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const parsed = parseI18nFile(content);

  if (!parsed) {
    console.error(`❌ 파일 파싱 실패: ${filePath}`);
    return false;
  }

  // 키 추가
  const updated = addKeyToNamespace(parsed, namespace, key, value);

  // 파일 다시 작성
  const newContent = `const ${lang} = ${objectToString(updated)};

export default ${lang};
`;

  fs.writeFileSync(filePath, newContent, "utf-8");
  return true;
}

// 메인 실행
function main() {
  const args = process.argv.slice(2);

  if (args.length < 2 || args[0] === "--help" || args[0] === "-h") {
    console.log(`
📝 i18n Key Generator
=====================

사용법:
  node scripts/generators/i18n.js <namespace> <key> [options]
  npm run generate i18n <namespace> <key> [options]

옵션:
  --value "text"    영어 기본값 설정
  --all-values      모든 언어에 대해 값 입력 (대화형)

예시:
  npm run generate i18n common loading --value "Loading..."
  npm run generate i18n userProfile title --value "User Profile"
  npm run generate i18n errors.network timeout --value "Connection timed out"

지원 언어: ${Object.entries(LANGUAGES).map(([code, name]) => `${code} (${name})`).join(", ")}
`);
    process.exit(0);
  }

  const namespace = args[0];
  const key = args[1];

  // --value 옵션 파싱
  let englishValue = null;
  const valueIndex = args.indexOf("--value");
  if (valueIndex !== -1 && args[valueIndex + 1]) {
    englishValue = args[valueIndex + 1];
  }

  console.log(`\n🌍 i18n 키 추가: ${namespace}.${key}\n`);

  let successCount = 0;
  const results = [];

  for (const lang of Object.keys(LANGUAGES)) {
    const value = getDefaultTranslation(lang, key, englishValue);
    const success = updateI18nFile(lang, namespace, key, value);

    if (success) {
      successCount++;
      results.push(`  ✅ ${lang}.ts: "${value}"`);
    } else {
      results.push(`  ❌ ${lang}.ts: 실패`);
    }
  }

  console.log("결과:");
  results.forEach((r) => console.log(r));

  console.log(`\n${successCount}/${Object.keys(LANGUAGES).length} 파일 업데이트 완료`);

  if (successCount === Object.keys(LANGUAGES).length) {
    console.log(`\n💡 사용법: t("${namespace}.${key}")`);
    console.log(`\n⚠️  각 언어 파일에서 placeholder 값을 실제 번역으로 교체하세요!`);
  }
}

main();
