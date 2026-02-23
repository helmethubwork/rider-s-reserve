import type { NavigateFunction } from "react-router-dom";

/**
 * Safely navigate back. If there's no browser history (e.g. direct link / new tab),
 * falls back to the provided fallback route (default: home page).
 */
export const goBack = (navigate: NavigateFunction, fallback = "/") => {
  if (window.history.length > 1) {
    navigate(-1);
  } else {
    navigate(fallback);
  }
};
