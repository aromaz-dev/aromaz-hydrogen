import {useState} from 'react';

export type JudgeMeReview = {
  id: string;
  rating: number;
  title?: string;
  body?: string;
  reviewerName?: string;
  createdAt?: string;
};

export function JudgeMeReviews({reviews}: {reviews: JudgeMeReview[]}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const reviewCount = reviews.length;
  const activeReview = reviews[activeIndex % Math.max(reviewCount, 1)];
  const averageRating =
    reviewCount > 0
      ? reviews.reduce((total, review) => total + review.rating, 0) /
        reviewCount
      : 0;

  function showPreviousReview() {
    setActiveIndex((current) =>
      current === 0 ? reviewCount - 1 : current - 1,
    );
  }

  function showNextReview() {
    setActiveIndex((current) => (current + 1) % reviewCount);
  }

  return (
    <section className="mx-auto mt-12 max-w-5xl border-t border-charcoal/10 px-0 pt-12 text-center md:pt-16">
      <div className="mx-auto max-w-2xl">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[#4a5e3a]">
          Reviews
        </p>
        <h2 className="mt-3 font-serif text-3xl text-charcoal md:text-4xl">
          Customer Experience
        </h2>

        {reviewCount > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 font-sans text-sm text-charcoal/70">
            <span
              aria-label={`${averageRating.toFixed(1)} out of 5 stars`}
              className="font-semibold tracking-[0.08em] text-[#4a5e3a]"
            >
              {renderStars(averageRating)}
            </span>
            <span>
              {averageRating.toFixed(1)} from {reviewCount}{' '}
              {reviewCount === 1 ? 'review' : 'reviews'}
            </span>
            <span
              aria-label="Judge.me verified"
              className="inline-flex items-center gap-1.5 font-sans text-xs font-medium text-charcoal/65"
            >
              <svg
                aria-hidden="true"
                className="h-3.5 w-3.5 shrink-0"
                fill="none"
                viewBox="0 0 16 16"
              >
                <circle cx="8" cy="8" fill="#00b67a" r="8" />
                <path
                  d="M4.4 8.2 6.8 10.5 11.7 5.4"
                  stroke="#fff"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                />
              </svg>
              Verified
            </span>
          </div>
        )}
      </div>

      {reviewCount === 0 || !activeReview ? (
        <p className="mt-8 font-sans text-sm text-charcoal/60">
          No reviews yet.
        </p>
      ) : (
        <div className="relative mx-auto mt-8 max-w-4xl md:mt-10">
          <button
            type="button"
            aria-label="Show previous review"
            onClick={showPreviousReview}
            className="absolute left-0 top-1/2 z-10 hidden h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#4a5e3a]/20 bg-off-white text-2xl leading-none text-[#4a5e3a] shadow-[0_14px_34px_rgba(32,35,34,0.12)] transition hover:bg-[#4a5e3a] hover:text-off-white md:inline-flex"
          >
            <span aria-hidden="true">&#8249;</span>
          </button>

          <article className="rounded-lg border border-[#4a5e3a]/12 bg-[#fdfaf4] px-6 py-10 shadow-[0_24px_70px_rgba(32,35,34,0.08)] md:px-16 md:py-14">
            <p
              aria-hidden="true"
              className="font-serif text-6xl leading-none text-[#4a5e3a]/25 md:text-7xl"
            >
              &ldquo;
            </p>

            {activeReview.title && (
              <h3 className="mx-auto mt-1 max-w-2xl font-serif text-xl text-charcoal md:text-2xl">
                {activeReview.title}
              </h3>
            )}

            {activeReview.body && (
              <p className="mx-auto mt-4 max-w-2xl font-sans text-base leading-relaxed text-charcoal/78 md:text-lg md:leading-8">
                {activeReview.body}
              </p>
            )}

            <div
              aria-label={`${activeReview.rating} out of 5 stars`}
              className="mt-7 font-sans text-lg font-semibold tracking-[0.14em] text-[#4a5e3a]"
            >
              {renderStars(activeReview.rating)}
            </div>

            {activeReview.reviewerName && (
              <p className="mt-4 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[#4a5e3a]">
                {activeReview.reviewerName}
              </p>
            )}
          </article>

          <button
            type="button"
            aria-label="Show next review"
            onClick={showNextReview}
            className="absolute right-0 top-1/2 z-10 hidden h-11 w-11 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#4a5e3a]/20 bg-off-white text-2xl leading-none text-[#4a5e3a] shadow-[0_14px_34px_rgba(32,35,34,0.12)] transition hover:bg-[#4a5e3a] hover:text-off-white md:inline-flex"
          >
            <span aria-hidden="true">&#8250;</span>
          </button>

          {reviewCount > 1 && (
            <div className="mt-5 flex items-center justify-center gap-3 md:hidden">
              <button
                type="button"
                aria-label="Show previous review"
                onClick={showPreviousReview}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#4a5e3a]/20 bg-off-white text-xl leading-none text-[#4a5e3a]"
              >
                <span aria-hidden="true">&#8249;</span>
              </button>
              <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-charcoal/50">
                {activeIndex + 1} / {reviewCount}
              </p>
              <button
                type="button"
                aria-label="Show next review"
                onClick={showNextReview}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#4a5e3a]/20 bg-off-white text-xl leading-none text-[#4a5e3a]"
              >
                <span aria-hidden="true">&#8250;</span>
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function renderStars(rating: number) {
  const roundedRating = Math.round(rating);
  return `${'★'.repeat(roundedRating)}${'☆'.repeat(
    Math.max(5 - roundedRating, 0),
  )}`;
}
