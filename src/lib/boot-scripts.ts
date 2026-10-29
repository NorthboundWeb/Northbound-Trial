/**
 * Tiny scripts that must run before first paint, inlined by the root layout.
 *
 * They live here, not in the client components, because a string exported
 * from a 'use client' file reaches the server as a client reference, not as
 * the string, and the inline script would be broken.
 */
export const INTRO_KEY = 'nb-intro-seen'
export const THEME_KEY = 'nb-theme'

/**
 * Skip the intro if it already played this session. Every visit opens in dark;
 * a switch to light lasts for this tab's session only. The old saved choice in
 * localStorage is cleared so it can no longer force light.
 */
export const bootScript =
  `try{if(sessionStorage.getItem('${INTRO_KEY}'))document.documentElement.dataset.nbIntro='seen'}catch(e){}` +
  `try{localStorage.removeItem('${THEME_KEY}')}catch(e){}` +
  `try{document.documentElement.dataset.theme=sessionStorage.getItem('${THEME_KEY}')==='light'?'light':'dark'}catch(e){document.documentElement.dataset.theme='dark'}`
