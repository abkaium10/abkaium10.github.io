import fs from 'fs';
import path from 'path';
// Server-only helpers. Canonical and social-image URLs must be ABSOLUTE and include the repository path.
export const SITE = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
export const canon = (p) => (SITE ? { canonical: SITE + p } : {});
export const ogImages = () => (SITE && fs.existsSync(path.join(process.cwd(), 'public/og.png')) ? [{ url: SITE + '/og.png', width: 1200, height: 630 }] : undefined);
