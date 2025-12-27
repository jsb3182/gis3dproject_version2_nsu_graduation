import { ref, computed } from 'vue';

/**
 * @file src/composables/useBottomSheet.js
 * @description 바텀시트의 동작(드래그, 토글)을 관리하는 Vue 컴포저블 (수정본)
 * @description 리팩토링 이유:
 *   - 컴포넌트의 UI 동작과 핵심 로직을 분리하여 '관심사의 분리' 원칙을 지킵니다.
 *   - 독립적인 모듈로 만들어, 다른 컴포넌트에서도 동일한 바텀시트 기능을 쉽게 재사용할 수 있습니다.
 *   - 컴포넌트의 script 코드를 간소화하여 가독성을 높입니다.
 */

/**
 * 바텀시트 기능을 위한 컴포저블 함수
 * @param {object} options - 바텀시트 설정 옵션
 * @param {number} [options.maxHeightRatio=0.8] - 화면 높이 대비 최대 높이 비율 (0 ~ 1)
 * @param {number} [options.minHeight=220] - 최소 높이 (px)
 * @returns {object} 바텀시트 상태와 제어 함수
 */
export function useBottomSheet({ maxHeightRatio = 0.8, minHeight = 220 } = {}) {
  
  // --- 상태 (State) ---

  /** @type {import('vue').Ref<boolean>} - 현재 드래그 중인지 여부 */
  const isDragging = ref(false);

  /** @type {import('vue').Ref<number>} - 바텀시트의 현재 높이 비율 (0: 닫힘, 1: 열림) */
  const sheetHeightRatio = ref(0);

  /** @type {import('vue').Ref<object>} - 드래그 시작 시점의 정보 { y: number, ratio: number } */
  const dragStart = ref({ y: 0, ratio: 0 });

  /** @type {number} - 화면 높이를 기준으로 계산된 최대 높이 (px) */
  const MAX_SHEET_HEIGHT = window.innerHeight * maxHeightRatio;
  
  /** @type {number} - 최소 높이 (px) */
  const MIN_SHEET_HEIGHT = minHeight;


  // --- 계산된 속성 (Computed) ---

  /**
   * @description 현재 높이 비율에 따라 translateY 값을 계산하여, CSS transform에 적용
   * @returns {number} Y축 이동 거리 (px)
   */
  const sheetY = computed(() => {
    // 높이 비율이 0(닫힘)일 때, (최대높이 - 최소높이) 만큼 아래로 내려가 일부만 보임
    // 높이 비율이 1(열림)일 때, 0 만큼 내려가 완전히 보이게 됨
    return (MAX_SHEET_HEIGHT - MIN_SHEET_HEIGHT) * (1 - sheetHeightRatio.value);
  });

  /**
   * @description 바텀시트 컨테이너에 적용할 동적 스타일
   * @returns {object} CSS 스타일 객체
   */
  const sheetStyle = computed(() => ({
    // 드래그 중에는 transition을 없애 부드럽게 따라오게 하고, 드래그가 끝나면 애니메이션 적용
    transition: isDragging.value ? 'none' : 'transform 0.3s ease-out',
    transform: `translateY(${sheetY.value}px)`,
    height: `${MAX_SHEET_HEIGHT}px`, // 높이는 최대로 고정
    bottom: `0px`, // 항상 하단에 붙어있도록
    top: 'auto',   // top 속성과의 충돌 방지
  }));


  // --- 이벤트 핸들러 (Event Handlers) ---

  /**
   * 터치 시작 이벤트 핸들러
   * @param {TouchEvent} e - 터치 이벤트 객체
   */
  const onTouchStart = (e) => {
    // 버튼이나 카드처럼 클릭 동작이 필요한 요소에서는 드래그를 시작하지 않음
    if (e.target.closest('button, .btn, .card-body, a')) return;
    
    isDragging.value = true;
    dragStart.value = {
      y: e.touches[0].clientY,
      ratio: sheetHeightRatio.value
    };
  };

  /**
   * 터치 이동 이벤트 핸들러
   * @param {TouchEvent} e - 터치 이벤트 객체
   */
  const onTouchMove = (e) => {
    if (!isDragging.value) return;

    // 시작점으로부터 Y축 이동 거리 계산
    const deltaY = e.touches[0].clientY - dragStart.value.y;
    // Y축 이동 거리를 높이 비율 변화량으로 변환 (아래로 내리면 음수, 위로 올리면 양수)
    const deltaRatio = -deltaY / (MAX_SHEET_HEIGHT - MIN_SHEET_HEIGHT);
    
    // 시작 시점의 비율에 변화량을 더하여 현재 비율 계산
    const newRatio = dragStart.value.ratio + deltaRatio;
    
    // 높이 비율은 0과 1 사이로 제한
    sheetHeightRatio.value = Math.max(0, Math.min(1, newRatio));
  };

  /**
   * 터치 종료 이벤트 핸들러
   */
  const onTouchEnd = () => {
    if (!isDragging.value) return;
    isDragging.value = false;
    // 드래그가 끝났을 때, 높이 비율이 0.5 이상이면 완전히 열고, 아니면 닫음
    sheetHeightRatio.value = sheetHeightRatio.value > 0.5 ? 1 : 0;
  };

  /**
   * 바텀시트를 토글하는 함수 (열려있으면 닫고, 닫혀있으면 열기)
   */
  const toggleSheet = () => {
    sheetHeightRatio.value = sheetHeightRatio.value > 0.5 ? 0 : 1;
  };

  /**
   * 바텀시트를 여는 함수
   */
  const openSheet = () => {
    sheetHeightRatio.value = 1;
  };

  /**
   * 바텀시트를 닫는 함수
   */
  const closeSheet = () => {
    sheetHeightRatio.value = 0;
  };

  // 컴포넌트에서 사용할 상태, 계산된 속성, 함수들을 반환
  return {
    sheetHeightRatio,
    sheetStyle,
    isDragging,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    toggleSheet,
    openSheet,
    closeSheet,
  };
}