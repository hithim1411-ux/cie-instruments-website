// Prefixes any internal path with the Astro base URL (e.g. /cie-instruments-website)
// so all links work correctly on GitHub Pages sub-path deployments.
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
export const u = (path: string): string => `${base}${path}`;
