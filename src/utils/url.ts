// Prefixes any internal path with the Astro base URL (e.g. /cie-instruments-website)
// so all links work correctly on GitHub Pages sub-path deployments.
// Adds trailing slash to page paths (no extension, no query string fragment)
// so GitHub Pages always serves the correct index.html.
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export const u = (path: string): string => {
  const full = `${base}${path}`;
  // Split off any query string before checking for extension
  const [pathname, ...rest] = full.split('?');
  const query = rest.length ? '?' + rest.join('?') : '';
  // Add trailing slash only to page paths (no file extension, not already ending in /)
  const hasExtension = /\.[a-zA-Z0-9]+$/.test(pathname);
  const normalised = (!hasExtension && !pathname.endsWith('/'))
    ? pathname + '/'
    : pathname;
  return normalised + query;
};

// PDF datasheets/catalogues live in a separate repo (github.com/hithim1411-ux/
// cie-downloads), served via GitHub Pages, not in this repo's public/ dir.
// Reason: they were bloating every Vercel deployment's build output (~63MB of
// binaries duplicated per-deploy) enough to hit the Hobby plan's 10GB total
// Deployment Storage cap. Takes the same "/downloads/..." path callers already
// pass to u() - only the host changes.
const DOWNLOADS_HOST = 'https://hithim1411-ux.github.io/cie-downloads';

export const downloadUrl = (path: string): string =>
  `${DOWNLOADS_HOST}${path.replace(/^\/downloads/, '')}`;
