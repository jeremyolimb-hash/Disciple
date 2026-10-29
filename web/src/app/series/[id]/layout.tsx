import { Suspense } from "react";

/** Series pages read their id on the client, so let the route params stream in. */
export default function SeriesLayout({ children }: LayoutProps<"/series/[id]">) {
  return <Suspense fallback={null}>{children}</Suspense>;
}
