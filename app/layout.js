import './globals.css';
import { PROFILE } from '../lib/content';
import Boot from './Boot';
import Cursor from './Cursor';
import { SITE, canon, ogImages } from '../lib/site';
const IMG = ogImages();
export const metadata = {
  ...(SITE ? { metadataBase: new URL(SITE + '/') } : {}), alternates: canon('/'),
  title: `${PROFILE.name} | ${PROFILE.role}`, description: PROFILE.bio, authors: [{ name: PROFILE.name }],
  keywords: ['Next.js', 'React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Full Stack Developer', PROFILE.name],
  openGraph: { title: `${PROFILE.name} | ${PROFILE.role}`, description: PROFILE.bio, type: 'website', images: IMG }, twitter: { card: IMG ? 'summary_large_image' : 'summary', title: PROFILE.name, description: PROFILE.bio, images: IMG && [IMG[0].url] },
};
const ld = { '@context': 'https://schema.org', '@type': 'Person', name: PROFILE.name, jobTitle: PROFILE.role, ...(PROFILE.email ? { email: 'mailto:' + PROFILE.email } : {}), sameAs: [PROFILE.github, PROFILE.linkedin].filter(Boolean) };
export default function Root({ children }) {
  return (<html lang="en" data-theme="dark"><head>
    <link rel="manifest" href={(process.env.NEXT_PUBLIC_BASE_PATH || '') + '/manifest.webmanifest'} /><meta name="theme-color" content="#4f46e5" />
    {process.env.NEXT_PUBLIC_SITE_URL && <link rel="alternate" type="application/rss+xml" title="Blog feed" href={(process.env.NEXT_PUBLIC_BASE_PATH || '') + '/feed.xml'} />}
    {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && <script defer data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN} src="https://plausible.io/js/script.js" />}
    <link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Instrument+Serif&family=Hind+Siliguri:wght@400;500;600&display=swap" />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} /></head>
    <body><Boot /><Cursor /><a className="skip" href="#main">Skip to content</a><div className="glow" /><div id="bar" />{children}</body></html>);
}
