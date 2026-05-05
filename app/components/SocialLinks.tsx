const SOCIAL_LINKS = [
  {
    name: 'Instagram',
    handle: '@aromaz_cosmetics',
    href: 'https://www.instagram.com/aromaz_cosmetics?igsh=MXM4eHRsdnNvMmh3aw%3D%3D&utm_source=qr',
    icon: 'instagram',
  },
  {
    name: 'Facebook',
    handle: 'Aromaz',
    href: 'https://www.facebook.com/share/1LBKM9GxBK/?mibextid=wwXIfr',
    icon: 'facebook',
  },
  {
    name: 'TikTok',
    handle: '@aromaz873',
    href: 'https://www.tiktok.com/@aromaz873?_r=1&_t=ZS-966ADPwiDd2',
    icon: 'tiktok',
  },
] as const;

type SocialLinksProps = {
  compact?: boolean;
};

export function SocialLinks({compact = false}: SocialLinksProps) {
  return (
    <div className={compact ? 'social-links social-links--compact' : 'social-links'}>
      {SOCIAL_LINKS.map((link) => (
        <a
          aria-label={`${link.name} ${link.handle}`}
          href={link.href}
          key={link.name}
          rel="noopener noreferrer"
          target="_blank"
        >
          <SocialIcon icon={link.icon} />
          <span>
            <strong>{link.name}</strong>
            {!compact && <small>{link.handle}</small>}
          </span>
        </a>
      ))}
    </div>
  );
}

function SocialIcon({icon}: {icon: (typeof SOCIAL_LINKS)[number]['icon']}) {
  if (icon === 'facebook') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M14.2 8.1h2.4V4.3c-.4-.1-1.9-.2-3.5-.2-3.5 0-5.8 2.1-5.8 6v3.4H3.5v4.2h3.8V24h4.6v-6.3h3.6l.7-4.2h-4.3v-3c0-1.2.4-2.4 2.3-2.4Z" />
      </svg>
    );
  }

  if (icon === 'tiktok') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M16.2 3.2c.5 2.4 1.9 3.8 4.2 4v4.1a7.7 7.7 0 0 1-4-1.2v6.2c0 4.2-2.8 6.9-6.8 6.9a6.4 6.4 0 0 1-6.5-6.4c0-4.2 3.4-7.1 7.8-6.4v4.2c-1.9-.6-3.6.5-3.6 2.3a2.3 2.3 0 0 0 2.4 2.3c1.5 0 2.5-.9 2.5-2.9V3.2h4Z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M7.2 2h9.6A5.2 5.2 0 0 1 22 7.2v9.6a5.2 5.2 0 0 1-5.2 5.2H7.2A5.2 5.2 0 0 1 2 16.8V7.2A5.2 5.2 0 0 1 7.2 2Zm0 2A3.2 3.2 0 0 0 4 7.2v9.6A3.2 3.2 0 0 0 7.2 20h9.6a3.2 3.2 0 0 0 3.2-3.2V7.2A3.2 3.2 0 0 0 16.8 4H7.2Zm4.8 3.6a4.4 4.4 0 1 1 0 8.8 4.4 4.4 0 0 1 0-8.8Zm0 2a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8Zm5-2.4a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Z" />
    </svg>
  );
}
