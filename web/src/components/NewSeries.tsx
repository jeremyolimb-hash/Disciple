"use client";

import { useState } from "react";
import { SeriesEditor } from "@/components/SeriesEditor";
import { blankSeries } from "@/lib/storage";

export default function NewSeries() {
  const [initial] = useState(blankSeries);
  return <SeriesEditor initial={initial} />;
}
