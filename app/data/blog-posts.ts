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
      'I remember buying hundreds of essential oils, sitting with friends and family, mixing and sniffing and testing. I remember loading a huge box of essential oils into my car and driving to my best friend’s place, sitting together, joking, mixing, and trying dozens of versions to land on Sacred Santal. We didn’t always get it right — some of the scents we made were genuinely funny, not in a good way. I learned that perfumery is its own field, one that usually requires labs, precise measurements, and people who’ve spent years on it. Still, after a lot of trial and error and a lot of money spent on essential oils, we landed on five unique scents.',
      'I think that’s part of why Aromaz doesn’t irritate my skin. Most brands use synthetic perfume that’s premixed in a lab. My second theory is about concentration — how much of that perfume they use. As fun as it is to have a deodorant that smells as strong as a solid perfume, that strength is often exactly what triggers irritation. There’s a threshold: once you go past a certain percentage of essential oil, it can start causing irritation instead of preventing it. So the goal became balance — enough essential oil to smell amazing, but not so much that it stops being safe for skin.',
    ],
  },
] satisfies BlogPost[];

export function getBlogPost(slug: string) {
  return BLOG_POSTS.find((post) => post.slug === slug);
}
