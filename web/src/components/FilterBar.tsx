"use client";

interface FilterConfig {
  key: string;
  label: string;
  options: string[];
}

interface FilterBarProps {
  filters: FilterConfig[];
  activeFilters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
}

export default function FilterBar({
  filters,
  activeFilters,
  onFilterChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {filters.map(({ key, label, options }) => (
        <div key={key} className="flex items-center gap-2">
          <label htmlFor={`filter-${key}`} className="text-sm text-muted">
            {label}
          </label>
          <select
            id={`filter-${key}`}
            value={activeFilters[key] || ""}
            onChange={(e) => onFilterChange(key, e.target.value)}
            className="rounded-md border border-border bg-surface px-2 py-1 text-sm text-foreground focus:border-accent focus:outline-none"
          >
            <option value="">All</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
