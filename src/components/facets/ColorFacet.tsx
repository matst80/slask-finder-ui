import { useFilters } from "../../hooks/searchHooks";
import { KeyFacet } from "../../types";
import { colourNameToHex, cm } from "../../utils";

export const ColorFacetSelector = ({ id, values }: KeyFacet) => {
  const { addKeyFilter, keyFilters, removeKeyFilter } = useFilters();

  return (
    <div className="mb-4 border-b border-gray-100 pb-2">
      <h3 className="font-medium mb-2">Färg</h3>
      <div className="flex flex-wrap gap-2">
        {Object.keys(values).map((color) => {
          const colorHex = colourNameToHex(color);
          if (!colorHex) {
            return null;
          }
          const selected = keyFilters.find(
            (f) => f.id === id && f.value === color
          );
          return (
            <button
              key={color}
              title={color}
              className={cm(
                `w-6 h-6 rounded-full border`,
                selected ? "border-blue-500" : "border-gray-300"
              )}
              style={colorHex}
              aria-label={`Filter by ${color}`}
              onClick={() => {
                selected != null
                  ? removeKeyFilter(id)
                  : addKeyFilter(id, color);
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
