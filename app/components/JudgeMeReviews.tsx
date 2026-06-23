export type JudgeMeReview = {
  id: string;
  rating: number;
  title?: string;
  body?: string;
  reviewerName?: string;
  createdAt?: string;
};

export function JudgeMeReviews({reviews}: {reviews: JudgeMeReview[]}) {
  const reviewCount = reviews.length;
  const averageRating =
    reviewCount > 0
      ? reviews.reduce((total, review) => total + review.rating, 0) /
        reviewCount
      : 0;

  return (
    <section className="mt-12 border-t border-charcoal/10 pt-10">
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-olive">
            Reviews
          </p>
          <h2 className="mt-2 font-serif text-2xl text-charcoal">
            Customer reviews
          </h2>
        </div>
        {reviewCount > 0 && (
          <p className="font-sans text-sm text-charcoal/70">
            {averageRating.toFixed(1)} out of 5 from {reviewCount}{' '}
            {reviewCount === 1 ? 'review' : 'reviews'}
          </p>
        )}
      </div>

      {reviewCount === 0 ? (
        <p className="font-sans text-sm text-charcoal/60">
          No reviews yet.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-md border border-charcoal/10 bg-white p-5"
            >
              <div className="mb-3 flex items-center justify-between gap-4">
                <div
                  aria-label={`${review.rating} out of 5 stars`}
                  className="font-sans text-sm font-semibold tracking-[0.08em] text-terracotta"
                >
                  {'★'.repeat(Math.round(review.rating))}
                  {'☆'.repeat(Math.max(5 - Math.round(review.rating), 0))}
                </div>
                {review.createdAt && (
                  <time
                    dateTime={review.createdAt}
                    className="font-sans text-xs text-charcoal/50"
                  >
                    {formatReviewDate(review.createdAt)}
                  </time>
                )}
              </div>
              {review.title && (
                <h3 className="font-serif text-lg text-charcoal">
                  {review.title}
                </h3>
              )}
              {review.body && (
                <p className="mt-2 font-sans text-sm leading-relaxed text-charcoal/75">
                  {review.body}
                </p>
              )}
              {review.reviewerName && (
                <p className="mt-4 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-olive">
                  {review.reviewerName}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function formatReviewDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}
