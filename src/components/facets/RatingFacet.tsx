import { ChevronUp, Star } from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { NumberFacet } from "../../lib/types";
import { cm } from "../../utils";
import { useQueryRangeFacet } from "../../lib/hooks/useQueryRangeFacet";

export const StarRatingFacetSelector = ({
  id,
  name,
  result: { max },
  selected,
  disabled,
  defaultOpen,
}: NumberFacet & {
  disabled?: boolean;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const { updateValue, removeFilter } = useQueryRangeFacet(id);

  // Calculate the total number of stars to display (rounded to nearest integer)
  const maxStars = useMemo(() => Math.ceil(max / 10), [max]);

  // Calculate the selected rating
  const selectedRating = useMemo(
    () => (selected ? Math.ceil(selected.min / 10) : 0),
    [selected]
  );

  // Handle selection of rating
  const handleRatingChange = useCallback(
    (rating: number) => {
      // If clicked on current selection, clear selection
      if (rating === selectedRating) {
        removeFilter(id);
        return;
      }

      updateValue({
        min: rating * 10,
        max: max,
      });
    },
    [updateValue, selectedRating, max]
  );

  const invalid = useMemo(() => {
    if (selected == null) return false;

    if (selected.min > max) {
      return "Selected rating is invalid";
    }
    return false;
  }, [selected, max]);

  return (
    <div
      className={cm(
        "mb-4 border-b border-gray-200 pb-2",
        disabled && "opacity-50"
      )}
    >
      <button
        className="font-medium bold mb-2 flex items-center justify-between w-full text-left"
        onClick={() => setOpen((p) => !p)}
      >
        <span>{name}</span>
        <ChevronUp
          className={cm(
            "size-4 transition-transform",
            open ? "rotate-0" : "rotate-180"
          )}
        />
      </button>
      {invalid && (
        <span className="bg-amber-100 text-amber-800 rounded-md px-2.5 py-1 text-xs">
          {invalid}
        </span>
      )}
      {open && (
        <fieldset disabled={disabled}>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center">
              <div className="flex">
                {Array.from({ length: maxStars }, (_, i) => i + 1).map(
                  (rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => handleRatingChange(rating)}
                      className={cm(
                        "p-1 transition-colors",
                        rating <= selectedRating
                          ? "text-yellow-400"
                          : "text-gray-300 hover:text-yellow-200"
                      )}
                      title={`${rating} stars and above`}
                    >
                      <Star
                        className="size-6"
                        fill={
                          rating <= selectedRating ? "currentColor" : "none"
                        }
                      />
                    </button>
                  )
                )}
              </div>
              {/* {selectedRating > 0 && (
                <span className="ml-2 text-sm">{selectedRating}+ stars</span>
              )} */}
            </div>
          </div>
        </fieldset>
      )}
    </div>
  );
};
