import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/($locale).blog._index';
import {BLOG_POSTS} from '~/data/blog-posts';

export const meta: Route.MetaFunction = () => {
  return [
    {title: 'Aromaz Blog | Natural Scent Care Journal'},
    {
      name: 'description',
      content:
        'Read Aromaz notes on sensitive skin, natural deodorant, botanical scents, refillable care, and everyday rituals.',
    },
  ];
};

export async function loader() {
  return {posts: BLOG_POSTS};
}

export default function BlogIndex() {
  const {posts} = useLoaderData<typeof loader>();

  return (
    <main className="aromaz-blog-page">
      <section className="aromaz-blog-hero">
        <p>AROMAZ JOURNAL</p>
        <span>
          Personal stories, ingredient thoughts, and simple care rituals from
          the Aromaz studio.
        </span>
      </section>

      <section className="aromaz-blog-list" aria-label="Blog posts">
        {posts.map((post) => (
          <article className="aromaz-blog-card" key={post.slug}>
            <div>
              <p>{formatPostDate(post.publishedAt)}</p>
              <h2>{post.title}</h2>
              <span>{post.excerpt}</span>
            </div>
            <Link to={`/blog/${post.slug}`} prefetch="intent">
              Read article
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}

function formatPostDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}
