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
      'A personal note from Aromaz on sensitive underarms, fragrance choices, and why balanced essential oil blends matter.',
    publishedAt: '2026-08-13',
    readingTime: '5 min read',
    content: [
      'I always had issues with my deodorant, no matter how much I spent on natural options. If I used it consistently — every day — I’d end up with a red, irritated armpit by day 5 or 6. I’d have to take a break: shower more often, quit deodorant for a few days, and put absolutely nothing (or a little baby oil) on the area until the irritation, burning, and redness went away. I lived with it, telling myself that’s just how it was. With a cheap deodorant from Walmart, the irritation would show up by day 3. With high-end natural brands, I could stretch it to day 5. It felt like a reality I just had to accept.',
      'When I decided to make my own deodorant — and called it Aromaz — I didn’t expect to end up with a formula that actually fixed my skin sensitivity. I never imagined the solution could be that simple. It made me wonder what was in other deodorants, even the natural ones, that caused my skin to burn after a few days. I have a few ideas about what the cause might be.',
      'Most deodorants, even natural ones, use synthetic perfumes. Yes, they smell amazing and the scent is strong — but that strength can be exactly what causes the irritation. When I was designing my own deodorant, I made sure to only use organic, premium essential oils. Essential oils are basically flower and herb extracts in concentrated form. So why do most brands use synthetic perfumes instead? I’ll tell you the answer: it’s so freaking hard to mix essential oils into a scent that’s pleasant enough to actually want to wear every day.',
      'I remember buying dozens of essential oils, sitting with friends and family, mixing and sniffing and testing. I remember loading a huge box of essential oils into my car and driving to my best friend’s place, sitting together, joking, mixing, and trying dozens of versions to land on Sacred Santal. We didn’t always get it right — some of the scents we made were genuinely funny, not in a good way. I learned that perfumery is its own field, one that usually requires labs, precise measurements, and people who’ve spent years on it. Still, after a lot of trial and error and a lot of money spent on essential oils, we landed on five unique scents.',
      'I think that’s part of why Aromaz doesn’t irritate my skin. Most brands use synthetic perfume that’s premixed in a lab. My second theory is about concentration — how much of that perfume they use. As fun as it is to have a deodorant that smells as strong as a solid perfume, that strength is often exactly what triggers irritation. There’s a threshold: once you go past a certain percentage of essential oil, it can start causing irritation instead of preventing it. So the goal became balance — enough essential oil to smell amazing, but not so much that it stops being safe for skin.',
    ],
  },
] satisfies BlogPost[];

export function getBlogPost(slug: string) {
  return BLOG_POSTS.find((post) => post.slug === slug);
}
