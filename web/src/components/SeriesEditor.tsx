"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { blankWeek, newId, saveSeries } from "@/lib/storage";
import type { Series, Week } from "@/lib/types";

type ImportedWeek = Omit<Week, "id" | "notes">;
type ImportedSeries = Pick<Series, "name" | "subtitle" | "churchName"> & { weeks: ImportedWeek[] };

const WEEK_FIELDS: { key: keyof Week; label: string; multiline?: boolean; placeholder?: string }[] = [
  { key: "title", label: "Sermon title", placeholder: "Does God Give Up on Me?" },
  { key: "keyText", label: "Key text", placeholder: "Hosea 11:1–11" },
  { key: "book", label: "Book", placeholder: "Hosea" },
  { key: "date", label: "Date", placeholder: "September 20, 2026" },
  { key: "preacher", label: "Preacher" },
  { key: "thesis", label: "Core thesis", multiline: true, placeholder: "The one big idea of the sermon" },
  { key: "whyThisText", label: "Why this text", multiline: true },
  { key: "application", label: "Everyday application", multiline: true },
  {
    key: "notes",
    label: "Sermon notes, outline, or manuscript (optional)",
    multiline: true,
    placeholder: "Paste your outline or manuscript for richer, more specific resources.",
  },
];

export function SeriesEditor({ initial }: { initial: Series }) {
  const router = useRouter();
  const [series, setSeries] = useState<Series>(initial);
  const [openWeek, setOpenWeek] = useState<string | null>(initial.weeks[0]?.id ?? null);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const update = (patch: Partial<Series>) => setSeries((s) => ({ ...s, ...patch }));

  const updateWeek = (id: string, patch: Partial<Week>) =>
    setSeries((s) => ({ ...s, weeks: s.weeks.map((w) => (w.id === id ? { ...w, ...patch } : w)) }));

  const renumber = (weeks: Week[]) => weeks.map((w, i) => ({ ...w, number: i + 1 }));

  const addWeek = () => {
    const week = blankWeek(series.weeks.length + 1);
    setSeries((s) => ({ ...s, weeks: [...s.weeks, week] }));
    setOpenWeek(week.id);
  };

  const removeWeek = (id: string) =>
    setSeries((s) => ({ ...s, weeks: renumber(s.weeks.filter((w) => w.id !== id)) }));

  const moveWeek = (index: number, delta: number) =>
    setSeries((s) => {
      const weeks = [...s.weeks];
      const target = index + delta;
      if (target < 0 || target >= weeks.length) return s;
      [weeks[index], weeks[target]] = [weeks[target], weeks[index]];
      return { ...s, weeks: renumber(weeks) };
    });

  const runImport = async () => {
    setImporting(true);
    setImportError(null);
    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: importText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import failed");
      const imported = data as ImportedSeries;
      const weeks = renumber(imported.weeks.map((w) => ({ ...blankWeek(0), ...w, id: newId() })));
      setSeries((s) => ({
        ...s,
        name: imported.name || s.name,
        subtitle: imported.subtitle || s.subtitle,
        churchName: imported.churchName || s.churchName,
        weeks: weeks.length ? weeks : s.weeks,
      }));
      setOpenWeek(weeks[0]?.id ?? null);
      setShowImport(false);
      setImportText("");
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const save = () => {
    saveSeries(series);
    router.push(`/series/${series.id}`);
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold">
            {initial.name ? "Edit series" : "New sermon series"}
          </h1>
          <p className="mt-1 text-stone-600">Tell us about the series. The more detail, the better the resources.</p>
        </div>
        <button className="btn-secondary" onClick={() => setShowImport((v) => !v)}>
          {showImport ? "Close import" : "Import from planning doc"}
        </button>
      </div>

      {showImport && (
        <div className="card mb-8 p-6">
          <h2 className="font-semibold">Paste your series planning document</h2>
          <p className="mt-1 text-sm text-stone-600">
            Paste your schedule and week-by-week notes. We&apos;ll fill in the form below so you can review it.
          </p>
          <textarea
            className="input mt-4 h-56 font-mono text-xs"
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder={"WEEK 1 · Obadiah\nSuggested Key Text: Obadiah 1:1–15\n“Why Do I Enjoy Watching Other People Fail?”\nTHE CORE THESIS ..."}
          />
          {importError && <p className="mt-2 text-sm text-red-700">{importError}</p>}
          <div className="mt-4 flex justify-end">
            <button className="btn-primary" disabled={importing || !importText.trim()} onClick={runImport}>
              {importing ? "Reading document…" : "Import"}
            </button>
          </div>
        </div>
      )}

      <section className="card space-y-4 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Series name</label>
            <input
              className="input"
              value={series.name}
              onChange={(e) => update({ name: e.target.value })}
              placeholder="The Minor Prophets"
            />
          </div>
          <div>
            <label className="label">Subtitle</label>
            <input
              className="input"
              value={series.subtitle}
              onChange={(e) => update({ subtitle: e.target.value })}
              placeholder="An 11-week series"
            />
          </div>
        </div>
        <div>
          <label className="label">Church name</label>
          <input
            className="input"
            value={series.churchName}
            onChange={(e) => update({ churchName: e.target.value })}
            placeholder="Redemption Gilbert"
          />
        </div>
        <div>
          <label className="label">Church voice &amp; context</label>
          <textarea
            className="input h-24"
            value={series.voice}
            onChange={(e) => update({ voice: e.target.value })}
            placeholder="e.g. Reformed, missional church in suburban Phoenix. Warm, plain-spoken tone. Lots of young families. We use the ESV."
          />
        </div>
      </section>

      <div className="mt-10 mb-4 flex items-center justify-between">
        <h2 className="font-serif text-2xl font-semibold">Weeks</h2>
        <span className="text-sm text-stone-500">{series.weeks.length} total</span>
      </div>

      <div className="space-y-3">
        {series.weeks.map((week, index) => {
          const open = openWeek === week.id;
          return (
            <div key={week.id} className="card overflow-hidden">
              <button
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-stone-50"
                onClick={() => setOpenWeek(open ? null : week.id)}
              >
                <div className="min-w-0">
                  <span className="text-xs font-semibold uppercase tracking-wide text-clay">Week {week.number}</span>
                  <p className="truncate font-medium">
                    {week.title || <span className="text-stone-400">Untitled sermon</span>}
                    {week.keyText && <span className="ml-2 text-sm font-normal text-stone-500">{week.keyText}</span>}
                  </p>
                </div>
                <span className="text-stone-400">{open ? "−" : "+"}</span>
              </button>
              {open && (
                <div className="space-y-4 border-t border-stone-100 px-5 py-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {WEEK_FIELDS.filter((f) => !f.multiline).map((f) => (
                      <div key={f.key}>
                        <label className="label">{f.label}</label>
                        <input
                          className="input"
                          value={week[f.key] as string}
                          placeholder={f.placeholder}
                          onChange={(e) => updateWeek(week.id, { [f.key]: e.target.value })}
                        />
                      </div>
                    ))}
                  </div>
                  {WEEK_FIELDS.filter((f) => f.multiline).map((f) => (
                    <div key={f.key}>
                      <label className="label">{f.label}</label>
                      <textarea
                        className={`input ${f.key === "notes" ? "h-40" : "h-20"}`}
                        value={week[f.key] as string}
                        placeholder={f.placeholder}
                        onChange={(e) => updateWeek(week.id, { [f.key]: e.target.value })}
                      />
                    </div>
                  ))}
                  <div className="flex justify-between">
                    <div className="flex gap-1">
                      <button className="btn-ghost" onClick={() => moveWeek(index, -1)} disabled={index === 0}>
                        ↑ Move up
                      </button>
                      <button
                        className="btn-ghost"
                        onClick={() => moveWeek(index, 1)}
                        disabled={index === series.weeks.length - 1}
                      >
                        ↓ Move down
                      </button>
                    </div>
                    <button
                      className="btn-ghost text-red-700 hover:bg-red-50 hover:text-red-800"
                      onClick={() => removeWeek(week.id)}
                      disabled={series.weeks.length === 1}
                    >
                      Remove week
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button className="btn-secondary mt-4 w-full border-dashed" onClick={addWeek}>
        + Add week
      </button>

      <div className="sticky bottom-0 mt-10 flex justify-end gap-3 border-t border-stone-200 bg-parchment/95 py-4 backdrop-blur">
        <button className="btn-ghost" onClick={() => router.back()}>
          Cancel
        </button>
        <button className="btn-primary" onClick={save} disabled={!series.name.trim()}>
          Save &amp; build resources
        </button>
      </div>
    </div>
  );
}
