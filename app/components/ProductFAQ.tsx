'use client';

import {useState} from 'react';

type FAQItem = {
  id: string;
  question: string;
  answer: React.ReactNode;
};

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'return-policy',
    question: 'What is the return policy?',
    answer: (
      <>
        <p>Because deodorant is a personal care product, we don't expect returns.</p>
        <p>If something went wrong on our end, we'll make it right with a replacement.</p>
        <p>If you tried Aromaz and it simply wasn't for you, that's okay too — we'll refund you.</p>
        <p>Just email: <a href="mailto:info@aromazco.com" className="faq-link">info@aromazco.com</a></p>
        <p>Include:</p>
        <ul>
          <li>Your name</li>
          <li>Your order number</li>
        </ul>
        <p>No hoops. No pressure.</p>
      </>
    ),
  },
  {
    id: 'white-marks',
    question: 'Does it leave white marks?',
    answer: (
      <>
        <p><strong>No.</strong></p>
        <p>Aromaz is designed to glide on smoothly without leaving white streaks or chalky residue on your clothes.</p>
        <p>Our lightweight mango seed butter helps create a silky finish that feels comfortable on skin and is gentle on fabrics.</p>
      </>
    ),
  },
  {
    id: 'how-long',
    question: 'How long does one stick last?',
    answer: (
      <>
        <p>Our full-size refillable deodorant lasts approximately 3 months with daily use.</p>
        <p>Need something smaller?</p>
        <p>Our Mini Deodorant is perfect for travel, your gym bag, or trying a new scent before committing to the full size.</p>
      </>
    ),
  },
  {
    id: 'aluminum-free',
    question: 'Is it really aluminum-free?',
    answer: (
      <>
        <p><strong>Always.</strong></p>
        <ul>
          <li>No aluminum salts.</li>
          <li>No aluminum chlorohydrate.</li>
          <li>Nothing that blocks your pores.</li>
        </ul>
        <p>We use naturally derived ingredients to help keep you fresh instead.</p>
      </>
    ),
  },
  {
    id: 'sensitive-skin',
    question: 'Is it suitable for sensitive skin?',
    answer: (
      <>
        <p>Most customers with sensitive skin love Aromaz.</p>
        <p>We formulate without synthetic fragrances, parabens, or harsh ingredients.</p>
        <p>Because everyone's skin is different, we always recommend patch testing first.</p>
        <p>Many customers also enjoy using Aromaz anywhere sweat and friction cause irritation — it soothes the area, can be used after shaving, and helps prevent heat rash on sensitive skin.</p>
      </>
    ),
  },
  {
    id: 'scents',
    question: 'How do the scents smell?',
    answer: (
      <>
        <p>Every scent is blended using pure essential oils. No synthetic perfumes.</p>
        <dl className="faq-scents">
          <div>
            <dt>Sacred Santal</dt>
            <dd>Warm sandalwood, clove.</dd>
          </div>
          <div>
            <dt>Mystic Earth</dt>
            <dd>Deep earthy woods with patchouli and oud.</dd>
          </div>
          <div>
            <dt>Golden Tropic</dt>
            <dd>Bright tropical notes inspired by sunny island escapes.</dd>
          </div>
          <div>
            <dt>Creamy Delight</dt>
            <dd>Soft, creamy and comforting.</dd>
          </div>
          <div>
            <dt>Rosa</dt>
            <dd>Elegant rose balanced with coconut scent.</dd>
          </div>
        </dl>
      </>
    ),
  },
  {
    id: 'made-where',
    question: 'Where is Aromaz made?',
    answer: (
      <>
        <p>Every Aromaz deodorant is handcrafted in Vancouver, British Columbia.</p>
        <p>We proudly source our beeswax from local BC beekeepers and carefully select premium ingredients from trusted ethical suppliers.</p>
      </>
    ),
  },
  {
    id: 'refills',
    question: 'How do refills work?',
    answer: (
      <>
        <p>Simply remove the empty deodorant pod and insert a refill into your existing Aromaz case.</p>
        <ul>
          <li>Less waste.</li>
          <li>Less packaging.</li>
          <li>Lower environmental impact.</li>
        </ul>
        <p>The refill system lets you keep the premium case while replacing only what you actually use.</p>
      </>
    ),
  },
  {
    id: 'shipping-time',
    question: 'When will my order ship?',
    answer: (
      <>
        <p>Orders are typically delivered within 1–3 business days.</p>
        <p>You'll receive tracking information by email as soon as your package ships.</p>
      </>
    ),
  },
  {
    id: 'shipping-cost',
    question: 'How much is shipping?',
    answer: (
      <>
        <p>Shipping rates are calculated at checkout.</p>
        <p>Orders over $50 CAD qualify for free shipping within Canada.</p>
        <p>We keep our shipping rates as low as possible while ensuring reliable delivery.</p>
      </>
    ),
  },
];

export function ProductFAQ() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="pfaq-root" aria-label="Frequently asked questions">
      <div className="pfaq-inner">
        {/* Header */}
        <div className="pfaq-header">
          <h2 className="pfaq-title">Still have questions?</h2>
          <p className="pfaq-subtitle">
            Everything you need to know.
          </p>
        </div>

        {/* Accordion list */}
        <ul className="pfaq-list" role="list">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openId === item.id;
            return (
              <li
                key={item.id}
                className={`pfaq-item${isOpen ? ' pfaq-item--open' : ''}`}
                role="listitem"
              >
                <button
                  type="button"
                  id={`pfaq-btn-${item.id}`}
                  aria-expanded={isOpen}
                  aria-controls={`pfaq-panel-${item.id}`}
                  className="pfaq-trigger"
                  onClick={() => toggle(item.id)}
                >
                  <span className="pfaq-question">{item.question}</span>
                  <svg
                    className="pfaq-chevron"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                <div
                  id={`pfaq-panel-${item.id}`}
                  role="region"
                  aria-labelledby={`pfaq-btn-${item.id}`}
                  className="pfaq-body"
                >
                  <div className="pfaq-body-inner">
                    <div className="pfaq-answer">{item.answer}</div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Footer note */}
        <p className="pfaq-footer-note">
          Still wondering something?{' '}
          <a href="mailto:info@aromazco.com" className="faq-link">
            Email us anytime at info@aromazco.com
          </a>{' '}
          — we'd love to help.
        </p>
      </div>
    </section>
  );
}
