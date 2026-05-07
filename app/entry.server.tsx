import {ServerRouter} from 'react-router';
import {isbot} from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {
  createContentSecurityPolicy,
  type HydrogenRouterContextProvider,
} from '@shopify/hydrogen';
import type {EntryContext} from 'react-router';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
  context: HydrogenRouterContextProvider,
) {
  const {nonce, header, NonceProvider} = createContentSecurityPolicy({
    shop: {
      checkoutDomain: context.env.PUBLIC_CHECKOUT_DOMAIN,
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
    scriptSrc: [
      "'self'",
      'https://cdn.shopify.com',
      'https://analytics.tiktok.com',
    ],
    connectSrc: [
      "'self'",
      'https://analytics.tiktok.com',
      'https://www.google.com',
      'https://maps.googleapis.com',
      'https://maps.gstatic.com',
    ],
    imgSrc: [
      "'self'",
      'https://cdn.shopify.com',
      'https://analytics.tiktok.com',
      'https://www.google.com',
      'https://maps.googleapis.com',
      'https://maps.gstatic.com',
      'https://*.googleusercontent.com',
      'https://tile.openstreetmap.org',
    ],
    frameSrc: [
      "'self'",
      'https://www.google.com',
      'https://maps.google.com',
    ],
  });

  const body = await renderToReadableStream(
    <NonceProvider>
      <ServerRouter
        context={reactRouterContext}
        url={request.url}
        nonce={nonce}
      />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', header);

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
