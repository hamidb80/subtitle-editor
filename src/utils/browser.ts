export function getQueryParams() {
  return Object.fromEntries(
    new URLSearchParams(
      window.location.search).entries())
}
