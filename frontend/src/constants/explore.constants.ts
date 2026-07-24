export type ExploreTab = "all" | "courses" | "paths" | "recommended" | "saved";
export type ExploreDuration = "all" | "under-1h" | "1-3h" | "over-3h";
export type ExploreSort =
  "newest" | "popular" | "title" | "shortest" | "longest";

export const EXPLORE_TABS: ReadonlyArray<{ value: ExploreTab; label: string }> =
  [
    { value: "all", label: "All" },
    { value: "paths", label: "Learning Paths" },
    { value: "courses", label: "Courses" },
  ];

export const LANGUAGE_OPTIONS = [
  { value: "all", label: "All languages" },
  { value: "English", label: "English" },
  { value: "Vietnamese", label: "Vietnamese" },
] as const;

export const DURATION_OPTIONS: ReadonlyArray<{
  value: ExploreDuration;
  label: string;
}> = [
  { value: "all", label: "Any duration" },
  { value: "under-1h", label: "Under 1 hour" },
  { value: "1-3h", label: "1–3 hours" },
  { value: "over-3h", label: "Over 3 hours" },
];

export const SORT_OPTIONS: ReadonlyArray<{
  value: ExploreSort;
  label: string;
}> = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most Popular" },
  { value: "title", label: "Title A–Z" },
  { value: "shortest", label: "Shortest" },
  { value: "longest", label: "Longest" },
];

export const COURSE_GRADIENTS = [
  "from-[#3B82F6] to-[#1D4ED8]",
  "from-[#10B981] to-[#047857]",
  "from-[#EC4899] to-[#BE123C]",
  "from-[#8B5CF6] to-[#5B21B6]",
] as const;
