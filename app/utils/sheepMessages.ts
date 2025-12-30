import type { BubblePosition } from '../components/SpeechBubble';

/**
 * 양 캐릭터 대사 목록
 *
 * 양을 터치했을 때 랜덤하게 표시될 메시지들입니다.
 * 이 배열에 원하는 대사를 추가하거나 수정할 수 있습니다.
 */
export const SHEEP_MESSAGES: string[] = [
  "나도 하는데 ㅋㅋ",
  "양도 한답니다~",
  "음, 당신은 못하시네요?",
];

/**
 * 말풍선 위치 목록
 */
const BUBBLE_POSITIONS: BubblePosition[] = ['topLeft', 'topRight'];

/**
 * 랜덤 메시지 선택 함수
 * @returns 랜덤하게 선택된 양의 대사
 */
export const getRandomSheepMessage = (): string => {
  const randomIndex = Math.floor(Math.random() * SHEEP_MESSAGES.length);
  return SHEEP_MESSAGES[randomIndex];
};

/**
 * 랜덤 위치 선택 함수
 * @returns 랜덤하게 선택된 말풍선 위치
 */
export const getRandomBubblePosition = (): BubblePosition => {
  const randomIndex = Math.floor(Math.random() * BUBBLE_POSITIONS.length);
  return BUBBLE_POSITIONS[randomIndex];
};
