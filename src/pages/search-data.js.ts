import { searchIndex, suggestions, DISCLAIMER } from '../utils/searchData';

export const GET = () =>
  new Response(
    `window.__CIE_SEARCH_INDEX__=${JSON.stringify(searchIndex)};window.__CIE_SUGGESTIONS__=${JSON.stringify(suggestions)};window.__CIE_DISCLAIMER__=${JSON.stringify(DISCLAIMER)};`,
    { headers: { 'Content-Type': 'application/javascript' } }
  );
