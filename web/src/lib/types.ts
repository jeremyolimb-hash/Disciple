export type Week = {
  id: string;
  number: number;
  date: string;
  preacher: string;
  title: string;
  book: string;
  keyText: string;
  thesis: string;
  whyThisText: string;
  application: string;
  /** Optional manuscript, outline, or transcript the pastor pastes in. */
  notes: string;
};

export type Series = {
  id: string;
  name: string;
  subtitle: string;
  churchName: string;
  /** Voice, theological tradition, audience notes applied to every resource. */
  voice: string;
  weeks: Week[];
  createdAt: string;
  updatedAt: string;
};

export type ResourceScope = "week" | "series";

export type ResourceType = {
  id: string;
  name: string;
  audience: string;
  scope: ResourceScope;
  description: string;
  /** Instructions sent to Claude describing what to produce. */
  instructions: string;
};

export type GeneratedResource = {
  /** `${resourceTypeId}:${weekId | "series"}` */
  key: string;
  resourceTypeId: string;
  weekId: string | null;
  content: string;
  generatedAt: string;
};
