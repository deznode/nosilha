// design-sync shim for `next/link`.
//
// Next 16's Link reads the app-router context for prefetching and navigation;
// outside a Next runtime that context is absent. Preview cards only need the
// anchor's markup and styling, so this renders a plain <a> that accepts the
// same props.
//
// Wired via compilerOptions.paths in .design-sync/tsconfig.sync.json.

import React from "react";

type Url = string | { pathname?: string; query?: Record<string, unknown>; hash?: string };

export interface LinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: Url;
  as?: Url;
  replace?: boolean;
  scroll?: boolean;
  shallow?: boolean;
  passHref?: boolean;
  prefetch?: boolean | null;
  legacyBehavior?: boolean;
}

const toHref = (href: Url): string => {
  if (typeof href === "string") return href;
  if (!href) return "#";
  const query = href.query
    ? "?" +
      Object.entries(href.query)
        .filter(([, v]) => v != null)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join("&")
    : "";
  return `${href.pathname ?? ""}${query}${href.hash ?? ""}` || "#";
};

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  {
    href,
    as: _as,
    replace: _replace,
    scroll: _scroll,
    shallow: _shallow,
    passHref: _passHref,
    prefetch: _prefetch,
    legacyBehavior: _legacyBehavior,
    children,
    ...rest
  },
  ref,
) {
  return (
    <a ref={ref} href={toHref(href)} {...rest}>
      {children}
    </a>
  );
});

export default Link;
export { Link };
