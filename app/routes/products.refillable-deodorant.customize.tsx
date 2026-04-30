'use client';
// v3: Direct checkout via CartForm

import {useLoaderData, data} from 'react-router';
import type {Route} from './+types/products.refillable-deodorant.customize';
import {PRODUCT_HANDLES} from '~/config/products';
import {CUSTOMIZE_FLOW_DATA_QUERY} from '~/graphql/customize-flow';
import {MOCK_CASE_PRODUCT, MOCK_REFILL_PRODUCT} from '~/lib/mock-products';
import {useState, useMemo} from 'react';
import {CartForm, Money} from '@shopify/hydrogen';
import {StrengthSelector} from '~/components/StrengthSelector';
import {ScentGrid, type ScentOption} from '~/components/ScentGrid';
import {SubscriptionSelector} from '~/components/SubscriptionSelector';
import {
  STRENGTH_OPTIONS,
  getScentName,
  filterByStrength,
  findVariant,
  type Strength,
} from '~/lib/scent-utils';
import {
  flattenSellingPlans,
  calculateSubscriptionPrice,
  getDiscountPercentage,
  formatPrice,
} from '~/lib/subscription-utils';

export async function loader({context}: Route.LoaderArgs) {
  const {storefront} = context;
  console.log('Loader started for customize route');

  let queryCase, queryRefill;
  try {
      const result = await storefront.query(
        CUSTOMIZE_FLOW_DATA_QUERY,
        {
          variables: {
            caseHandle: PRODUCT_HANDLES.DEODORANT_CASE,
            refillHandle: PRODUCT_HANDLES.DEODORANT_REFILL,
          },
        },
      );
      queryCase = result.caseProduct;
      queryRefill = result.refillProduct;
  } catch (e) {
      console.error('Storefront query failed:', e);
  }

  const caseProduct = queryCase || MOCK_CASE_PRODUCT;
  const refillProduct = queryRefill || MOCK_REFILL_PRODUCT;

  console.log('Case Product:', caseProduct?.id);
  console.log('Refill Product:', refillProduct?.id);

  if (!caseProduct || !refillProduct) {
    throw data('Products not found', {status: 404});
  }

  return data(
    {caseProduct, refillProduct},
    {
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    },
  );
}

export default function CustomizeDeodorantRoute() {
  const {caseProduct, refillProduct} = useLoaderData<typeof loader>();

  // Extract selling plans from API data
  const sellingPlans = useMemo(
    () => flattenSellingPlans(refillProduct.sellingPlanGroups),
    [refillProduct.sellingPlanGroups],
  );

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCase, setSelectedCase] = useState<any>(
    () => caseProduct.variants.nodes[0] || null,
  );
  // null = one-time purchase, string = selling plan ID
  const [selectedSellingPlanId, setSelectedSellingPlanId] = useState<string | null>(null);
  const [selectedStrength, setSelectedStrength] = useState<Strength>('Strong');
  const [selectedScent, setSelectedScent] = useState<any>(
    () => refillProduct.variants.nodes.find((v: any) => v.title.endsWith('Strong')) || null,
  );

  // Filter scents by selected strength
  const filteredScents = filterByStrength(
    refillProduct.variants.nodes,
    selectedStrength,
  );

  // Handler for strength changes - updates selected scent to match new strength
  const handleStrengthChange = (strength: string) => {
    setSelectedStrength(strength as Strength);
    const currentScentName = selectedScent ? getScentName(selectedScent.title) : null;
    if (currentScentName) {
      const newVariant = findVariant(
        refillProduct.variants.nodes,
        currentScentName,
        strength as Strength,
      );
      if (newVariant) setSelectedScent(newVariant);
    }
  };

  // Price calculations using API data
  const casePrice = selectedCase ? parseFloat(selectedCase.price.amount) : 0;
  const scentPrice = selectedScent ? parseFloat(selectedScent.price.amount) : 0;
  const currencyCode = selectedScent?.price?.currencyCode || 'CAD';

  // Calculate subscription price based on selected plan
  const selectedPlan = sellingPlans.find((p) => p.id === selectedSellingPlanId);
  const adjustedScentPrice = selectedPlan
    ? calculateSubscriptionPrice(scentPrice, selectedPlan.priceAdjustments)
    : scentPrice;
  const totalPrice = casePrice + adjustedScentPrice;
  const discountPercentage = selectedPlan
    ? getDiscountPercentage(selectedPlan.priceAdjustments)
    : null;

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((c) => c - 1);
  };

  const handleNext = () => {
    if (currentStep === 1 && selectedCase) setCurrentStep(2);
    else if (currentStep === 2) setCurrentStep(3); // Plan step always allows proceed (one-time is valid)
  };

  // Plan step always allows proceed (null = one-time purchase is valid)
  const canProceed =
    (currentStep === 1 && selectedCase) ||
    currentStep === 2 ||
    (currentStep === 3 && selectedScent);

  // Helper to get plan display name
  const getPlanDisplayName = () => {
    if (selectedSellingPlanId === null) return 'One-Time Purchase';
    return selectedPlan?.name || 'Subscription';
  };

  return (
    <div className="min-h-screen bg-cream md:pb-0 relative">
      {/* Desktop Header */}
      <div className="hidden md:block py-8 px-16 border-b border-charcoal/10">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-serif text-4xl text-charcoal">
            Build Your Refillable Deodorant
          </h1>
          <p className="font-sans text-lg text-charcoal/70 mt-2">
            Customize your perfect combination
          </p>
        </div>
      </div>

      {/* Mobile Split Layout Wrapper - Fixed Viewport to prevent body scroll */}
      <div className="md:hidden fixed top-[64px] left-0 right-0 bottom-0 flex flex-col overflow-hidden bg-cream z-0">
        
        {/* Top Fixed Section: Image + Progress + Title */}
        <div className="flex-none w-full bg-cream z-20 shadow-sm">
            {/* 1. Large Full-Width Image */}
            <div className="w-full h-[30vh] min-h-[180px] bg-cream">
              <div className="w-full h-full transition-all duration-500 transform">
                {currentStep === 3 ? (
                  selectedScent?.image ? (
                    <img
                      src={selectedScent.image.url}
                      alt={selectedScent.title}
                      className="w-full h-full object-cover drop-shadow-xl"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-charcoal/5 border-b border-charcoal/5">
                      <span className="text-xs text-charcoal/30">Select a Scent</span>
                    </div>
                  )
                ) : selectedCase?.image ? (
                  <img
                    src={selectedCase.image.url}
                    alt={selectedCase.title}
                    className="w-full h-full object-cover drop-shadow-xl"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-charcoal/5 border-b border-charcoal/5">
                    <span className="text-xs text-charcoal/30">Select a Case</span>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Progress & Title (Fixed below image) */}
            <div className="px-6 pt-4 pb-2 bg-cream">
               {/* Progress Bars */}
              <div className="flex items-center gap-2 mb-2">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`h-1.5 rounded-full flex-1 transition-all duration-500 ${
                      step <= currentStep ? 'bg-terracotta' : 'bg-charcoal/10'
                    }`}
                  />
                ))}
              </div>

              {/* Step Title */}
              <div>
                <h3 className="font-serif text-2xl text-charcoal leading-tight">
                  {currentStep === 1 && "Choose your Case"}
                  {currentStep === 2 && "Choose your Plan"}
                  {currentStep === 3 && "Choose your Scent"}
                </h3>
                <p className="font-sans text-xs text-charcoal/60 mt-1 truncate">
                   {currentStep === 1 && (selectedCase ? selectedCase.title : "Select a style")}
                   {currentStep === 2 && getPlanDisplayName()}
                   {currentStep === 3 && (selectedScent ? getScentName(selectedScent.title) : "Select a scent")}
                </p>
              </div>

              {/* Strength Selector (Step 3 only) */}
              {currentStep === 3 && (
                <StrengthSelector
                  options={STRENGTH_OPTIONS}
                  selected={selectedStrength}
                  onSelect={handleStrengthChange}
                  className="mt-3"
                />
              )}
            </div>
        </div>

        {/* Bottom Scrollable Section (Options Only) */}
        <div className="flex-1 overflow-y-auto overscroll-contain relative z-10 px-6 pt-4 pb-32">
              {/* Step 1: Case Selection */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-4 gap-4">
                    {caseProduct.variants.nodes.map((variant: any) => {
                      const isSelected = selectedCase?.id === variant.id;
                      
                      // Map titles to colors for the selection border
                      const getCaseColor = (title: string) => {
                        if (title.includes('Black')) return '#202322';
                        if (title.includes('Orange')) return '#CC5500';
                        if (title.includes('Blue')) return '#004488';
                        return '#B2441E'; // Default terracotta
                      };

                      const borderColor = isSelected ? getCaseColor(variant.title) : 'transparent';

                      return (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedCase(variant)}
                          className={`group cursor-pointer transition-all duration-300 rounded-full p-1 transform ${
                            isSelected
                              ? 'scale-110 z-10'
                              : 'opacity-70 scale-95 hover:opacity-100'
                          }`}
                          title={variant.title}
                        >
                          {variant.image ? (
                            <div 
                              className={`aspect-square rounded-full overflow-hidden border-2 transition-all ${isSelected ? 'shadow-md' : ''}`}
                              style={{ borderColor }}
                            >
                              <img
                                src={variant.image.url}
                                alt={variant.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="aspect-square rounded-full bg-charcoal/10" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 2: Plan Selection */}
              {currentStep === 2 && (
                <SubscriptionSelector
                  sellingPlans={sellingPlans}
                  selectedPlanId={selectedSellingPlanId}
                  onSelect={setSelectedSellingPlanId}
                  basePrice={scentPrice}
                  currencyCode={currencyCode}
                />
              )}

              {/* Step 3: Scent Selection */}
              {currentStep === 3 && (
                <ScentGrid
                  scents={filteredScents as ScentOption[]}
                  selectedId={selectedScent?.id || null}
                  onSelect={(scent) => setSelectedScent(scent)}
                  layout="circular"
                />
              )}
        </div>
      </div>

      {/* Desktop Main Content */}
      <div className="hidden md:block py-12 px-16">
        <div className="max-w-7xl mx-auto">
          {/* Desktop Progress Indicator */}
          <div className="mb-12">
            <div className="flex items-center justify-center gap-4">
              {[
                {num: 1, label: 'Case'},
                {num: 2, label: 'Plan'},
                {num: 3, label: 'Scent'},
              ].map(({num, label}) => (
                <div key={num} className="flex items-center">
                  <button
                    onClick={() => {
                      if (
                        num === 1 ||
                        (num === 2 && selectedCase) ||
                        (num === 3 && selectedCase && selectedPlan)
                      ) {
                        setCurrentStep(num);
                      }
                    }}
                    disabled={!selectedCase && num > 1}
                    className={`flex flex-col items-center gap-2 ${
                      currentStep === num
                        ? 'text-terracotta'
                        : selectedCase || num === 1
                        ? 'text-charcoal cursor-pointer hover:text-terracotta'
                        : 'text-charcoal/30 cursor-not-allowed'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-sans text-sm transition-all ${
                        currentStep === num
                          ? 'bg-terracotta text-cream scale-110'
                          : 'bg-charcoal/10'
                      }`}
                    >
                      {num}
                    </div>
                    <span className="text-sm font-sans">
                      {label}
                    </span>
                  </button>
                  {num < 3 && (
                    <div className="w-24 h-0.5 bg-charcoal/10 mx-2" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Flow Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            {/* Left: Product Preview (Desktop Only) */}
            <div className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
              <div className="bg-off-white rounded-lg p-8">
                {selectedCase?.image ? (
                  <div className="aspect-square rounded-lg overflow-hidden mb-6">
                    <img
                      src={selectedCase.image.url}
                      alt={selectedCase.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-square bg-cream rounded-lg flex items-center justify-center mb-6">
                    <p className="font-sans text-base text-charcoal/40 text-center">
                      Select a case
                    </p>
                  </div>
                )}
                <div className="text-center space-y-2">
                  <h3 className="font-serif text-2xl text-charcoal leading-tight">
                    {selectedCase ? selectedCase.title : 'Your Custom Deodorant'}
                  </h3>
                  <div className="flex flex-col items-center">
                    {selectedScent && (
                      <p className="font-sans text-sm text-terracotta italic">
                        {selectedScent.title} Scent
                      </p>
                    )}
                    <p className="font-sans text-sm text-sage">
                      {getPlanDisplayName()}
                    </p>
                    {totalPrice > 0 && (
                      <p className="font-serif text-3xl text-rose-gold mt-4">
                        {formatPrice(totalPrice, currencyCode)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Selection Interface */}
            <div className="space-y-6 md:space-y-8">
              {/* Step 1: Case Selection */}
              {currentStep === 1 && (
                <div className="bg-white rounded-lg p-4 md:p-8">
                  <h2 className="hidden md:block font-serif text-3xl text-charcoal mb-4">
                    Choose your case
                  </h2>
                  <p className="hidden md:block font-sans text-lg text-charcoal/70 mb-8">
                    Select a color that speaks to you
                  </p>

                  <div className="grid grid-cols-4 md:grid-cols-3 gap-3 md:gap-6">
                    {caseProduct.variants.nodes.map((variant: any) => {
                      const isSelected = selectedCase?.id === variant.id;
                      return (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedCase(variant)}
                          className={`cursor-pointer transition-all rounded-lg p-2 ${
                            isSelected
                              ? 'ring-2 ring-terracotta bg-terracotta/5'
                              : 'hover:bg-charcoal/5'
                          }`}
                          title={variant.title}
                        >
                          {variant.image ? (
                            <div className="aspect-square rounded-lg overflow-hidden mb-1 md:mb-3">
                              <img
                                src={variant.image.url}
                                alt={variant.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="aspect-square rounded-lg bg-charcoal/10 mb-1 md:mb-3" />
                          )}
                          <div className="text-center hidden md:block">
                            <h3 className="font-serif text-lg text-charcoal">
                              {variant.title}
                            </h3>
                            <p className="font-sans text-sm text-terracotta">
                              <Money as="span" data={variant.price} />
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {selectedCase && (
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="hidden md:block mt-8 w-full bg-terracotta hover:bg-terracotta/90 text-cream px-8 py-4 rounded-full font-sans text-lg transition-all hover:scale-105 shadow-md"
                    >
                      Continue to Plan →
                    </button>
                  )}
                </div>
              )}

              {/* Step 2: Plan Selection */}
              {currentStep === 2 && (
                <div className="bg-white rounded-lg p-4 md:p-8">
                  <h2 className="hidden md:block font-serif text-3xl text-charcoal mb-4">
                    Choose your plan
                  </h2>
                  <p className="hidden md:block font-sans text-lg text-charcoal/70 mb-8">
                    Subscribe and save, or try it once
                  </p>

                  <SubscriptionSelector
                    sellingPlans={sellingPlans}
                    selectedPlanId={selectedSellingPlanId}
                    onSelect={setSelectedSellingPlanId}
                    basePrice={scentPrice}
                    currencyCode={currencyCode}
                  />

                  <div className="hidden md:flex gap-4 mt-8">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="flex-1 border-2 border-charcoal/20 text-charcoal px-8 py-4 rounded-full font-sans hover:border-charcoal"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="flex-1 bg-terracotta hover:bg-terracotta/90 text-cream px-8 py-4 rounded-full font-sans transition-all hover:scale-105 shadow-md"
                    >
                      Continue to Scent →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Scent Selection */}
              {currentStep === 3 && (
                <div className="bg-white rounded-lg p-4 md:p-8">
                  <h2 className="hidden md:block font-serif text-3xl text-charcoal mb-4">
                    Choose your scent
                  </h2>
                  <p className="hidden md:block font-sans text-lg text-charcoal/70 mb-4">
                    Crafted from botanical ingredients
                  </p>

                  {/* Strength Selector - Desktop */}
                  <div className="hidden md:block mb-8">
                    <StrengthSelector
                      options={STRENGTH_OPTIONS}
                      selected={selectedStrength}
                      onSelect={handleStrengthChange}
                      className="w-fit"
                    />
                  </div>

                  <ScentGrid
                    scents={filteredScents as ScentOption[]}
                    selectedId={selectedScent?.id || null}
                    onSelect={(scent) => setSelectedScent(scent)}
                    layout="card"
                  />

                  <div className="hidden md:flex gap-4 mt-8">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="flex-1 border-2 border-charcoal/20 text-charcoal px-8 py-4 rounded-full font-sans hover:border-charcoal"
                    >
                      ← Back
                    </button>
                    {selectedScent && selectedCase && (
                      <CartForm
                        route="/cart"
                        action={CartForm.ACTIONS.LinesAdd}
                        inputs={{
                          lines: [
                            {merchandiseId: selectedCase.id, quantity: 1},
                            {
                              merchandiseId: selectedScent.id,
                              quantity: 1,
                              // Include sellingPlanId for subscriptions
                              ...(selectedSellingPlanId && {sellingPlanId: selectedSellingPlanId}),
                            },
                          ],
                        }}
                      >
                        <input
                          type="hidden"
                          name="redirectTo"
                          value="/checkout-redirect"
                        />
                        <button
                          type="submit"
                          className="flex-1 bg-seafoam hover:bg-seafoam/90 text-white px-8 py-4 rounded-full font-sans text-lg transition-all hover:scale-105 shadow-md w-full"
                        >
                          Checkout - {formatPrice(totalPrice, currencyCode)}
                        </button>
                      </CartForm>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Footer - Layer 1: Sticky (see lore/clean_code/z-index-management.md) */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-charcoal/10 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-[var(--z-index-sticky)]"
        style={{paddingBottom: 'max(1rem, env(safe-area-inset-bottom))'}}
      >
        <div className="flex items-center justify-end gap-3">
             {currentStep > 1 && (
               <button
                 onClick={handleBack}
                 className="w-12 h-12 rounded-full border border-charcoal/20 flex items-center justify-center text-charcoal active:bg-charcoal/5"
                 aria-label="Previous step"
               >
                 ←
               </button>
             )}

            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed}
                className={`flex-1 h-12 px-6 rounded-full font-sans font-medium transition-all ${
                  canProceed
                    ? 'bg-charcoal text-cream shadow-md active:scale-95'
                    : 'bg-charcoal/20 text-charcoal/50 cursor-not-allowed'
                }`}
              >
                {currentStep === 1 ? 'Choose Plan' : 'Choose Scent'} →
              </button>
            ) : (
              selectedScent &&
              selectedCase && (
                <div className="flex-1">
                  <CartForm
                    route="/cart"
                    action={CartForm.ACTIONS.LinesAdd}
                    inputs={{
                      lines: [
                        {merchandiseId: selectedCase.id, quantity: 1},
                        {
                          merchandiseId: selectedScent.id,
                          quantity: 1,
                          // Include sellingPlanId for subscriptions
                          ...(selectedSellingPlanId && {sellingPlanId: selectedSellingPlanId}),
                        },
                      ],
                    }}
                  >
                    <input
                      type="hidden"
                      name="redirectTo"
                      value="/checkout-redirect"
                    />
                    <button
                      type="submit"
                      className="w-full h-12 px-6 rounded-full font-sans font-medium bg-seafoam text-white shadow-md active:scale-95 transition-all"
                    >
                      {selectedSellingPlanId ? 'Subscribe' : 'Checkout'}
                    </button>
                  </CartForm>
                </div>
              )
            )}
        </div>
      </div>
    </div>
  );
}
