// Firestore 서비스들을 개별적으로 export
// 편의를 위한 서비스 인스턴스들도 export
import firestore from "@react-native-firebase/firestore"

import { UserService } from "./userService"
import { SongService } from "./songService"

export { UserService } from "./userService"
export { SongService } from "./songService"

// 각 서비스의 싱글톤 인스턴스 생성
const db = firestore()
const userService = new UserService(db)

// SongService는 static 메서드를 사용하므로 클래스 자체를 export
export { userService, SongService as songService }
