"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { resourceKey, SERIES_RESOURCES, WEEK_RESOURCES } from "@/lib/resources";
import { getSeries, saveResource, useResources, useSeries } from "@/lib/storage";
import type { ResourceType, Series } from "@/lib/types";

type Job = { status: "running" | "error"; text: string };

const SERIES_TAB = "series";

export default function SeriesResourcesPage() {
  const { id } = useParams<{ id: string }>();
  const series = useSeries(id);
  const saved = useResources(id);
  const [tab, setTab] = useState<string>(SERIES_TAB);
  const [jobs, setJobs] = useState<Record<string, Job>>({});
  const [viewing, setViewing] = useState<string | null>(null);

  const generate = useCallback(
    async (resource: ResourceType, weekId: string | null) => {
      const current = getSeries(id);
      if (!current) return;
      const key = resourceKey(resource.id, weekId);
      setJobs((j) => ({ ...j, [key]: { status: "running", text: "" } }));
      setViewing(key);

      let text = "";
      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ series: current, resourceTypeId: resource.id, weekId }),
        });
        if (!res.ok || !res.body) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? `Request failed (${res.status})`);
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          text += decoder.decode(value, { stream: true });
          setJobs((j) => ({ ...j, [key]: { status: "running", text } }));
        }
        const errorAt = text.indexOf("[ERROR] ");
        if (errorAt !== -1) throw new Error(text.slice(errorAt + 8).trim());

        saveResource(id, {
          key,
          resourceTypeId: resource.id,
          weekId,
          content: text.trim(),
          generatedAt: new Date().toISOString(),
        });
        setJobs(({ [key]: _done, ...rest }) => {
          void _done;
          return rest;
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Generation failed";
        setJobs((j) => ({ ...j, [key]: { status: "error", text: message } }));
      }
    },
    [id],
  );

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

  const week = tab === SERIES_TAB ? null : series.weeks.find((w) => w.id === tab) ?? null;
  const resources = week ? WEEK_RESOURCES : SERIES_RESOURCES;
  const weekId = week?.id ?? null;

  const generateAllMissing = async () => {
    for (const r of resources) {
      const key = resourceKey(r.id, weekId);
      if (!saved[key] && jobs[key]?.status !== "running") await generate(r, weekId);
    }
  };

  const totalPossible = SERIES_RESOURCES.length + WEEK_RESOURCES.length * series.weeks.length;
  const totalDone = Object.keys(saved).length;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/dashboard" className="text-sm text-stone-500 hover:text-ink">
            ← My series
          </Link>
          <h1 className="mt-1 font-serif text-3xl font-semibold">{series.name}</h1>
          {series.subtitle && <p className="text-stone-600">{series.subtitle}</p>}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-stone-500">
            {totalDone} of {totalPossible} resources drafted
          </span>
          <Link href={`/series/${series.id}/edit`} className="btn-secondary">
            Edit series
          </Link>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-1">
          <TabButton active={tab === SERIES_TAB} onClick={() => setTab(SERIES_TAB)}>
            <span className="font-medium">Whole series</span>
            <span className="block text-xs text-stone-500">Promo, reading plan, leader primer</span>
          </TabButton>
          <p className="label px-3 pt-4">Weeks</p>
          {series.weeks.map((w) => {
            const done = WEEK_RESOURCES.filter((r) => saved[resourceKey(r.id, w.id)]).length;
            return (
              <TabButton key={w.id} active={tab === w.id} onClick={() => setTab(w.id)}>
                <span className="flex items-center justify-between text-xs text-clay">
                  <span className="font-semibold uppercase tracking-wide">Week {w.number}</span>
                  <span className="text-stone-400">
                    {done}/{WEEK_RESOURCES.length}
                  </span>
                </span>
                <span className="block truncate text-sm font-medium">{w.title || "Untitled sermon"}</span>
              </TabButton>
            );
          })}
        </aside>

        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-2xl font-semibold">
                {week ? `Week ${week.number}: ${week.title || "Untitled"}` : "Series-wide resources"}
              </h2>
              {week && (
                <p className="text-sm text-stone-500">
                  {[week.keyText, week.date, week.preacher].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
            <button className="btn-primary" onClick={generateAllMissing}>
              Generate all missing
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {resources.map((r) => {
              const key = resourceKey(r.id, weekId);
              const job = jobs[key];
              const doc = saved[key];
              return (
                <div key={key} className="card flex flex-col p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold">{r.name}</h3>
                    <StatusPill job={job} hasDoc={!!doc} />
                  </div>
                  <p className="mt-1 text-xs font-medium text-olive">{r.audience}</p>
                  <p className="mt-2 flex-1 text-sm text-stone-600">{r.description}</p>
                  {job?.status === "error" && <p className="mt-2 text-xs text-red-700">{job.text}</p>}
                  <div className="mt-4 flex gap-2">
                    {(doc || job?.status === "running") && (
                      <button className="btn-secondary px-3 py-1.5" onClick={() => setViewing(key)}>
                        View
                      </button>
                    )}
                    <button
                      className={`${doc ? "btn-ghost" : "btn-primary"} px-3 py-1.5`}
                      disabled={job?.status === "running"}
                      onClick={() => generate(r, weekId)}
                    >
                      {job?.status === "running" ? "Writing…" : doc ? "Regenerate" : "Generate"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {viewing && (
        <Viewer
          series={series}
          viewKey={viewing}
          content={jobs[viewing]?.status === "running" ? jobs[viewing].text : saved[viewing]?.content ?? ""}
          running={jobs[viewing]?.status === "running"}
          onClose={() => setViewing(null)}
        />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`block w-full rounded-lg px-3 py-2 text-left transition ${
        active ? "bg-white shadow-sm ring-1 ring-stone-200" : "hover:bg-stone-100"
      }`}
    >
      {children}
    </button>
  );
}

function StatusPill({ job, hasDoc }: { job?: Job; hasDoc: boolean }) {
  if (job?.status === "running")
    return <span className="shrink-0 animate-pulse rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">Writing</span>;
  if (job?.status === "error")
    return <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-800">Error</span>;
  if (hasDoc)
    return <span className="shrink-0 rounded-full bg-olive/15 px-2 py-0.5 text-xs text-olive">Ready</span>;
  return null;
}

function Viewer({
  series,
  viewKey,
  content,
  running,
  onClose,
}: {
  series: Series;
  viewKey: string;
  content: string;
  running: boolean;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [resourceId, weekId] = viewKey.split(":");
  const resource = [...WEEK_RESOURCES, ...SERIES_RESOURCES].find((r) => r.id === resourceId);
  const week = series.weeks.find((w) => w.id === weekId);
  const title = `${resource?.name ?? "Resource"}${week ? ` — Week ${week.number}` : ""}`;

  const copy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const download = () => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${series.name} - ${title}.md`.replace(/[\\/:*?"<>|]/g, "");
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-3xl flex-col bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-stone-200 px-6 py-4">
          <div className="min-w-0">
            <h2 className="truncate font-serif text-xl font-semibold">{title}</h2>
            {running && <p className="text-xs text-amber-700">Writing…</p>}
          </div>
          <div className="flex shrink-0 gap-2">
            <button className="btn-secondary px-3 py-1.5" onClick={copy} disabled={!content || running}>
              {copied ? "Copied" : "Copy"}
            </button>
            <button className="btn-secondary px-3 py-1.5" onClick={download} disabled={!content || running}>
              Download
            </button>
            <button className="btn-ghost px-3 py-1.5" onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {content ? (
            <article className="prose prose-stone max-w-none prose-headings:font-serif">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </article>
          ) : (
            <p className="text-stone-500">{running ? "Starting…" : "Nothing here yet."}</p>
          )}
        </div>
      </div>
    </div>
  );
}
