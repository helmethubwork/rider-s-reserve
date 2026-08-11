import type { NavigateFunction } from "react-router-dom";

/**
 * Safely navigate back.
 *
 * `navigate(-1)` replays browser history, which often sends the user somewhere
 * unexpected (e.g. back into a checkout they just left, or to an external
 * referrer). We only use it when the previous entry belongs to this site AND
 * the user actually navigated within the app; otherwise we go to a sensible
 * parent page.
 */
export const goBack = (navigate: NavigateFunction, fallback = "/") => {
  const cameFromThisSite =
    document.referrer && document.referrer.startsWith(window.location.origin);

  // history.length > 2 means there's a real in-app history stack to pop.
  if (cameFromThisSite && window.history.length > 2) {
    navigate(-1);
  } else {
    navigate(fallback);
  }
};

/**
 * Hierarchical back — always goes to a known parent page rather than replaying
 * history. Use this on pages where "up" is unambiguous (cart, checkout, etc.).
 */
export const goUp = (navigate: NavigateFunction, parent: string) => {
  navigate(parent);
};
