import type { Dispatch, SetStateAction } from "react";
import {
  DURATION_OPTIONS,
  EXPLORE_TABS,
  LANGUAGE_OPTIONS,
  SORT_OPTIONS,
  type ExploreDuration,
  type ExploreSort,
  type ExploreTab,
} from "../../../constants/explore.constants";

interface ExploreFiltersProps {
  tab: ExploreTab;
  searchTerm: string;
  selectedLanguage: string;
  selectedDuration: ExploreDuration;
  selectedTag: string | null;
  selectedSort: ExploreSort;
  allTags: string[];
  onTabChange: Dispatch<SetStateAction<ExploreTab>>;
  onLanguageChange: Dispatch<SetStateAction<string>>;
  onDurationChange: Dispatch<SetStateAction<ExploreDuration>>;
  onTagChange: Dispatch<SetStateAction<string | null>>;
  onSortChange: Dispatch<SetStateAction<ExploreSort>>;
  onClear: () => void;
}

const controlClassName =
  "h-10 rounded-lg border border-[#D1D5DB] bg-white px-3 text-sm text-[#374151] focus:border-[#E11D48] focus:outline-none focus:ring-2 focus:ring-[#E11D48]/15";
const chipClassName =
  "rounded-full bg-[#F1F5F9] px-3 py-1 text-xs text-[#475569]";

function FilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value as T)}
      className={controlClassName}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function ExploreFilters({
  tab,
  searchTerm,
  selectedLanguage,
  selectedDuration,
  selectedTag,
  selectedSort,
  allTags,
  onTabChange,
  onLanguageChange,
  onDurationChange,
  onTagChange,
  onSortChange,
  onClear,
}: ExploreFiltersProps) {
  const hasActiveFilters = Boolean(
    searchTerm ||
    selectedLanguage !== "all" ||
    selectedDuration !== "all" ||
    selectedTag ||
    selectedSort !== "newest",
  );

  return (
    <div className="mb-6 space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-1 self-start rounded-lg border border-[#E5E7EB] bg-white p-1">
          {EXPLORE_TABS.map((item) => (
            <button
              key={item.value}
              onClick={() => onTabChange(item.value)}
              className={`rounded-md px-3.5 py-1.5 text-sm transition-colors ${tab === item.value ? "bg-[#111827] text-white" : "text-[#6B7280] hover:text-[#111827]"}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab !== "paths" && (
          <div className="flex flex-wrap items-center gap-2">
            <FilterSelect
              label="Language"
              value={selectedLanguage}
              options={LANGUAGE_OPTIONS}
              onChange={onLanguageChange}
            />
            <FilterSelect
              label="Duration"
              value={selectedDuration}
              options={DURATION_OPTIONS}
              onChange={onDurationChange}
            />
            <FilterSelect
              label="Tag"
              value={selectedTag || ""}
              options={[
                { value: "", label: "All tags" },
                ...allTags.map((tag) => ({ value: tag, label: tag })),
              ]}
              onChange={(value) => onTagChange(value || null)}
            />
            <FilterSelect
              label="Sort courses"
              value={selectedSort}
              options={SORT_OPTIONS}
              onChange={onSortChange}
            />
          </div>
        )}
      </div>

      {tab !== "paths" && hasActiveFilters && (
        <div
          className="flex flex-wrap items-center gap-2"
          aria-label="Active filters"
        >
          {searchTerm && (
            <span className={chipClassName}>Search: {searchTerm}</span>
          )}
          {selectedLanguage !== "all" && (
            <span className={chipClassName}>{selectedLanguage}</span>
          )}
          {selectedDuration !== "all" && (
            <span className={chipClassName}>{selectedDuration}</span>
          )}
          {selectedTag && <span className={chipClassName}>#{selectedTag}</span>}
          {selectedSort !== "newest" && (
            <span className={chipClassName}>Sort: {selectedSort}</span>
          )}
          <button
            onClick={onClear}
            className="text-xs font-semibold text-[#BE123C] hover:underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
