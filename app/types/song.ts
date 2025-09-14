import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore"

export interface Song {
  id: string
  title: string
  musical: string
  localMrFile?: string  // 로컬 오디오 파일명 (assets/audio/에서 참조)
  mrUrl?: string        // Firebase Storage URL (추후 구현)
  createdAt?: FirebaseFirestoreTypes.Timestamp
  updatedAt?: FirebaseFirestoreTypes.Timestamp
}

export const SAMPLE_SONGS: Song[] = [
  {
    id: "1",
    title: "This is the Moment",
    musical: "지킬 앤 하이드",
    localMrFile: "sample.mp3",  // 테스트용 샘플 파일
  },
  {
    id: "2", 
    title: "Defying Gravity",
    musical: "위키드",
  },
  {
    id: "3",
    title: "Memory",
    musical: "캣츠",
  },
  {
    id: "4",
    title: "The Phantom of the Opera",
    musical: "오페라의 유령",
  },
  {
    id: "5",
    title: "I Dreamed a Dream",
    musical: "레 미제라블",
  },
  {
    id: "6",
    title: "Seasons of Love",
    musical: "렌트",
  },
  {
    id: "7",
    title: "Don't Cry for Me Argentina",
    musical: "에비타",
  },
  {
    id: "8",
    title: "All I Ask of You",
    musical: "오페라의 유령",
  },
]