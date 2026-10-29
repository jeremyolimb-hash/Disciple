"use client";

import Link from "next/link";
import { deleteSeries, useAllSeries } from "@/lib/storage";

export default function DashboardPage() {
  const series = useAllSeries();

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-serif text-3xl font-semibold">My series</h1>
        <Link href="/series/new" className="btn-primary">
          New series
        </Link>
      </div>

      {series.length === 0 ? (
        <div className="card p-12 text-center">
          <h2 className="font-serif text-xl font-semibold">No series yet</h2>
          <p className="mt-2 text-stone-600">
            Start by entering your sermon plan, or paste the planning doc you already have.
          </p>
          <Link href="/series/new" className="btn-primary mt-6">
            Create your first series
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {series.map((s) => (
            <div key={s.id} className="card flex flex-col p-5">
              <Link href={`/series/${s.id}`} className="flex-1">
                <h2 className="font-serif text-xl font-semibold hover:text-clay">{s.name || "Untitled series"}</h2>
                {s.subtitle && <p className="text-sm text-stone-600">{s.subtitle}</p>}
                <p className="mt-3 text-sm text-stone-500">
                  {s.weeks.length} week{s.weeks.length === 1 ? "" : "s"}
                  {s.churchName && ` · ${s.churchName}`}
                </p>
              </Link>
              <div className="mt-4 flex gap-2 border-t border-stone-100 pt-3">
                <Link href={`/series/${s.id}`} className="btn-ghost px-2 py-1">
                  Resources
                </Link>
                <Link href={`/series/${s.id}/edit`} className="btn-ghost px-2 py-1">
                  Edit
                </Link>
                <button
                  className="btn-ghost ml-auto px-2 py-1 text-red-700 hover:bg-red-50"
                  onClick={() => {
                    if (confirm(`Delete "${s.name}" and all its resources?`)) deleteSeries(s.id);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
