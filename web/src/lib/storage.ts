"use client";

import { useSyncExternalStore } from "react";
import type { GeneratedResource, Series, Week } from "./types";

/**
 * Browser-local persistence. This is a stand-in until accounts and a database
 * are added; every read/write goes through this module so it can be swapped out.
 */
const SERIES_KEY = "disciple.series.v1";
const RESOURCES_KEY = "disciple.resources.v1";

type ResourceMap = Record<string, Record<string, GeneratedResource>>;

const listeners = new Set<() => void>();
const cache = new Map<string, { raw: string | null; value: unknown }>();

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value as T;
  let value: T = fallback;
  if (raw) {
    try {
      value = JSON.parse(raw) as T;
    } catch {
      value = fallback;
    }
  }
  cache.set(key, { raw, value });
  return value;
}

function write(key: string, value: unknown) {
  window.localStorage.setItem(key, JSON.stringify(value));
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = () => listener();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const EMPTY_SERIES: Series[] = [];
const EMPTY_RESOURCES: ResourceMap = {};

export function getAllSeries(): Series[] {
  return read(SERIES_KEY, EMPTY_SERIES);
}

export function getSeries(id: string): Series | undefined {
  return getAllSeries().find((s) => s.id === id);
}

export function saveSeries(series: Series) {
  const all = getAllSeries();
  const next = { ...series, updatedAt: new Date().toISOString() };
  const exists = all.some((s) => s.id === series.id);
  write(SERIES_KEY, exists ? all.map((s) => (s.id === series.id ? next : s)) : [next, ...all]);
}

export function deleteSeries(id: string) {
  write(SERIES_KEY, getAllSeries().filter((s) => s.id !== id));
  const { [id]: _removed, ...rest } = read(RESOURCES_KEY, EMPTY_RESOURCES);
  void _removed;
  write(RESOURCES_KEY, rest);
}

export function getResources(seriesId: string): Record<string, GeneratedResource> {
  return read(RESOURCES_KEY, EMPTY_RESOURCES)[seriesId] ?? EMPTY_RESOURCE_SET;
}

const EMPTY_RESOURCE_SET: Record<string, GeneratedResource> = {};

export function saveResource(seriesId: string, resource: GeneratedResource) {
  const all = read(RESOURCES_KEY, EMPTY_RESOURCES);
  write(RESOURCES_KEY, {
    ...all,
    [seriesId]: { ...(all[seriesId] ?? {}), [resource.key]: resource },
  });
}

export function useAllSeries(): Series[] {
  return useSyncExternalStore(subscribe, getAllSeries, () => EMPTY_SERIES);
}

/** Returns `undefined` while loading on the server, `null` when not found. */
export function useSeries(id: string): Series | null | undefined {
  const all = useSyncExternalStore(subscribe, getAllSeries, () => undefined);
  if (all === undefined) return undefined;
  return all.find((s) => s.id === id) ?? null;
}

export function useResources(seriesId: string): Record<string, GeneratedResource> {
  return useSyncExternalStore(
    subscribe,
    () => getResources(seriesId),
    () => EMPTY_RESOURCE_SET,
  );
}

export function newId(): string {
  return crypto.randomUUID();
}

export function blankWeek(number: number): Week {
  return {
    id: newId(),
    number,
    date: "",
    preacher: "",
    title: "",
    book: "",
    keyText: "",
    thesis: "",
    whyThisText: "",
    application: "",
    notes: "",
  };
}

export function blankSeries(): Series {
  const now = new Date().toISOString();
  return {
    id: newId(),
    name: "",
    subtitle: "",
    churchName: "",
    voice: "",
    weeks: [blankWeek(1)],
    createdAt: now,
    updatedAt: now,
  };
}
