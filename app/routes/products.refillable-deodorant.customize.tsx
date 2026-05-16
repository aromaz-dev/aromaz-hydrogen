'use client';
// v4: Add-to-cart builder flow via CartForm

import {Link, useLoaderData, data, useSearchParams} from 'react-router';
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
import {LOCAL_IMAGE_FALLBACKS, isDemoOrPlaceholderImage} from '~/lib/local-images';

function getConnectionNodes<T>(
  connection: {nodes?: T[]; edges?: Array<{node: T}>} | null | undefined,
): T[] {
  if (!connection) return [];
  if (Array.isArray(connection.nodes)) return connection.nodes;
  if (Array.isArray(connection.edges)) {
    return connection.edges.map((edge) => edge.node).filter(Boolean);
  }
  return [];
}

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
  const caseVariants = useMemo(
    () => getConnectionNodes<any>(caseProduct?.variants),
    [caseProduct?.variants],
  );
  const refillVariants = useMemo(
    () => getConnectionNodes<any>(refillProduct?.variants),
    [refillProduct?.variants],
  );
  const [searchParams] = useSearchParams();
  const requestedScent = searchParams.get('scent');
  const requestedStrength = STRENGTH_OPTIONS.includes(
    searchParams.get('strength') as Strength,
  )
    ? (searchParams.get('strength') as Strength)
    : 'Strong';

  // Extract selling plans from API data
  const sellingPlans = useMemo(
    () => flattenSellingPlans(refillProduct.sellingPlanGroups),
    [refillProduct.sellingPlanGroups],
  );

  const [currentStep, setCurrentStep] = useState(() =>
    requestedScent ? 2 : 1,
  );
  const [selectedCase, setSelectedCase] = useState<any>(
    () => caseVariants[0] || null,
  );
  // null = one-time purchase, string = selling plan ID
  const [selectedSellingPlanId, setSelectedSellingPlanId] = useState<string | null>(null);
  const [selectedStrength, setSelectedStrength] =
    useState<Strength>(requestedStrength);
  const [selectedScent, setSelectedScent] = useState<any>(
    () =>
      (requestedScent
          ? findVariant(
            refillVariants,
            requestedScent,
            requestedStrength,
          )
        : null) ||
      refillVariants.find((v: any) =>
        v.title.endsWith(requestedStrength),
      ) ||
      null,
  );

  // Filter scents by selected strength
  const filteredScents = filterByStrength(
    refillVariants,
    selectedStrength,
  );

  // Handler for strength changes - updates selected scent to match new strength
  const handleStrengthChange = (strength: string) => {
    setSelectedStrength(strength as Strength);
    const currentScentName = selectedScent ? getScentName(selectedScent.title) : null;
    if (currentScentName) {
      const newVariant = findVariant(
        refillVariants,
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
    else if (currentStep === 2 && selectedScent) setCurrentStep(3);
  };

  // Plan step always allows proceed (null = one-time purchase is valid)
  const canProceed =
    (currentStep === 1 && selectedCase) ||
    (currentStep === 2 && selectedScent) ||
    (currentStep === 3 && selectedScent);

  // Helper to get plan display name
  const getPlanDisplayName = () => {
    if (selectedSellingPlanId === null) return 'One-Time Purchase';
    return selectedPlan?.name || 'Subscription';
  };
  const summaryScent =
    currentStep > 1 && selectedScent ? getScentName(selectedScent.title) : '--';
  const summaryPlan = currentStep > 2 ? getPlanDisplayName() : '--';

  const getCaseImageUrl = (variant: any) =>
    isDemoOrPlaceholderImage(variant?.image?.url)
      ? LOCAL_IMAGE_FALLBACKS.case
      : variant.image.url;

  const getScentImageUrl = (variant: any) =>
    isDemoOrPlaceholderImage(variant?.image?.url)
      ? LOCAL_IMAGE_FALLBACKS.scent
      : variant.image.url;
  const showScentPreview = currentStep === 2 || currentStep === 3;
  const previewVariant = showScentPreview ? selectedScent : selectedCase;
  const previewImageUrl = previewVariant
    ? showScentPreview
      ? getScentImageUrl(previewVariant)
      : getCaseImageUrl(previewVariant)
    : null;
  const previewAlt = previewVariant?.title || 'Aromaz deodorant selection';

  return (
    <div className="customizer-page min-h-screen bg-cream md:pb-0 relative">
      {/* Desktop Header */}
      <div className="hidden md:block border-b border-charcoal/10 bg-off-white px-16 py-8">
        <div className="max-w-7xl mx-auto">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.22em] text-olive">
            Refillable deodorant builder
          </p>
          <h1 className="mt-3 font-serif text-5xl leading-tight text-charcoal">
            Build Your Refillable Deodorant
          </h1>
          <p className="font-sans text-lg text-charcoal/70 mt-3 max-w-2xl">
            Choose a case, botanical scent, and refill plan. Your selected
            setup stays visible while you build.
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
                {currentStep === 2 || currentStep === 3 ? (
                  selectedScent?.image ? (
                    <img
                      src={getScentImageUrl(selectedScent)}
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
                    src={getCaseImageUrl(selectedCase)}
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
                  {currentStep === 2 && "Choose your Scent"}
                  {currentStep === 3 && "Choose your Plan"}
                </h3>
                <p className="font-sans text-xs text-charcoal/60 mt-1 truncate">
                   {currentStep === 1 && (selectedCase ? selectedCase.title : "Select a style")}
                   {currentStep === 2 && (selectedScent ? getScentName(selectedScent.title) : "Select a scent")}
                   {currentStep === 3 && getPlanDisplayName()}
                </p>
              </div>

              {/* Strength Selector (Step 2 only) */}
              {currentStep === 2 && (
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
                    {caseVariants.map((variant: any) => {
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
                                src={getCaseImageUrl(variant)}
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

              {/* Step 2: Scent Selection */}
              {currentStep === 2 && (
                <ScentGrid
                  scents={filteredScents as ScentOption[]}
                  selectedId={selectedScent?.id || null}
                  onSelect={(scent) => setSelectedScent(scent)}
                  layout="circular"
                />
              )}

              {/* Step 3: Plan Selection */}
              {currentStep === 3 && (
                <SubscriptionSelector
                  sellingPlans={sellingPlans}
                  selectedPlanId={selectedSellingPlanId}
                  onSelect={setSelectedSellingPlanId}
                  basePrice={scentPrice}
                  currencyCode={currencyCode}
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
                {num: 2, label: 'Scent'},
                {num: 3, label: 'Plan'},
              ].map(({num, label}) => (
                <div key={num} className="flex items-center">
                  <button
                    onClick={() => {
                      if (
                        num === 1 ||
                        (num === 2 && selectedCase) ||
                        (num === 3 && selectedCase && selectedScent)
                      ) {
                        setCurrentStep(num);
                      }
                    }}
                    disabled={
                      (num === 2 && !selectedCase) ||
                      (num === 3 && (!selectedCase || !selectedScent))
                    }
                    className={`flex flex-col items-center gap-2 ${
                      currentStep === num
                        ? 'text-terracotta'
                        : num === 1 ||
                          (num === 2 && selectedCase) ||
                          (num === 3 && selectedCase && selectedScent)
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
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-8 md:gap-12">
            {/* Left: Product Preview (Desktop Only) */}
            <div className="hidden lg:block lg:sticky lg:top-24 lg:self-start">
              <div className="customizer-preview">
                {previewImageUrl ? (
                  <div className="aspect-square overflow-hidden rounded-md bg-cream mb-6">
                    <img
                      src={previewImageUrl}
                      alt={previewAlt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-square bg-cream rounded-lg flex items-center justify-center mb-6">
                    <p className="font-sans text-base text-charcoal/40 text-center">
                      {showScentPreview ? 'Select a scent' : 'Select a case'}
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
                  </div>
                  <div className="customizer-summary">
                    <div>
                      <span>Case</span>
                      <strong>{selectedCase?.title || 'Select a case'}</strong>
                    </div>
                    <div>
                      <span>Scent</span>
                      <strong>{summaryScent}</strong>
                    </div>
                    <div>
                      <span>Plan</span>
                      <strong>{summaryPlan}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Selection Interface */}
            <div className="space-y-6 md:space-y-8">
              {/* Step 1: Case Selection */}
              {currentStep === 1 && (
                <div className="customizer-step-panel">
                  <h2 className="hidden md:block font-serif text-3xl text-charcoal mb-4">
                    Choose your case
                  </h2>
                  <p className="hidden md:block font-sans text-lg text-charcoal/70 mb-8">
                    Select a color that speaks to you
                  </p>

                  <div className="grid grid-cols-4 md:grid-cols-3 gap-3 md:gap-6">
                    {caseVariants.map((variant: any) => {
                      const isSelected = selectedCase?.id === variant.id;
                      return (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedCase(variant)}
                          className={`cursor-pointer transition-all rounded-lg p-2 ${
                            isSelected
                              ? 'ring-1 ring-terracotta bg-terracotta/5'
                              : 'hover:bg-charcoal/5'
                          }`}
                          title={variant.title}
                        >
                          {variant.image ? (
                            <div className="aspect-square rounded-lg overflow-hidden mb-1 md:mb-3">
                              <img
                                src={getCaseImageUrl(variant)}
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
                      className="hidden md:block mt-8 w-full min-h-12 rounded-md bg-terracotta px-8 font-sans text-sm font-semibold uppercase tracking-[0.12em] text-cream transition-colors hover:bg-sage"
                    >
                      Continue to Scent
                    </button>
                  )}
                </div>
              )}

              {/* Step 2: Scent Selection */}
              {currentStep === 2 && (
                <div className="customizer-step-panel">
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
                      onClick={() => setCurrentStep(1)}
                    className="flex-1 min-h-12 rounded-md border border-charcoal/20 px-8 font-sans text-sm font-semibold uppercase tracking-[0.12em] text-charcoal hover:border-olive"
                    >
                      Back
                    </button>
                    <button
                      disabled={!selectedScent}
                      onClick={() => setCurrentStep(3)}
                      className={`flex-1 min-h-12 rounded-md px-8 font-sans text-sm font-semibold uppercase tracking-[0.12em] transition-colors ${
                        selectedScent
                          ? 'bg-terracotta text-cream hover:bg-sage'
                          : 'bg-charcoal/15 text-charcoal/45 cursor-not-allowed'
                      }`}
                    >
                      Continue to Plan
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Plan Selection */}
              {currentStep === 3 && (
                <div className="customizer-step-panel">
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

                  <div className="customizer-final-actions hidden md:grid mt-8">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="customizer-final-back min-h-12 rounded-md border border-charcoal/20 px-8 font-sans text-sm font-semibold uppercase tracking-[0.12em] text-charcoal hover:border-olive"
                    >
                      Back
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
                        {(fetcher) => (
                          <button
                            type="submit"
                            disabled={fetcher.state !== 'idle'}
                            className="customizer-final-add w-full min-h-12 rounded-md bg-terracotta px-8 font-sans text-sm font-semibold uppercase tracking-[0.12em] text-cream transition-colors hover:bg-sage disabled:cursor-wait disabled:opacity-70"
                          >
                            {fetcher.state === 'idle'
                              ? `Add to Cart - ${formatPrice(
                                  totalPrice,
                                  currencyCode,
                                )}`
                              : 'Adding...'}
                          </button>
                        )}
                      </CartForm>
                    )}
                    <Link
                      to="/collections/all"
                      className="customizer-final-shop min-h-12 rounded-md border border-charcoal/20 px-8 font-sans text-sm font-semibold uppercase tracking-[0.12em] text-charcoal transition-colors hover:border-olive hover:text-olive inline-flex items-center justify-center"
                    >
                      Continue shopping
                    </Link>
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
                 Back
               </button>
             )}

            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed}
                className={`flex-1 h-12 rounded-md px-6 font-sans text-sm font-semibold uppercase tracking-[0.1em] transition-colors ${
                  canProceed
                    ? 'bg-charcoal text-cream'
                    : 'bg-charcoal/20 text-charcoal/50 cursor-not-allowed'
                }`}
              >
                {currentStep === 1 ? 'Choose Scent' : 'Choose Plan'}
              </button>
            ) : (
              selectedScent &&
              selectedCase && (
                <div className="flex-1 grid gap-2">
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
                    {(fetcher) => (
                      <button
                        type="submit"
                        disabled={fetcher.state !== 'idle'}
                        className="w-full h-12 rounded-md bg-terracotta px-6 font-sans text-sm font-semibold uppercase tracking-[0.1em] text-cream transition-colors disabled:cursor-wait disabled:opacity-70"
                      >
                        {fetcher.state === 'idle'
                          ? `Add to Cart - ${formatPrice(
                              totalPrice,
                              currencyCode,
                            )}`
                          : 'Adding...'}
                      </button>
                    )}
                  </CartForm>
                  <Link
                    to="/collections/all"
                    className="w-full h-11 rounded-md border border-charcoal/20 px-6 font-sans text-xs font-semibold uppercase tracking-[0.1em] text-charcoal transition-colors active:bg-charcoal/5 inline-flex items-center justify-center"
                  >
                    Continue shopping
                  </Link>
                </div>
              )
            )}
        </div>
      </div>
    </div>
  );
}
