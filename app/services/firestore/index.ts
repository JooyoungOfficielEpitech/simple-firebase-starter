// Firestore 서비스들을 개별적으로 export
// 편의를 위한 서비스 인스턴스들도 export
import firestore from "@react-native-firebase/firestore"

import { UserService } from "./userService"
import { SongService } from "./songService"
import { PostService } from "./postService"
import { OrganizationService } from "./organizationService"

export { UserService } from "./userService"
export { SongService } from "./songService"
export { PostService } from "./postService"
export { OrganizationService } from "./organizationService"

// 각 서비스의 싱글톤 인스턴스 생성
console.log('🔥 [Firestore Index] 서비스 인스턴스 생성 시작')
const db = firestore()
console.log('🔥 [Firestore Index] Firestore DB 인스턴스 생성:', db ? 'OK' : 'ERROR')

const userService = new UserService(db)
console.log('🔥 [Firestore Index] UserService 생성:', userService ? 'OK' : 'ERROR')

const postService = new PostService(db)
console.log('🔥 [Firestore Index] PostService 생성:', postService ? 'OK' : 'ERROR')

const organizationService = new OrganizationService(db)
console.log('🔥 [Firestore Index] OrganizationService 생성:', organizationService ? 'OK' : 'ERROR')

// SongService는 static 메서드를 사용하므로 클래스 자체를 export
export { userService, postService, organizationService, SongService as songService }
