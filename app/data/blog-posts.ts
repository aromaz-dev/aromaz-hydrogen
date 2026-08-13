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
      'I always had issues with my deodorant no matter how much I spent on natural deodorants but if I use it consistently meaning everyday I would end up on with red irritated armpit on day 5 or 6 so I need to take a break of showering more often quitting deodorant for few days and put absolutely nothing or a little bit of baby oil on the area after the shower until the irritation sooths and the burning feeling and redness goes away. I lived with it as if it is what it is.',
      'With a cheap deodorant from Walmart I would have the irritation on day 3 and if I spent on very natural high end brands it happened on day 5. So it was a reality that I thought I should love with. When I decided to make my own deodorant and I called it Aromaz and  I didn’t expect to end up with a formula that actually fix my skin sensitivity issue. I never imagined the solution can be that easy.',
      'It made me wonder what it was in other deodorants even in natural ones that caused my skin burn after few days. I have few ideas on what it could be the cause. Most of the deodorants even the natural ones use synthetic perfumes in them. Yes they smell amazing and the scent is very strong but that can be cause of skin irritation.',
      'When I was designing my own deodorant I made sure I only use organic and premium essential oils. Essential oils are basically flowers and hers extracts in a concentrated form. So the question comes to mind of why all these brands use perfumes instead of? Well, I tell you the answer 😄 it’s so freaking hard to mix essential oils and make a pleasant scent that can be so amazing that you wanna wear every day.',
      'I remember purchasing hundreds of essential oils and sitting with friends and family and mixing these essential oils and sniffing and trying and that effort was lots of work to get Sacred Santal I remember grabbing a huge box of essential oils into my car and driving to my best friend and sitting together and joking and mixing and trying many different versions of essential oils and sometimes we made scents that we would laugh about cause you are not always lucky to even create a decent scent. Sometimes it can be extremely funny.',
      'However, I learned perfumery is a whole field and requires labs and measurements and people with passion. We were able to make five unique scents after lots of effort and trial and error and spending so much on many different essential oils. So I think that could be the reason why Aromaz does not give me any skin irritation. Most brands purchase a synthetic perfumes that is premixed synthetically in the lab.',
      'My second assumption is around how much of these perfumes they use. As much as it’s fun to have very strongly scented deodorant that you smell it as strong as a solid perfume but that is yet another reason for skin irritation. You can’t exceed a certain percentage of how much essential oil you add, if it passes a certain percentage it can easily cause skin irritation. So, a balanced amount of essential oils that make the deodorant smell amazing but also safe for our skin.',
    ],
  },
] satisfies BlogPost[];

export function getBlogPost(slug: string) {
  return BLOG_POSTS.find((post) => post.slug === slug);
}
