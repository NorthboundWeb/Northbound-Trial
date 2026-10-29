/**
 * Tiny scripts that must run before first paint, inlined by the root layout.
 *
 * They live here, not in the client components, because a string exported
 * from a 'use client' file reaches the server as a client reference, not as
 * the string, and the inline script would be broken.
 */
export const INTRO_KEY = 'nb-intro-seen'
export const THEME_KEY = 'nb-theme'

/** Skip the intro if it already played this session; apply a saved theme (dark unless they chose light). */
export const bootScript =
  `try{if(sessionStorage.getItem('${INTRO_KEY}'))document.documentElement.dataset.nbIntro='seen'}catch(e){}` +
  `try{var t=localStorage.getItem('${THEME_KEY}');document.documentElement.dataset.theme=t==='light'?'light':'dark'}catch(e){document.documentElement.dataset.theme='dark'}`
