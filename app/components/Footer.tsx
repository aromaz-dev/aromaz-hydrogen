import {Suspense} from 'react';
import {Await, NavLink} from 'react-router';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';
import {SocialLinks} from '~/components/SocialLinks';

interface FooterProps {
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
}

export function Footer({
  footer: footerPromise,
  header,
  publicStoreDomain,
}: FooterProps) {
  return (
    <Suspense>
      <Await resolve={footerPromise}>
        {(footer) => (
          <footer className="footer">
            <div className="footer-inner">
              <div className="footer-brand">
                <h2>{header.shop.name}</h2>
                <p>
                  Refillable scent care crafted for daily rituals, natural
                  freshness, and less waste on the shelf.
                </p>
                <form
                  className="footer-newsletter"
                  onSubmit={(event) => event.preventDefault()}
                >
                  <label htmlFor="footer-email">Join the Aromaz list</label>
                  <div>
                    <input
                      id="footer-email"
                      type="email"
                      placeholder="Email address"
                    />
                    <button type="submit">Join</button>
                  </div>
                </form>
              </div>
              <div className="footer-links">
                <div>
                  <h3>Shop</h3>
                  <nav>
                    <NavLink to="/collections/all" prefetch="intent">
                      All products
                    </NavLink>
                    <NavLink to="/catalog" prefetch="intent">
                      Catalog
                    </NavLink>
                    <NavLink to="/pages/stockists" prefetch="intent">
                      Find a Store
                    </NavLink>
                    <NavLink
                      to="/products/refillable-deodorant/customize"
                      prefetch="intent"
                    >
                      Build deodorant
                    </NavLink>
                    <NavLink to="/search" prefetch="intent">
                      Search
                    </NavLink>
                    <NavLink to="/pages/contact" prefetch="intent">
                      Contact
                    </NavLink>
                  </nav>
                </div>
                <div>
                  <h3>Support</h3>
                  {footer?.menu && header.shop.primaryDomain?.url && (
                    <FooterMenu
                      menu={footer.menu}
                      primaryDomainUrl={header.shop.primaryDomain.url}
                      publicStoreDomain={publicStoreDomain}
                    />
                  )}
                </div>
                <div className="footer-social">
                  <h3>Social</h3>
                  <SocialLinks compact />
                </div>
              </div>
            </div>
            <div className="footer-bottom">
              <p>Copyright © 2026 Aromaz Cosmetics. All rights reserved.</p>
            </div>
          </footer>
        )}
      </Await>
    </Suspense>
  );
}

function FooterMenu({
  menu,
  primaryDomainUrl,
  publicStoreDomain,
}: {
  menu: FooterQuery['menu'];
  primaryDomainUrl: FooterProps['header']['shop']['primaryDomain']['url'];
  publicStoreDomain: string;
}) {
  return (
    <nav className="footer-menu" role="navigation">
      {(menu || FALLBACK_FOOTER_MENU).items.map((item) => {
        if (!item.url) return null;
        // if the url is internal, we strip the domain
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        const isExternal = !url.startsWith('/');
        return isExternal ? (
          <a href={url} key={item.id} rel="noopener noreferrer" target="_blank">
            {item.title}
          </a>
        ) : (
          <NavLink
            end
            key={item.id}
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

const FALLBACK_FOOTER_MENU = {
  id: 'gid://shopify/Menu/199655620664',
  items: [
    {
      id: 'gid://shopify/MenuItem/461633060920',
      resourceId: 'gid://shopify/ShopPolicy/23358046264',
      tags: [],
      title: 'Privacy Policy',
      type: 'SHOP_POLICY',
      url: '/policies/privacy-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633093688',
      resourceId: 'gid://shopify/ShopPolicy/23358013496',
      tags: [],
      title: 'Refund Policy',
      type: 'SHOP_POLICY',
      url: '/policies/refund-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633126456',
      resourceId: 'gid://shopify/ShopPolicy/23358111800',
      tags: [],
      title: 'Shipping Policy',
      type: 'SHOP_POLICY',
      url: '/policies/shipping-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633159224',
      resourceId: 'gid://shopify/ShopPolicy/23358079032',
      tags: [],
      title: 'Terms of Service',
      type: 'SHOP_POLICY',
      url: '/policies/terms-of-service',
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
    color: isPending ? '#D4C4B0' : undefined,
  };
}
