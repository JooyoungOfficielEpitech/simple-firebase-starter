#!/usr/bin/env node
/**
 * Service Generator
 * 새로운 서비스 파일을 생성하는 스크립트
 *
 * 사용법: node scripts/generators/service.js ServiceName [--firestore|--api|--storage]
 */

const fs = require("fs");
const path = require("path");

const SERVICES_DIR = path.resolve(__dirname, "../../app/services");

// 기본 서비스 템플릿
const getBaseServiceTemplate = (name) => {
  const serviceName = name.endsWith("Service") ? name : `${name}Service`;
  const className = serviceName.charAt(0).toUpperCase() + serviceName.slice(1);

  return `/**
 * ${className}
 * ${name} 서비스
 */

// ==========================================
// Types
// ==========================================

export interface ${name}Config {
  // Add configuration options here
}

// ==========================================
// Service Class
// ==========================================

class ${className} {
  private config: ${name}Config;
  private initialized = false;

  constructor() {
    this.config = {};
  }

  /**
   * Initialize the service
   */
  async initialize(config?: Partial<${name}Config>): Promise<void> {
    if (this.initialized) {
      console.warn("${className} is already initialized");
      return;
    }

    this.config = { ...this.config, ...config };
    this.initialized = true;

    console.log("${className} initialized");
  }

  /**
   * Check if service is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  // ==========================================
  // Public Methods
  // ==========================================

  /**
   * Example method
   */
  async exampleMethod(): Promise<void> {
    if (!this.initialized) {
      throw new Error("${className} is not initialized");
    }

    // TODO: Implement method
  }

  // ==========================================
  // Private Methods
  // ==========================================

  private async _internalHelper(): Promise<void> {
    // TODO: Implement helper
  }
}

// ==========================================
// Export Singleton Instance
// ==========================================

export const ${serviceName.charAt(0).toLowerCase() + serviceName.slice(1)} = new ${className}();
`;
};

// Firestore 서비스 템플릿
const getFirestoreServiceTemplate = (name) => {
  const serviceName = name.endsWith("Service") ? name : `${name}Service`;
  const className = serviceName.charAt(0).toUpperCase() + serviceName.slice(1);
  const collectionName = name.replace("Service", "").toLowerCase() + "s";

  return `/**
 * ${className}
 * Firestore ${name} 서비스
 */

import firestore, {
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";

// ==========================================
// Types
// ==========================================

export interface ${name}Data {
  id: string;
  // Add your data fields here
  createdAt: FirebaseFirestoreTypes.Timestamp;
  updatedAt: FirebaseFirestoreTypes.Timestamp;
}

export interface Create${name}Input {
  // Add fields for creation
}

export interface Update${name}Input {
  // Add fields for update
}

// ==========================================
// Constants
// ==========================================

const COLLECTION_NAME = "${collectionName}";

// ==========================================
// Service Class
// ==========================================

class ${className} {
  private collection: FirebaseFirestoreTypes.CollectionReference;

  constructor() {
    this.collection = firestore().collection(COLLECTION_NAME);
  }

  // ==========================================
  // CRUD Operations
  // ==========================================

  /**
   * Create a new ${name}
   */
  async create(data: Create${name}Input): Promise<${name}Data> {
    const timestamp = firestore.FieldValue.serverTimestamp();
    const docRef = await this.collection.add({
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    const doc = await docRef.get();
    return {
      id: doc.id,
      ...doc.data(),
    } as ${name}Data;
  }

  /**
   * Get a ${name} by ID
   */
  async getById(id: string): Promise<${name}Data | null> {
    const doc = await this.collection.doc(id).get();

    if (!doc.exists) {
      return null;
    }

    return {
      id: doc.id,
      ...doc.data(),
    } as ${name}Data;
  }

  /**
   * Get all ${name}s
   */
  async getAll(): Promise<${name}Data[]> {
    const snapshot = await this.collection
      .orderBy("createdAt", "desc")
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ${name}Data[];
  }

  /**
   * Update a ${name}
   */
  async update(id: string, data: Update${name}Input): Promise<void> {
    await this.collection.doc(id).update({
      ...data,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  }

  /**
   * Delete a ${name}
   */
  async delete(id: string): Promise<void> {
    await this.collection.doc(id).delete();
  }

  // ==========================================
  // Query Methods
  // ==========================================

  /**
   * Query ${name}s with conditions
   */
  async query(
    conditions: Array<{
      field: string;
      operator: FirebaseFirestoreTypes.WhereFilterOp;
      value: unknown;
    }>,
    limit?: number
  ): Promise<${name}Data[]> {
    let query: FirebaseFirestoreTypes.Query = this.collection;

    for (const condition of conditions) {
      query = query.where(condition.field, condition.operator, condition.value);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const snapshot = await query.get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ${name}Data[];
  }

  // ==========================================
  // Real-time Subscriptions
  // ==========================================

  /**
   * Subscribe to ${name} changes
   */
  subscribe(
    id: string,
    callback: (data: ${name}Data | null) => void
  ): () => void {
    return this.collection.doc(id).onSnapshot((doc) => {
      if (doc.exists) {
        callback({
          id: doc.id,
          ...doc.data(),
        } as ${name}Data);
      } else {
        callback(null);
      }
    });
  }

  /**
   * Subscribe to all ${name}s
   */
  subscribeAll(callback: (data: ${name}Data[]) => void): () => void {
    return this.collection
      .orderBy("createdAt", "desc")
      .onSnapshot((snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ${name}Data[];
        callback(data);
      });
  }
}

// ==========================================
// Export Singleton Instance
// ==========================================

export const ${serviceName.charAt(0).toLowerCase() + serviceName.slice(1)} = new ${className}();
`;
};

// API 서비스 템플릿
const getApiServiceTemplate = (name) => {
  const serviceName = name.endsWith("Service") ? name : `${name}Service`;
  const className = serviceName.charAt(0).toUpperCase() + serviceName.slice(1);
  const endpoint = name.replace("Service", "").toLowerCase();

  return `/**
 * ${className}
 * API ${name} 서비스
 */

import { Api } from "@/services/api";
import type { GeneralApiProblem } from "@/services/api/apiProblem";

// ==========================================
// Types
// ==========================================

export interface ${name}Response {
  id: string;
  // Add response fields here
}

export interface ${name}ListResponse {
  items: ${name}Response[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Create${name}Request {
  // Add request fields here
}

export interface Update${name}Request {
  // Add request fields here
}

// ==========================================
// API Result Types
// ==========================================

type ${name}Result = { kind: "ok"; data: ${name}Response } | GeneralApiProblem;
type ${name}ListResult = { kind: "ok"; data: ${name}ListResponse } | GeneralApiProblem;

// ==========================================
// Service Class
// ==========================================

class ${className} {
  private api: Api;
  private endpoint = "/${endpoint}";

  constructor() {
    this.api = new Api();
  }

  // ==========================================
  // CRUD Operations
  // ==========================================

  /**
   * Create a new ${name}
   */
  async create(data: Create${name}Request): Promise<${name}Result> {
    const response = await this.api.apisauce.post<${name}Response>(
      this.endpoint,
      data
    );

    if (!response.ok || !response.data) {
      return { kind: "bad-data" };
    }

    return { kind: "ok", data: response.data };
  }

  /**
   * Get a ${name} by ID
   */
  async getById(id: string): Promise<${name}Result> {
    const response = await this.api.apisauce.get<${name}Response>(
      \`\${this.endpoint}/\${id}\`
    );

    if (!response.ok || !response.data) {
      return { kind: "bad-data" };
    }

    return { kind: "ok", data: response.data };
  }

  /**
   * Get all ${name}s with pagination
   */
  async getAll(page = 1, pageSize = 20): Promise<${name}ListResult> {
    const response = await this.api.apisauce.get<${name}ListResponse>(
      this.endpoint,
      { page, pageSize }
    );

    if (!response.ok || !response.data) {
      return { kind: "bad-data" };
    }

    return { kind: "ok", data: response.data };
  }

  /**
   * Update a ${name}
   */
  async update(id: string, data: Update${name}Request): Promise<${name}Result> {
    const response = await this.api.apisauce.put<${name}Response>(
      \`\${this.endpoint}/\${id}\`,
      data
    );

    if (!response.ok || !response.data) {
      return { kind: "bad-data" };
    }

    return { kind: "ok", data: response.data };
  }

  /**
   * Delete a ${name}
   */
  async delete(id: string): Promise<{ kind: "ok" } | GeneralApiProblem> {
    const response = await this.api.apisauce.delete(\`\${this.endpoint}/\${id}\`);

    if (!response.ok) {
      return { kind: "bad-data" };
    }

    return { kind: "ok" };
  }
}

// ==========================================
// Export Singleton Instance
// ==========================================

export const ${serviceName.charAt(0).toLowerCase() + serviceName.slice(1)} = new ${className}();
`;
};

// Storage 서비스 템플릿
const getStorageServiceTemplate = (name) => {
  const serviceName = name.endsWith("Service") ? name : `${name}Service`;
  const className = serviceName.charAt(0).toUpperCase() + serviceName.slice(1);

  return `/**
 * ${className}
 * Firebase Storage ${name} 서비스
 */

import storage, { FirebaseStorageTypes } from "@react-native-firebase/storage";

// ==========================================
// Types
// ==========================================

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progress: number;
}

export interface UploadResult {
  downloadUrl: string;
  fullPath: string;
  metadata: FirebaseStorageTypes.FullMetadata;
}

// ==========================================
// Constants
// ==========================================

const STORAGE_PATH = "${name.replace("Service", "").toLowerCase()}";

// ==========================================
// Service Class
// ==========================================

class ${className} {
  private storageRef: FirebaseStorageTypes.Reference;

  constructor() {
    this.storageRef = storage().ref(STORAGE_PATH);
  }

  // ==========================================
  // Upload Methods
  // ==========================================

  /**
   * Upload a file
   */
  async uploadFile(
    uri: string,
    fileName: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    const fileRef = this.storageRef.child(fileName);
    const task = fileRef.putFile(uri);

    return new Promise((resolve, reject) => {
      task.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress?.({
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes,
            progress,
          });
        },
        reject,
        async () => {
          try {
            const downloadUrl = await fileRef.getDownloadURL();
            const metadata = await fileRef.getMetadata();
            resolve({
              downloadUrl,
              fullPath: fileRef.fullPath,
              metadata,
            });
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(
    files: Array<{ uri: string; fileName: string }>,
    onProgress?: (fileIndex: number, progress: UploadProgress) => void
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const result = await this.uploadFile(
        files[i].uri,
        files[i].fileName,
        (progress) => onProgress?.(i, progress)
      );
      results.push(result);
    }

    return results;
  }

  // ==========================================
  // Download Methods
  // ==========================================

  /**
   * Get download URL
   */
  async getDownloadUrl(fileName: string): Promise<string> {
    return this.storageRef.child(fileName).getDownloadURL();
  }

  /**
   * Get file metadata
   */
  async getMetadata(fileName: string): Promise<FirebaseStorageTypes.FullMetadata> {
    return this.storageRef.child(fileName).getMetadata();
  }

  // ==========================================
  // Delete Methods
  // ==========================================

  /**
   * Delete a file
   */
  async deleteFile(fileName: string): Promise<void> {
    await this.storageRef.child(fileName).delete();
  }

  /**
   * Delete multiple files
   */
  async deleteFiles(fileNames: string[]): Promise<void> {
    await Promise.all(fileNames.map((name) => this.deleteFile(name)));
  }

  // ==========================================
  // List Methods
  // ==========================================

  /**
   * List all files
   */
  async listFiles(maxResults = 100): Promise<FirebaseStorageTypes.ListResult> {
    return this.storageRef.list({ maxResults });
  }
}

// ==========================================
// Export Singleton Instance
// ==========================================

export const ${serviceName.charAt(0).toLowerCase() + serviceName.slice(1)} = new ${className}();
`;
};

// 메인 실행
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("사용법: node scripts/generators/service.js ServiceName [options]");
    console.log("옵션:");
    console.log("  --firestore  Firestore 서비스 템플릿");
    console.log("  --api        API 서비스 템플릿");
    console.log("  --storage    Storage 서비스 템플릿");
    process.exit(1);
  }

  const serviceName = args[0];
  const isFirestore = args.includes("--firestore");
  const isApi = args.includes("--api");
  const isStorage = args.includes("--storage");

  // 유효성 검사
  if (!/^[A-Z][a-zA-Z0-9]*$/.test(serviceName)) {
    console.error("오류: 서비스 이름은 PascalCase여야 합니다 (예: MyService)");
    process.exit(1);
  }

  // 디렉토리 결정
  let targetDir = SERVICES_DIR;
  if (isFirestore) {
    targetDir = path.join(SERVICES_DIR, "firestore");
  } else if (isStorage) {
    targetDir = path.join(SERVICES_DIR, "storage");
  } else if (isApi) {
    targetDir = path.join(SERVICES_DIR, "api");
  }

  // 디렉토리 생성
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const finalName = serviceName.endsWith("Service") ? serviceName : `${serviceName}Service`;
  const fileName = finalName.charAt(0).toLowerCase() + finalName.slice(1);
  const filePath = path.join(targetDir, `${fileName}.ts`);

  // 이미 존재하는지 확인
  if (fs.existsSync(filePath)) {
    console.error(`오류: ${filePath} 파일이 이미 존재합니다`);
    process.exit(1);
  }

  // 템플릿 선택
  let content;
  if (isFirestore) {
    content = getFirestoreServiceTemplate(serviceName);
  } else if (isApi) {
    content = getApiServiceTemplate(serviceName);
  } else if (isStorage) {
    content = getStorageServiceTemplate(serviceName);
  } else {
    content = getBaseServiceTemplate(serviceName);
  }

  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`✅ 서비스가 생성되었습니다: ${filePath}`);

  // index.ts 업데이트 안내
  console.log(`\n📝 index.ts에 다음을 추가하세요:`);
  console.log(`export * from "./${fileName}";`);
}

main();
