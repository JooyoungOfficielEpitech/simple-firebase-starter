/**
 * Service Container
 * 의존성 주입 컨테이너
 */

type Constructor<T> = new (...args: any[]) => T
type ServiceFactory<T> = () => T

export class ServiceContainer {
  private services: Map<string, any> = new Map()
  private factories: Map<string, ServiceFactory<any>> = new Map()

  /**
   * 서비스 등록 (싱글톤)
   */
  register<T>(key: string, instance: T): void {
    this.services.set(key, instance)
  }

  /**
   * 팩토리 등록 (지연 생성)
   */
  registerFactory<T>(key: string, factory: ServiceFactory<T>): void {
    this.factories.set(key, factory)
  }

  /**
   * 서비스 가져오기
   */
  resolve<T>(key: string): T {
    // 등록된 인스턴스 확인
    if (this.services.has(key)) {
      return this.services.get(key)
    }

    // 팩토리로 생성
    if (this.factories.has(key)) {
      const factory = this.factories.get(key)!
      const instance = factory()
      this.services.set(key, instance) // 싱글톤으로 저장
      return instance
    }

    throw new Error(`Service "${key}" not found in container`)
  }

  /**
   * 서비스 존재 확인
   */
  has(key: string): boolean {
    return this.services.has(key) || this.factories.has(key)
  }

  /**
   * 컨테이너 초기화
   */
  clear(): void {
    this.services.clear()
    this.factories.clear()
  }
}

// 전역 서비스 컨테이너
export const container = new ServiceContainer()
