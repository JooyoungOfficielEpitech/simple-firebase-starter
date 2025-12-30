// Firestore 서비스들을 개별적으로 export
// 편의를 위한 서비스 인스턴스들도 export
import firestore from "@react-native-firebase/firestore"

import { UserService } from "./userService"
import { CourtService } from "./courtService"

export { UserService } from "./userService"
export { CourtService } from "./courtService"

// 각 서비스의 싱글톤 인스턴스 생성
const db = firestore()
const userService = new UserService(db)
const courtService = new CourtService(db)

export { userService, courtService }
