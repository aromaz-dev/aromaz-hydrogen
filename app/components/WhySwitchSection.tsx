'use client';

import {useEffect, useRef} from 'react';

const BENEFITS = [
  {
    emoji: '🌿',
    headline: 'Actually smells luxurious',
    body: 'A sophisticated scent from pure essential oils.',
  },
  {
    emoji: '💧',
    headline: 'Gentle on sensitive skin',
    body: 'Comfortable enough for everyday use.',
  },
  {
    emoji: '👕',
    headline: "Won't stain clothing",
    body: 'Designed to go on clean.',
  },
  {
    emoji: '♻️',
    headline: 'Refillable instead of disposable',
    body: 'Less waste. More value.',
  },
] as const;

export function WhySwitchSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('wss-visible');
          observer.disconnect();
        }
      },
      {threshold: 0.1},
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scrollToPurchase = () => {
    const el = document.getElementById('purchase-section');
    if (el) {
      el.scrollIntoView({behavior: 'smooth', block: 'start'});
    } else {
      window.scrollTo({top: 0, behavior: 'smooth'});
    }
  };

  return (
    <section className="wss-root">
      <div className="wss-inner" ref={sectionRef}>
        {/* Image */}
        <div className="wss-image-wrap">
          <img
            src="/images/IMG_4345.JPG"
            alt="Woman applying Aromaz natural deodorant"
            className="wss-image"
            loading="lazy"
          />
        </div>

        {/* Content */}
        <div className="wss-content">
          <h2 className="wss-heading">Why People Switch to Aromaz</h2>

          <ul className="wss-list" role="list">
            {BENEFITS.map((b) => (
              <li key={b.headline} className="wss-item">
                <span className="wss-emoji" aria-hidden="true">
                  {b.emoji}
                </span>
                <div className="wss-text">
                  <strong className="wss-item-headline">{b.headline}</strong>
                  <span className="wss-item-body">{b.body}</span>
                </div>
              </li>
            ))}
          </ul>

          <p className="wss-tagline">
            Once you switch, you won&apos;t want to go back.
          </p>

          <button
            type="button"
            className="wss-cta"
            onClick={scrollToPurchase}
          >
            Feel the Difference
          </button>
        </div>
      </div>
    </section>
  );
}
