import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  searchCourses,
  type Course,
} from "../../services/course/course.service";
import { getAllTags } from "../../services/tag/tag.service";
import type {
  ExploreDuration,
  ExploreSort,
  ExploreTab,
} from "../../constants/explore.constants";

const VALID_TABS: ExploreTab[] = [
  "all",
  "courses",
  "paths",
  "recommended",
  "saved",
];
const VALID_DURATIONS: ExploreDuration[] = [
  "all",
  "under-1h",
  "1-3h",
  "over-3h",
];
const VALID_SORTS: ExploreSort[] = [
  "newest",
  "popular",
  "title",
  "shortest",
  "longest",
];
const SEARCH_DEBOUNCE_MS = 300;

function readEnumParam<T extends string>(
  params: URLSearchParams,
  key: string,
  values: T[],
  fallback: T,
): T {
  const value = params.get(key) as T | null;
  return value && values.includes(value) ? value : fallback;
}

function getDurationParams(duration: ExploreDuration) {
  if (duration === "under-1h") return { maxDuration: 59 };
  if (duration === "1-3h") return { minDuration: 60, maxDuration: 180 };
  if (duration === "over-3h") return { minDuration: 181 };
  return {};
}

function getSortParams(sort: ExploreSort) {
  if (sort === "popular")
    return { sortBy: "enrollmentCount", sortOrder: "DESC" as const };
  if (sort === "title") return { sortBy: "title", sortOrder: "ASC" as const };
  if (sort === "shortest")
    return { sortBy: "duration", sortOrder: "ASC" as const };
  if (sort === "longest")
    return { sortBy: "duration", sortOrder: "DESC" as const };
  return { sortBy: "createdAt", sortOrder: "DESC" as const };
}

export function useExploreCourseSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState<ExploreTab>(() =>
    readEnumParam(searchParams, "tab", VALID_TABS, "all"),
  );
  const [searchTerm, setSearchTerm] = useState(
    () => searchParams.get("q") || "",
  );
  const [selectedLanguage, setSelectedLanguage] = useState(
    () => searchParams.get("language") || "all",
  );
  const [selectedDuration, setSelectedDuration] = useState<ExploreDuration>(
    () => readEnumParam(searchParams, "duration", VALID_DURATIONS, "all"),
  );
  const [selectedTag, setSelectedTag] = useState<string | null>(() =>
    searchParams.get("tag"),
  );
  const [selectedSort, setSelectedSort] = useState<ExploreSort>(() =>
    readEnumParam(searchParams, "sort", VALID_SORTS, "newest"),
  );
  const [courses, setCourses] = useState<Course[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  useEffect(() => {
    const nextParams = new URLSearchParams();
    if (searchTerm.trim()) nextParams.set("q", searchTerm.trim());
    if (selectedLanguage !== "all")
      nextParams.set("language", selectedLanguage);
    if (selectedDuration !== "all")
      nextParams.set("duration", selectedDuration);
    if (selectedTag) nextParams.set("tag", selectedTag);
    if (selectedSort !== "newest") nextParams.set("sort", selectedSort);
    if (tab !== "all") nextParams.set("tab", tab);
    setSearchParams(nextParams, { replace: true });
  }, [
    searchTerm,
    selectedLanguage,
    selectedDuration,
    selectedTag,
    selectedSort,
    tab,
    setSearchParams,
  ]);

  useEffect(() => {
    let isActive = true;
    getAllTags().then((tags) => {
      if (isActive)
        setAllTags(
          tags.map((tag) => tag.name).sort((a, b) => a.localeCompare(b)),
        );
    });
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsLoadingCourses(true);
      try {
        const response = await searchCourses(
          {
            status: "approved",
            search: searchTerm.trim() || undefined,
            language: selectedLanguage === "all" ? undefined : selectedLanguage,
            tag: selectedTag || undefined,
            ...getDurationParams(selectedDuration),
            ...getSortParams(selectedSort),
          },
          controller.signal,
        );
        setCourses(response.data?.items || []);
      } catch (error: unknown) {
        const requestError = error as { code?: string; name?: string };
        if (
          requestError.code !== "ERR_CANCELED" &&
          requestError.name !== "CanceledError"
        ) {
          setCourses([]);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoadingCourses(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [
    searchTerm,
    selectedLanguage,
    selectedDuration,
    selectedTag,
    selectedSort,
  ]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedLanguage("all");
    setSelectedDuration("all");
    setSelectedTag(null);
    setSelectedSort("newest");
  };

  return {
    tab,
    setTab,
    searchTerm,
    setSearchTerm,
    selectedLanguage,
    setSelectedLanguage,
    selectedDuration,
    setSelectedDuration,
    selectedTag,
    setSelectedTag,
    selectedSort,
    setSelectedSort,
    courses,
    allTags,
    isLoadingCourses,
    clearFilters,
  };
}
