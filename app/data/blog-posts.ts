export type BlogPost = {
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  readingTime: string;
  content: string[];
};

export const BLOG_POSTS = [
  {
    title: 'What Makes My Skin Red and Irritated',
    slug: 'what-makes-my-skin-red-and-irritated',
    excerpt:
      'An educational look at what causes deodorant irritation, and how ingredient choice and concentration make the difference.',
    publishedAt: '2026-08-13',
    readingTime: '5 min read',
    content: [
      'Why Deodorant Irritation Happens — and How We Solved It',
      'Skin irritation from deodorant is more common than most brands let on. For many people, it follows a predictable pattern: a few clean days, then redness, burning, or a rash that shows up like clockwork — often by day 3 with drugstore formulas, sometimes stretching to day 5 or 6 with pricier “natural” ones. The advice usually given is to rotate, take breaks, or just accept it as sensitive skin. But the real issue often isn’t the skin — it’s the formula.',
      'The synthetic fragrance problem. Most deodorants, including many marketed as natural, rely on synthetic fragrance blends. They’re potent, shelf-stable, and cheap to produce — which is exactly why they’re the industry default. But that same potency is often what triggers irritation on delicate underarm skin. The alternative is essential oils: concentrated plant and flower extracts. They’re harder to work with — blending them into a scent people actually want to wear takes real trial and error, far more than mixing a lab-formulated synthetic. That difficulty is precisely why so few brands bother.',
      'Concentration matters as much as ingredients. Even with essential oils, there’s a tipping point. Past a certain concentration, essential oils stop being protective and start being irritating — the same mechanism that makes synthetic fragrance risky. The goal isn’t maximum scent strength; it’s the balance point where a formula smells intentional without overwhelming the skin barrier.',
      'How Aromaz approaches it. Aromaz deodorants are formulated with organic, premium essential oils, calibrated below that irritation threshold. Each of our five signature scents went through extensive iteration to land on a blend that’s distinct and wearable — without depending on synthetic fragrance load to get there. The result is a deodorant designed to be worn daily, not cycled on and off.',
    ],
  },
] satisfies BlogPost[];

export function getBlogPost(slug: string) {
  return BLOG_POSTS.find((post) => post.slug === slug);
}
