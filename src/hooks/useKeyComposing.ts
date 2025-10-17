import { useCallback, useRef, useState } from "react";

/**
 * 한글/IME 조합 입력 상태를 안전하게 관리하는 훅
 * - 조합 시작/종료 이벤트를 안전하게 처리
 * - 일부 브라우저에서 compositionend 직후 1틱 동안 상태가 남는 문제 가드
 */
export default function useKeyComposing() {
  const [isComposing, setIsComposing] = useState(false);
  const timerRef = useRef<number | null>(null);

  const handleCompositionStart = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsComposing(true);
  }, []);

  const handleCompositionEnd = useCallback(() => {
    // 바로 false로 내리되, 드물게 지연되는 이벤트를 위해 0틱 지연도 한 번 더
    setIsComposing(false);
    timerRef.current = window.setTimeout(() => {
      setIsComposing(false);
      timerRef.current = null;
    }, 0);
  }, []);

  return { isComposing, handleCompositionStart, handleCompositionEnd };
}
