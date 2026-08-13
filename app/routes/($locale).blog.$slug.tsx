import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/($locale).blog.$slug';
import {getBlogPost} from '~/data/blog-posts';

export const meta: Route.MetaFunction = ({data}) => {
  const post = data?.post;

  return [
    {title: post ? `${post.title} | Aromaz Blog` : 'Aromaz Blog'},
    ...(post
      ? [
          {
            name: 'description',
            content: post.excerpt,
          },
        ]
      : []),
  ];
};

export async function loader({params}: Route.LoaderArgs) {
  if (!params.slug) {
    throw new Response('Not found', {status: 404});
  }

  const post = getBlogPost(params.slug);

  if (!post) {
    throw new Response('Not found', {status: 404});
  }

  return {post};
}

export default function BlogArticle() {
  const {post} = useLoaderData<typeof loader>();

  return (
    <main className="aromaz-blog-article-page">
      <article className="aromaz-blog-article">
        <Link className="aromaz-blog-back-link" to="/blog" prefetch="intent">
          Back to Blog
        </Link>
        <header>
          <p>AROMAZ JOURNAL</p>
          <h1>{post.title}</h1>
          <div>
            <time dateTime={post.publishedAt}>
              {formatPostDate(post.publishedAt)}
            </time>
            <span>{post.readingTime}</span>
          </div>
        </header>
        <div className="aromaz-blog-article-body">
          {post.content.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>
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
