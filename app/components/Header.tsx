import {Suspense, useState, useEffect, startTransition} from 'react';
import {Await, NavLink, useAsyncValue} from 'react-router';
import {
  type CartViewPayload,
  useAnalytics,
  useOptimisticCart,
} from '@shopify/hydrogen';
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated';
import {useAside} from '~/components/Aside';

interface HeaderProps {
  header: HeaderQuery;
  cart: Promise<CartApiQueryFragment | null>;
  isLoggedIn: Promise<boolean>;
  publicStoreDomain: string;
}

type Viewport = 'desktop' | 'mobile';

export function Header({
  header,
  isLoggedIn,
  cart,
  publicStoreDomain,
}: HeaderProps) {
  const {shop, menu} = header;
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const updateHeader = () => {
      setIsScrolled(window.scrollY > 24);
    };

    updateHeader();
    window.addEventListener('scroll', updateHeader, {passive: true});

    return () => window.removeEventListener('scroll', updateHeader);
  }, []);

  return (
    <header className={`header ${isScrolled ? 'header--scrolled' : ''}`}>
      <NavLink className="header-logo" prefetch="intent" to="/" end>
        <span>{shop.name}</span>
        <small>Natural scent care</small>
      </NavLink>
      <HeaderMenu
        menu={menu}
        viewport="desktop"
        primaryDomainUrl={header.shop.primaryDomain.url}
        publicStoreDomain={publicStoreDomain}
      />
      <NavLink
        className="header-build-link"
        prefetch="intent"
        to="/products/refillable-deodorant/customize"
      >
        Build Your Deodorant
      </NavLink>
      <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
    </header>
  );
}

export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
  publicStoreDomain,
}: {
  menu: HeaderProps['header']['menu'];
  primaryDomainUrl: HeaderProps['header']['shop']['primaryDomain']['url'];
  viewport: Viewport;
  publicStoreDomain: HeaderProps['publicStoreDomain'];
}) {
  const className = `header-menu-${viewport}`;
  const {close} = useAside();

  return (
    <nav className={className} role="navigation">
      {viewport === 'mobile' && (
        <>
          <NavLink
            className="header-menu-item"
            end
            onClick={close}
            prefetch="intent"
            style={activeLinkStyle}
            to="/"
          >
            Home
          </NavLink>
          <NavLink
            className="header-menu-item"
            onClick={close}
            prefetch="intent"
            style={activeLinkStyle}
            to="/collections/all"
          >
            Shop
          </NavLink>
          <NavLink
            className="header-menu-item"
            onClick={close}
            prefetch="intent"
            style={activeLinkStyle}
            to="/catalog"
          >
            Catalog
          </NavLink>
          <NavLink
            className="header-menu-item"
            onClick={close}
            prefetch="intent"
            style={activeLinkStyle}
            to="/pages/contact"
          >
            Contact
          </NavLink>
          <NavLink
            className="header-menu-item"
            onClick={close}
            prefetch="intent"
            style={activeLinkStyle}
            to="/products/refillable-deodorant/customize"
          >
            Build Your Deodorant
          </NavLink>
        </>
      )}
      {viewport === 'desktop' && (
        <>
          <NavLink
            className="header-menu-item"
            end
            onClick={close}
            prefetch="intent"
            style={activeLinkStyle}
            to="/"
          >
            Home
          </NavLink>
          <NavLink
            className="header-menu-item"
            end
            onClick={close}
            prefetch="intent"
            style={activeLinkStyle}
            to="/collections/all"
          >
            Shop
          </NavLink>
          <NavLink
            className="header-menu-item"
            end
            onClick={close}
            prefetch="intent"
            style={activeLinkStyle}
            to="/catalog"
          >
            Catalog
          </NavLink>
          <NavLink
            className="header-menu-item"
            end
            onClick={close}
            prefetch="intent"
            style={activeLinkStyle}
            to="/pages/contact"
          >
            Contact
          </NavLink>
        </>
      )}
      {(menu || FALLBACK_HEADER_MENU).items.map((item) => {
        if (!item.url) return null;

        // if the url is internal, we strip the domain
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        if (
          item.title.toLowerCase() === 'home' ||
          item.title.toLowerCase() === 'shop' ||
          item.title.toLowerCase() === 'products' ||
          item.title.toLowerCase() === 'about' ||
          item.title.toLowerCase() === 'contact' ||
          url === '/' ||
          url === '/collections' ||
          url === '/collections/all' ||
          url === '/pages/contact'
        ) {
          return null;
        }
        return (
          <NavLink
            className="header-menu-item"
            end
            key={item.id}
            onClick={close}
            prefetch="intent"
            style={activeLinkStyle}
            to={url}
          >
            {item.title}
          </NavLink>
        );
      })}
    </nav>
  );
}

function HeaderCtas({
  isLoggedIn,
  cart,
}: Pick<HeaderProps, 'isLoggedIn' | 'cart'>) {
  return (
    <nav className="header-ctas" role="navigation">
      <HeaderMenuMobileToggle />
      <NavLink
        className="header-link header-account"
        prefetch="intent"
        to="/account"
      >
        <Suspense fallback="Sign in">
          <Await resolve={isLoggedIn} errorElement="Sign in">
            {(isLoggedIn) => (isLoggedIn ? 'Account' : 'Sign in')}
          </Await>
        </Suspense>
      </NavLink>
      <SearchToggle />
      <CartToggle cart={cart} />
    </nav>
  );
}

function HeaderMenuMobileToggle() {
  const {open} = useAside();
  return (
    <button
      className="header-menu-mobile-toggle reset"
      onClick={() => open('mobile')}
      aria-label="Open menu"
    >
      <h3>Menu</h3>
    </button>
  );
}

function SearchToggle() {
  const {open} = useAside();
  return (
    <button className="reset header-link" onClick={() => open('search')}>
      Search
    </button>
  );
}

function CartBadge({count}: {count: number | null}) {
  const {open} = useAside();
  const {publish, shop, cart, prevCart} = useAnalytics();

  return (
    <a
      className="header-cart"
      href="/cart"
      onClick={(e) => {
        e.preventDefault();
        open('cart');
        publish('cart_viewed', {
          cart,
          prevCart,
          shop,
          url: window.location.href || '',
        } as CartViewPayload);
      }}
    >
      Cart <span>{count === null ? '' : count}</span>
    </a>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={null} />}>
      <Await resolve={cart}>
        <CartBanner />
      </Await>
    </Suspense>
  );
}

function CartBanner() {
  const originalCart = useAsyncValue() as CartApiQueryFragment | null;
  const cart = useOptimisticCart(originalCart);
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    // Defer optimistic cart count update to avoid hydration mismatch
    startTransition(() => {
      setCount(cart?.totalQuantity ?? 0);
    });
  }, [cart?.totalQuantity]);

  return <CartBadge count={count} />;
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Shop',
      type: 'HTTP',
      url: '/collections/all',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'Contact',
      type: 'PAGE',
      url: '/pages/contact',
      items: [],
    },
  ],
};

function activeLinkStyle({
  isActive,
  isPending,
}: {
  isActive: boolean;
  isPending: boolean;
}) {
  return {
    fontWeight: isActive ? 600 : undefined,
    color: isPending ? '#6B7F5F' : undefined,
  };
}
