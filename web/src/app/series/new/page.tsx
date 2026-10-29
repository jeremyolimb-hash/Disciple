"use client";

import dynamic from "next/dynamic";

// A new series gets fresh ids and timestamps, so build it in the browser only.
const NewSeries = dynamic(() => import("@/components/NewSeries"), { ssr: false });

export default function NewSeriesPage() {
  return <NewSeries />;
}
