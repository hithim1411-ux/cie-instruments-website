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
