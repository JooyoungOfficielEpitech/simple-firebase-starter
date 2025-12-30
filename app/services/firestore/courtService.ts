import firestore, { FirebaseFirestoreTypes } from "@react-native-firebase/firestore"

import {
  CourtRental,
  CreateCourtRental,
  UpdateCourtRental,
  CourtSearchParams,
} from "../../types/court"

/**
 * 농구장 대관 관련 Firestore 서비스
 */
export class CourtService {
  private db: FirebaseFirestoreTypes.Module
  private collection: string = "court_rentals"

  constructor(db: FirebaseFirestoreTypes.Module) {
    this.db = db
  }

  /**
   * 서버 타임스탬프 생성
   */
  private getServerTimestamp(): FirebaseFirestoreTypes.FieldValue {
    return firestore.FieldValue.serverTimestamp()
  }

  /**
   * 새로운 대관 정보 생성
   */
  async createCourtRental(rentalData: CreateCourtRental): Promise<string> {
    const now = new Date() as unknown as FirebaseFirestoreTypes.Timestamp

    const docRef = this.db.collection(this.collection).doc()

    const rental: CourtRental = {
      id: docRef.id,
      ...rentalData,
      is_available: true,
      createdAt: now,
      updatedAt: now,
    }

    await docRef.set(rental)
    return docRef.id
  }

  /**
   * 대관 정보 조회 (ID로)
   */
  async getCourtRental(rentalId: string): Promise<CourtRental | null> {
    const doc = await this.db.collection(this.collection).doc(rentalId).get()

    if (!doc.exists) {
      return null
    }

    return {
      ...doc.data(),
      id: doc.id,
    } as CourtRental
  }

  /**
   * 대관 정보 업데이트
   */
  async updateCourtRental(rentalId: string, updateData: UpdateCourtRental): Promise<void> {
    await this.db
      .collection(this.collection)
      .doc(rentalId)
      .update({
        ...updateData,
        updatedAt: this.getServerTimestamp(),
      })
  }

  /**
   * 대관 정보 검색/필터링
   */
  async searchCourtRentals(params: CourtSearchParams): Promise<CourtRental[]> {
    let query: FirebaseFirestoreTypes.Query = this.db.collection(this.collection)

    // Platform filter
    if (params.platform) {
      query = query.where("platform", "==", params.platform)
    }

    // Limit results
    if (params.limit) {
      query = query.limit(params.limit)
    }

    const snapshot = await query.get()

    let rentals = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    } as CourtRental))

    // Client-side filters to avoid composite index requirements

    // Availability filter (client-side, as many docs don't have this field)
    if (params.is_available !== undefined) {
      rentals = rentals.filter((rental) => {
        // is_available 필드가 없는 경우 true로 간주
        const isAvailable = rental.is_available !== undefined ? rental.is_available : true
        return isAvailable === params.is_available
      })
    }
    if (params.start_date) {
      rentals = rentals.filter(
        (rental) => rental.extracted_info.event_date && rental.extracted_info.event_date >= params.start_date!
      )
    }

    if (params.end_date) {
      rentals = rentals.filter(
        (rental) => rental.extracted_info.event_date && rental.extracted_info.event_date <= params.end_date!
      )
    }

    if (params.max_price) {
      rentals = rentals.filter(
        (rental) =>
          rental.extracted_info.price &&
          parseInt(rental.extracted_info.price) <= params.max_price!
      )
    }

    // Location filter (client-side, as Firestore doesn't support LIKE queries)
    if (params.location) {
      const locationLower = params.location.toLowerCase()
      rentals = rentals.filter((rental) =>
        rental.extracted_info.location?.toLowerCase().includes(locationLower),
      )
    }

    // Client-side sorting by createdAt (최신순)
    return rentals.sort((a, b) => {
      const timeA = a.createdAt?.toMillis?.() || 0
      const timeB = b.createdAt?.toMillis?.() || 0
      return timeB - timeA
    })
  }

  /**
   * 최근 대관 정보 조회
   */
  async getRecentCourtRentals(limit: number = 20): Promise<CourtRental[]> {
    const snapshot = await this.db
      .collection(this.collection)
      .limit(limit)
      .get()

    let rentals = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    } as CourtRental))

    // Client-side filter by availability (is_available 필드가 없는 경우 true로 간주)
    rentals = rentals.filter((rental) => {
      const isAvailable = rental.is_available !== undefined ? rental.is_available : true
      return isAvailable === true
    })

    // Client-side sorting by createdAt (최신순)
    return rentals.sort((a, b) => {
      const timeA = a.createdAt?.toMillis?.() || 0
      const timeB = b.createdAt?.toMillis?.() || 0
      return timeB - timeA
    })
  }

  /**
   * 대관 정보 실시간 리스너
   */
  subscribeToCourtRental(
    rentalId: string,
    callback: (rental: CourtRental | null) => void,
  ): () => void {
    return this.db
      .collection(this.collection)
      .doc(rentalId)
      .onSnapshot(
        (doc) => {
          if (doc.exists) {
            callback({
              ...doc.data(),
              id: doc.id,
            } as CourtRental)
          } else {
            callback(null)
          }
        },
        (error) => {
          console.error("대관 정보 구독 오류:", error)
          callback(null)
        },
      )
  }

  /**
   * 검색 결과 실시간 리스너
   */
  subscribeToCourtRentals(
    params: CourtSearchParams,
    callback: (rentals: CourtRental[]) => void,
  ): () => void {
    console.log('🔍 [courtService] 컬렉션 이름:', this.collection)
    console.log('🔍 [courtService] 검색 파라미터:', params)

    let query: FirebaseFirestoreTypes.Query = this.db.collection(this.collection)

    // 디버깅: 필터 없이 모든 데이터 가져오기
    console.log('🔍 [courtService] 필터 없이 전체 데이터 조회 시작')

    if (params.limit) {
      query = query.limit(params.limit)
    }

    return query.onSnapshot(
      (snapshot) => {
        console.log('📊 [courtService] Firestore snapshot 크기:', snapshot.size)
        console.log('📊 [courtService] Firestore snapshot empty?:', snapshot.empty)

        if (!snapshot.empty) {
          const firstDoc = snapshot.docs[0]
          console.log('📄 [courtService] 첫 번째 문서 ID:', firstDoc.id)
          console.log('📄 [courtService] 첫 번째 문서 데이터:', firstDoc.data())
        }

        let rentals = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        } as CourtRental))

        console.log('📦 [courtService] 변환 전 데이터 개수:', rentals.length)

        // Client-side filters
        if (params.platform) {
          rentals = rentals.filter((rental) => rental.platform === params.platform)
          console.log('🔍 [courtService] platform 필터 후:', rentals.length)
        }

        if (params.is_available !== undefined) {
          const beforeFilter = rentals.length
          rentals = rentals.filter((rental) => {
            // is_available 필드가 없는 경우 true로 간주
            const isAvailable = rental.is_available !== undefined ? rental.is_available : true
            return isAvailable === params.is_available
          })
          console.log(`🔍 [courtService] is_available 필터: ${beforeFilter} → ${rentals.length}`)
        }

        if (params.start_date) {
          rentals = rentals.filter(
            (rental) => rental.extracted_info.event_date && rental.extracted_info.event_date >= params.start_date!
          )
        }

        if (params.end_date) {
          rentals = rentals.filter(
            (rental) => rental.extracted_info.event_date && rental.extracted_info.event_date <= params.end_date!
          )
        }

        if (params.location) {
          const locationLower = params.location.toLowerCase()
          rentals = rentals.filter((rental) =>
            rental.extracted_info.location?.toLowerCase().includes(locationLower),
          )
        }

        // Client-side sorting by createdAt (최신순)
        rentals.sort((a, b) => {
          const timeA = a.createdAt?.toMillis?.() || 0
          const timeB = b.createdAt?.toMillis?.() || 0
          return timeB - timeA
        })

        console.log('✅ [courtService] 최종 반환 데이터:', rentals.length)
        callback(rentals)
      },
      (error) => {
        console.error("❌ [courtService] 구독 오류:", error)
        callback([])
      },
    )
  }

  /**
   * 대관 정보 삭제 (소프트 삭제)
   */
  async deleteCourtRental(rentalId: string): Promise<void> {
    await this.db.collection(this.collection).doc(rentalId).update({
      is_available: false,
      updatedAt: this.getServerTimestamp(),
    })
  }

  /**
   * 대관 정보 영구 삭제
   */
  async permanentlyDeleteCourtRental(rentalId: string): Promise<void> {
    await this.db.collection(this.collection).doc(rentalId).delete()
  }

  /**
   * 일괄 생성 (JSON 데이터 import용)
   */
  async batchCreateCourtRentals(rentals: CreateCourtRental[]): Promise<number> {
    const batch = this.db.batch()
    const now = new Date() as unknown as FirebaseFirestoreTypes.Timestamp
    let count = 0

    for (const rentalData of rentals) {
      const docRef = this.db.collection(this.collection).doc()

      const rental: CourtRental = {
        id: docRef.id,
        ...rentalData,
        is_available: true,
        createdAt: now,
        updatedAt: now,
      }

      batch.set(docRef, rental)
      count++

      // Firestore batch limit is 500 operations
      if (count % 500 === 0) {
        await batch.commit()
      }
    }

    // Commit remaining operations
    if (count % 500 !== 0) {
      await batch.commit()
    }

    return count
  }
}
