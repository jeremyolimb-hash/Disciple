"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { SeriesEditor } from "@/components/SeriesEditor";
import { useSeries } from "@/lib/storage";

export default function EditSeriesPage() {
  const { id } = useParams<{ id: string }>();
  const series = useSeries(id);

  if (series === undefined) return null;
  if (series === null) {
    return (
      <div className="mx-auto max-w-xl px-6 py-20 text-center">
        <p className="text-stone-600">That series couldn&apos;t be found.</p>
        <Link href="/dashboard" className="btn-secondary mt-4">
          Back to my series
        </Link>
      </div>
    );
  }
  return <SeriesEditor key={series.id} initial={series} />;
}
