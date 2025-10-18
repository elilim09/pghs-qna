import { useEffect, useRef } from 'react';

const GoogleAd = () => {
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (adContainerRef.current && adContainerRef.current.childElementCount === 0) {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5627293747027982';
      script.async = true;
      script.crossOrigin = 'anonymous';
      
      const ins = document.createElement('ins');
      ins.className = 'adsbygoogle';
      ins.style.display = 'block';
      ins.setAttribute('data-ad-client', 'ca-pub-5627293747027982');
      ins.setAttribute('data-ad-slot', '4853696451');
      ins.setAttribute('data-ad-format', 'auto');
      ins.setAttribute('data-full-width-responsive', 'true');

      const innerScript = document.createElement('script');
      innerScript.innerHTML = '(adsbygoogle = window.adsbygoogle || []).push({});';

      adContainerRef.current.appendChild(script);
      adContainerRef.current.appendChild(ins);
      adContainerRef.current.appendChild(innerScript);
    }
  }, []);

  return <div ref={adContainerRef} style={{ textAlign: 'center', margin: '20px 0' }}></div>;
};

export default GoogleAd;
