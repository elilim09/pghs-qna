import { useEffect, useRef } from 'react';

const KakaoAd = () => {
  // 광고 컨테이너에 대한 참조 생성
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 컴포넌트가 마운트될 때 한 번만 광고 스크립트를 로드
    if (adContainerRef.current && adContainerRef.current.childElementCount === 0) {
      const ins = document.createElement('ins');
      ins.className = 'kakao_ad_area';
      ins.style.display = 'none';
      ins.setAttribute('data-ad-unit', 'DAN-VUCEleoxA2bCNR0E');
      ins.setAttribute('data-ad-width', '320');
      ins.setAttribute('data-ad-height', '50');

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = '//t1.daumcdn.net/kas/static/ba.min.js';
      script.async = true;

      // 생성된 태그들을 컨테이너에 추가
      adContainerRef.current.appendChild(ins);
      adContainerRef.current.appendChild(script);
    }
  }, []);

  // 광고가 표시될 컨테이너 div
  return <div ref={adContainerRef} style={{ textAlign: 'center', margin: '20px 0' }}></div>;
};

export default KakaoAd;
