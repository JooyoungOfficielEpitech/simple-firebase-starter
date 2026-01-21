#!/usr/bin/env node
/**
 * Cloud Function Generator
 * 새로운 Cloud Function 파일을 생성하는 스크립트
 *
 * 사용법: node scripts/generators/function.js FunctionName [--http|--firestore|--auth|--scheduled]
 */

const fs = require("fs");
const path = require("path");

const FUNCTIONS_DIR = path.resolve(__dirname, "../../functions/src");

// HTTP Function 템플릿
const getHttpFunctionTemplate = (name) => {
  const functionName = name.charAt(0).toLowerCase() + name.slice(1);

  return `/**
 * ${name} HTTP Cloud Function
 * HTTP 트리거 Cloud Function
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import cors from "cors";

const corsHandler = cors({ origin: true });

// ==========================================
// Types
// ==========================================

interface ${name}Request {
  // Add request body fields here
}

interface ${name}Response {
  success: boolean;
  data?: unknown;
  error?: string;
}

// ==========================================
// Function Implementation
// ==========================================

export const ${functionName} = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    // Check HTTP method
    if (req.method !== "POST") {
      res.status(405).json({
        success: false,
        error: "Method not allowed",
      } as ${name}Response);
      return;
    }

    try {
      // Verify auth token (optional)
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({
          success: false,
          error: "Unauthorized",
        } as ${name}Response);
        return;
      }

      const token = authHeader.split("Bearer ")[1];
      const decodedToken = await admin.auth().verifyIdToken(token);
      const userId = decodedToken.uid;

      // Parse request body
      const body = req.body as ${name}Request;

      // TODO: Implement your logic here
      console.log("Processing request for user:", userId, body);

      // Return success response
      res.status(200).json({
        success: true,
        data: {
          message: "${name} executed successfully",
        },
      } as ${name}Response);
    } catch (error) {
      console.error("${name} error:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      } as ${name}Response);
    }
  });
});
`;
};

// Firestore Trigger 템플릿
const getFirestoreFunctionTemplate = (name) => {
  const functionName = name.charAt(0).toLowerCase() + name.slice(1);
  const collectionName = name.replace(/on/i, "").toLowerCase() + "s";

  return `/**
 * ${name} Firestore Trigger Cloud Function
 * Firestore 트리거 Cloud Function
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// ==========================================
// Types
// ==========================================

interface DocumentData {
  // Add your document fields here
  createdAt?: admin.firestore.Timestamp;
  updatedAt?: admin.firestore.Timestamp;
}

// ==========================================
// onCreate Trigger
// ==========================================

export const ${functionName}OnCreate = functions.firestore
  .document("${collectionName}/{docId}")
  .onCreate(async (snap, context) => {
    const docId = context.params.docId;
    const data = snap.data() as DocumentData;

    console.log("New document created:", docId, data);

    try {
      // TODO: Implement onCreate logic
      // Example: Send notification, update counters, etc.

    } catch (error) {
      console.error("${name}OnCreate error:", error);
    }
  });

// ==========================================
// onUpdate Trigger
// ==========================================

export const ${functionName}OnUpdate = functions.firestore
  .document("${collectionName}/{docId}")
  .onUpdate(async (change, context) => {
    const docId = context.params.docId;
    const beforeData = change.before.data() as DocumentData;
    const afterData = change.after.data() as DocumentData;

    console.log("Document updated:", docId);
    console.log("Before:", beforeData);
    console.log("After:", afterData);

    try {
      // TODO: Implement onUpdate logic
      // Example: Track changes, sync data, etc.

    } catch (error) {
      console.error("${name}OnUpdate error:", error);
    }
  });

// ==========================================
// onDelete Trigger
// ==========================================

export const ${functionName}OnDelete = functions.firestore
  .document("${collectionName}/{docId}")
  .onDelete(async (snap, context) => {
    const docId = context.params.docId;
    const data = snap.data() as DocumentData;

    console.log("Document deleted:", docId, data);

    try {
      // TODO: Implement onDelete logic
      // Example: Cleanup related data, update counters, etc.

    } catch (error) {
      console.error("${name}OnDelete error:", error);
    }
  });
`;
};

// Auth Trigger 템플릿
const getAuthFunctionTemplate = (name) => {
  const functionName = name.charAt(0).toLowerCase() + name.slice(1);

  return `/**
 * ${name} Auth Trigger Cloud Function
 * Auth 트리거 Cloud Function
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// ==========================================
// onCreate Trigger (User Registration)
// ==========================================

export const ${functionName}OnCreate = functions.auth.user().onCreate(async (user) => {
  const { uid, email, displayName, photoURL, phoneNumber } = user;

  console.log("New user registered:", uid, email);

  try {
    // Create user document in Firestore
    await admin.firestore().collection("users").doc(uid).set({
      email: email || null,
      displayName: displayName || null,
      photoURL: photoURL || null,
      phoneNumber: phoneNumber || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      // Add more default fields
    });

    // TODO: Additional onCreate logic
    // Example: Send welcome email, set custom claims, etc.

    console.log("User document created for:", uid);
  } catch (error) {
    console.error("${name}OnCreate error:", error);
  }
});

// ==========================================
// onDelete Trigger (User Deletion)
// ==========================================

export const ${functionName}OnDelete = functions.auth.user().onDelete(async (user) => {
  const { uid, email } = user;

  console.log("User deleted:", uid, email);

  try {
    // Delete user document from Firestore
    await admin.firestore().collection("users").doc(uid).delete();

    // TODO: Additional cleanup logic
    // Example: Delete user's files from Storage, etc.

    console.log("User data cleaned up for:", uid);
  } catch (error) {
    console.error("${name}OnDelete error:", error);
  }
});
`;
};

// Scheduled Function 템플릿
const getScheduledFunctionTemplate = (name) => {
  const functionName = name.charAt(0).toLowerCase() + name.slice(1);

  return `/**
 * ${name} Scheduled Cloud Function
 * 스케줄 트리거 Cloud Function
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// ==========================================
// Scheduled Function
// ==========================================

/**
 * Runs every day at midnight (00:00) in Asia/Seoul timezone
 * Cron expression: "0 0 * * *"
 *
 * Common patterns:
 * - Every minute: "* * * * *"
 * - Every hour: "0 * * * *"
 * - Every day at midnight: "0 0 * * *"
 * - Every Monday at 9 AM: "0 9 * * 1"
 * - Every 1st of month: "0 0 1 * *"
 */
export const ${functionName} = functions.pubsub
  .schedule("0 0 * * *")
  .timeZone("Asia/Seoul")
  .onRun(async (context) => {
    const timestamp = context.timestamp;
    console.log("${name} started at:", timestamp);

    try {
      // TODO: Implement scheduled task logic
      // Example: Clean up old data, send daily reports, etc.

      const db = admin.firestore();

      // Example: Delete documents older than 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const oldDocs = await db
        .collection("logs")
        .where("createdAt", "<", thirtyDaysAgo)
        .limit(500) // Process in batches
        .get();

      if (!oldDocs.empty) {
        const batch = db.batch();
        oldDocs.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        console.log(\`Deleted \${oldDocs.size} old documents\`);
      }

      console.log("${name} completed successfully");
    } catch (error) {
      console.error("${name} error:", error);
    }

    return null;
  });
`;
};

// Callable Function 템플릿
const getCallableFunctionTemplate = (name) => {
  const functionName = name.charAt(0).toLowerCase() + name.slice(1);

  return `/**
 * ${name} Callable Cloud Function
 * Callable Cloud Function (클라이언트에서 직접 호출)
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// ==========================================
// Types
// ==========================================

interface ${name}Data {
  // Add request data fields here
}

interface ${name}Result {
  success: boolean;
  data?: unknown;
  message?: string;
}

// ==========================================
// Callable Function
// ==========================================

export const ${functionName} = functions.https.onCall(
  async (data: ${name}Data, context): Promise<${name}Result> => {
    // Check authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Authentication required"
      );
    }

    const userId = context.auth.uid;
    console.log("${name} called by user:", userId, data);

    try {
      // TODO: Implement callable function logic

      // Example: Validate input
      if (!data) {
        throw new functions.https.HttpsError(
          "invalid-argument",
          "Data is required"
        );
      }

      // Example: Perform operation
      const result = await performOperation(userId, data);

      return {
        success: true,
        data: result,
        message: "${name} completed successfully",
      };
    } catch (error) {
      console.error("${name} error:", error);

      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      throw new functions.https.HttpsError(
        "internal",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
);

// ==========================================
// Helper Functions
// ==========================================

async function performOperation(userId: string, data: ${name}Data): Promise<unknown> {
  // TODO: Implement operation logic
  return { userId, processed: true };
}
`;
};

// 메인 실행
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("사용법: node scripts/generators/function.js FunctionName [options]");
    console.log("옵션:");
    console.log("  --http        HTTP 트리거 함수");
    console.log("  --firestore   Firestore 트리거 함수");
    console.log("  --auth        Auth 트리거 함수");
    console.log("  --scheduled   스케줄 트리거 함수");
    console.log("  --callable    Callable 함수 (기본값)");
    process.exit(1);
  }

  const functionName = args[0];
  const isHttp = args.includes("--http");
  const isFirestore = args.includes("--firestore");
  const isAuth = args.includes("--auth");
  const isScheduled = args.includes("--scheduled");

  // 유효성 검사
  if (!/^[A-Z][a-zA-Z0-9]*$/.test(functionName)) {
    console.error("오류: 함수 이름은 PascalCase여야 합니다 (예: MyFunction)");
    process.exit(1);
  }

  // 디렉토리 생성
  if (!fs.existsSync(FUNCTIONS_DIR)) {
    fs.mkdirSync(FUNCTIONS_DIR, { recursive: true });
  }

  const fileName = functionName.charAt(0).toLowerCase() + functionName.slice(1);
  const filePath = path.join(FUNCTIONS_DIR, `${fileName}.ts`);

  // 이미 존재하는지 확인
  if (fs.existsSync(filePath)) {
    console.error(`오류: ${filePath} 파일이 이미 존재합니다`);
    process.exit(1);
  }

  // 템플릿 선택
  let content;
  if (isHttp) {
    content = getHttpFunctionTemplate(functionName);
  } else if (isFirestore) {
    content = getFirestoreFunctionTemplate(functionName);
  } else if (isAuth) {
    content = getAuthFunctionTemplate(functionName);
  } else if (isScheduled) {
    content = getScheduledFunctionTemplate(functionName);
  } else {
    content = getCallableFunctionTemplate(functionName);
  }

  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`✅ Cloud Function이 생성되었습니다: ${filePath}`);

  // index.ts 업데이트 안내
  console.log(`\n📝 functions/src/index.ts에 다음을 추가하세요:`);
  console.log(`export * from "./${fileName}";`);
}

main();
