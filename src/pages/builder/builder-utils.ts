import { SelectedAdditionalFilter } from "./builder-types";

export const isUniqueFilter = (
  value: SelectedAdditionalFilter,
  index: number,
  self: SelectedAdditionalFilter[]
) => self.findIndex((t) => t.id === value.id) === index;

export const isRangeFilter = (
  d: SelectedAdditionalFilter | { id: number; value: unknown }
): d is { id: number; to: number; value: { min: number; max: number } } => {
  return (
    "value" in d &&
    d.value != null &&
    typeof d.value === "object" &&
    "min" in (d.value as { min: number; max: number }) &&
    "max" in (d.value as { min: number; max: number })
  );
};

export const isStringFilter = (
  d: SelectedAdditionalFilter | { id: number; value: unknown }
): d is { id: number; to: number; value: string | string[] } => {
  return (
    "value" in d && (Array.isArray(d.value) || typeof d.value === "string")
  );
};

export const fixSingleArray = ({
  id,
  value,
}: {
  id: number;
  to: number;
  value: string | string[];
}): {
  id: number;
  value: string[];
} => {
  if (Array.isArray(value)) {
    return { id, value };
  }
  return { id, value: [value] };
};
