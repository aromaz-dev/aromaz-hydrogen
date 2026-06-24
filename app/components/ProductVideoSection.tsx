'use client';

import {useEffect, useRef, useState} from 'react';

type ProductVideoSectionProps = {
  src: string;
  poster?: string;
};

export function ProductVideoSection({src, poster}: ProductVideoSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {rootMargin: '200px'},
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [isVisible]);

  return (
    <section
      ref={containerRef}
      className="px-6 py-10 md:max-w-6xl md:mx-auto md:px-8 md:py-14"
    >
      <div className="w-full overflow-hidden rounded-2xl">
        {isVisible ? (
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            preload="metadata"
            muted
            loop
            playsInline
            autoPlay
            controls={false}
            className="w-full h-auto block"
            style={{display: 'block'}}
          />
        ) : (
          <div
            className="w-full aspect-video bg-charcoal/5"
            style={poster ? {backgroundImage: `url(${poster})`, backgroundSize: 'cover', backgroundPosition: 'center'} : undefined}
          />
        )}
      </div>
    </section>
  );
}
