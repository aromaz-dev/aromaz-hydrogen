'use client';

import {useEffect, useRef, useState} from 'react';

const FREE_SHIPPING_THRESHOLD = 50;

function formatRemaining(amount: number, currencyCode: string): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function FreeShippingUpsell({
  subtotal,
  currencyCode = 'CAD',
}: {
  subtotal: number;
  currencyCode?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // Fade-in on mount
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const unlocked = subtotal >= FREE_SHIPPING_THRESHOLD;

  return (
    <div
      ref={cardRef}
      className={`fsu-card${mounted ? ' fsu-card--visible' : ''}${unlocked ? ' fsu-card--unlocked' : ''}`}
    >
      {unlocked ? (
        /* ── Unlocked state ── */
        <div className="fsu-unlocked">
          <span className="fsu-unlocked-icon" aria-hidden="true">✓</span>
          <div>
            <p className="fsu-unlocked-title">Free Shipping Unlocked</p>
            <p className="fsu-unlocked-body">
              Your order qualifies for free shipping.
            </p>
          </div>
        </div>
      ) : (
        /* ── Progress state ── */
        <>
          <p className="fsu-headline">
            <span className="fsu-truck" aria-hidden="true">🚚</span>
            {" You’re only "}
            {/* key forces re-mount → re-triggers the pop animation on change */}
            <span
              key={Math.ceil(remaining * 100)}
              className="fsu-amount"
            >
              {formatRemaining(remaining, currencyCode)}
            </span>
            {' away from '}
            <strong>Free Shipping</strong>
          </p>

        </>
      )}

      {/* ── Progress bar ── */}
      <div className="fsu-bar-track" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
        <div
          className="fsu-bar-fill"
          style={{width: `${progress}%`}}
        />
      </div>
    </div>
  );
}
