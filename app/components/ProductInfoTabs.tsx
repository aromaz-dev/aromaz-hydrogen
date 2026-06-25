'use client';

import {useState} from 'react';

type TabId = 'how-to-use' | 'sustainability' | 'ingredients';

const TABS: {id: TabId; label: string}[] = [
  {id: 'how-to-use', label: 'How to Use'},
  {id: 'sustainability', label: 'Sustainability'},
  {id: 'ingredients', label: 'Ingredients'},
];

function HowToUseContent() {
  return (
    <div className="pit-content">
      <p>Apply a small amount to clean, dry underarms.</p>
      <p>
        Because Aromaz is made with skin-loving natural ingredients, it can also
        be used on:
      </p>
      <ul className="pit-list">
        <li>Inner thighs</li>
        <li>Feet</li>
        <li>Under the breasts</li>
        <li>Back of the neck</li>
        <li>Anywhere you want to stay fresh naturally</li>
      </ul>
      <p className="pit-note">A little goes a long way.</p>
      <p className="pit-note">
        45 g lasts approximately 2–3 months of daily use.
      </p>
    </div>
  );
}

function SustainabilityContent() {
  return (
    <div className="pit-content">
      <p>
        <strong>Refillable by design.</strong>
        <br />
        Buy the refillable case once, then simply replace only the refill.
      </p>
      <p>That means:</p>
      <ul className="pit-list">
        <li>Less plastic waste</li>
        <li>Less packaging</li>
        <li>Lower cost over time</li>
        <li>A better choice for the planet</li>
      </ul>
      <p>
        Our goal is simple: create a deodorant that&apos;s better for you and
        better for nature.
      </p>
    </div>
  );
}

function IngredientsContent({ingredients}: {ingredients: string | null}) {
  return (
    <div className="pit-content">
      <p className="pit-ingredients-title">
        <strong>Only Clean Ingredients. Nothing Else.</strong>
      </p>
      {ingredients ? (
        <p className="pit-ingredients-list">{ingredients}</p>
      ) : (
        <p className="pit-ingredients-list pit-ingredients-placeholder">
          Ingredient list not available.
        </p>
      )}
      <p className="pit-allergen-note">
        Contains naturally occurring essential oil allergens where applicable.
      </p>
    </div>
  );
}

function TabContent({
  activeTab,
  ingredients,
}: {
  activeTab: TabId;
  ingredients: string | null;
}) {
  if (activeTab === 'how-to-use') return <HowToUseContent />;
  if (activeTab === 'sustainability') return <SustainabilityContent />;
  return <IngredientsContent ingredients={ingredients} />;
}

export function ProductInfoTabs({
  ingredients,
}: {
  ingredients: string | null;
}) {
  const [activeTab, setActiveTab] = useState<TabId>('how-to-use');
  const [openAccordion, setOpenAccordion] = useState<TabId | null>(
    'how-to-use',
  );

  const toggleAccordion = (id: TabId) => {
    setOpenAccordion((prev) => (prev === id ? null : id));
  };

  return (
    <div className="pit-root">
      {/* ── Desktop: horizontal tabs ── */}
      <div className="pit-tabs-desktop" role="tablist" aria-label="Product information">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`pit-panel-${tab.id}`}
            className={`pit-tab${activeTab === tab.id ? ' pit-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        id={`pit-panel-${activeTab}`}
        role="tabpanel"
        className="pit-tab-panel"
      >
        <TabContent activeTab={activeTab} ingredients={ingredients} />
      </div>

      {/* ── Mobile: accordion ── */}
      <div className="pit-accordion" role="list">
        {TABS.map((tab) => {
          const isOpen = openAccordion === tab.id;
          return (
            <div
              key={tab.id}
              className={`pit-accordion-item${isOpen ? ' pit-accordion-item--open' : ''}`}
              role="listitem"
            >
              <button
                type="button"
                className="pit-accordion-trigger"
                aria-expanded={isOpen}
                onClick={() => toggleAccordion(tab.id)}
              >
                <span>{tab.label}</span>
                <svg
                  className="pit-chevron"
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
              <div className="pit-accordion-body">
                <div className="pit-accordion-body-inner">
                  {tab.id === 'how-to-use' && <HowToUseContent />}
                  {tab.id === 'sustainability' && <SustainabilityContent />}
                  {tab.id === 'ingredients' && (
                    <IngredientsContent ingredients={ingredients} />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
