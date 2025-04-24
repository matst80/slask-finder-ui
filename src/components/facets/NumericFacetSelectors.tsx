import { ChevronUp, ChevronDown } from "lucide-react";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { NumberFacet } from "../../lib/types";
import { converters } from "../../utils";
import { Slider } from "./Slider";
import { useQueryRangeFacet } from "../../lib/hooks/useQueryRangeFacet";

type SelectedRange = {
  min: number;
  max: number;
};

export default function HistogramWithSelection({
  bins,
  onSelection,
  selection,
}: {
  bins: number[];
  selection: SelectedRange | undefined;
  onSelection?: (data: SelectedRange) => void;
}) {
  const width = 288;
  const height = 80;
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<number | null>(null);

  useEffect(() => {
    if (selection != null) {
      setSelectionStart(selection.min * width);
      setSelectionEnd(selection.max * width);
    } else {
      setSelectionStart(null);
      setSelectionEnd(null);
    }
  }, [selection]);
  const [isDragging, setIsDragging] = useState(false);
  // const [selectedRange, setSelectedRange] = useState<{
  //   min: number;
  //   max: number;
  // } | null>(null);
  //const [selectedCount, setSelectedCount] = useState<number>(0);

  const svgRef = useRef<SVGSVGElement>(null);

  // Constants for the SVG dimensions and margins

  const margin = { top: 0, right: 0, bottom: 0, left: 0 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Handle mouse events for selection
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;

    const svgRect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - svgRect.left - margin.left;

    setSelectionStart(x);
    setSelectionEnd(x);
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDragging || !svgRef.current) return;

    const svgRect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - svgRect.left - margin.left;

    setSelectionEnd(Math.max(0, Math.min(x, innerWidth)));
  };

  const handleMouseUp = () => {
    if (!isDragging) return;

    setIsDragging(false);

    if (selectionStart !== null && selectionEnd !== null) {
      const min = Math.min(selectionStart, selectionEnd);
      const max = Math.max(selectionStart, selectionEnd);

      // Convert pixel positions to percentages
      const dataMin = min / innerWidth;
      const dataMax = max / innerWidth;

      onSelection?.({ min: dataMin, max: dataMax });
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      const end =
        selectionEnd != null && selectionEnd > innerHeight / 2 ? innerWidth : 0;

      setSelectionEnd(end);
      if (selectionStart !== null && selectionEnd !== null) {
        const min = Math.min(selectionStart, end);
        const max = Math.max(selectionStart, end);

        // Convert pixel positions to percentages
        const dataMin = min / innerWidth;
        const dataMax = max / innerWidth;

        onSelection?.({ min: dataMin, max: dataMax });
      }
    }
  };

  // Calculate the maximum bin height for scaling
  const maxBinHeight = Math.max(...bins);

  // Calculate bar width based on the number of bins
  const barWidth = innerWidth / bins.length;

  return (
    <div className="relative mt-4 h-20 w-full border border-gray-300 rounded-md overflow-hidden">
      <svg
        ref={svgRef}
        width={"100%"}
        height={"100%"}
        className="overflow-visible"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {/* X and Y axes */}
        <line
          x1={margin.left}
          y1={height - margin.bottom}
          x2={width - margin.right}
          y2={height - margin.bottom}
          stroke="black"
          strokeWidth={1}
        />
        <line
          x1={margin.left}
          y1={margin.top}
          x2={margin.left}
          y2={height - margin.bottom}
          stroke="black"
          strokeWidth={1}
        />

        {/* Histogram bars */}
        <g transform={`translate(${margin.left}, 0)`}>
          {bins.map((bin, i) => {
            const barHeight = (bin / maxBinHeight) * innerHeight;
            const x = i * barWidth;
            const y = height - margin.bottom - barHeight;

            // Check if this bar is in the selected range
            const isSelected = false;

            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={barWidth - 1}
                height={barHeight}
                fill={isSelected ? "rgb(99, 102, 241)" : "rgb(209, 213, 219)"}
                stroke="white"
                strokeWidth={0.5}
              />
            );
          })}
        </g>

        {/* Selection overlay */}
        {selectionStart !== null && selectionEnd !== null && (
          <rect
            x={margin.left + Math.min(selectionStart, selectionEnd)}
            y={margin.top}
            width={Math.abs(selectionEnd - selectionStart)}
            height={innerHeight}
            fill="rgba(99, 102, 241, 0.3)"
            stroke="rgb(79, 70, 229)"
            strokeWidth={1}
          />
        )}

        {/* <text
          x={width / 2}
          y={height - 5}
          textAnchor="middle"
          className="text-xs"
        >
          Value
        </text>

        
        <text
          x={15}
          y={height / 2}
          textAnchor="middle"
          transform={`rotate(-90, 15, ${height / 2})`}
          className="text-xs"
        >
          Frequency
        </text> */}
      </svg>
    </div>
  );
}

export const NumberFacetSelector = ({
  id,
  name,
  result: { min, max, buckets },
  selected,
  disabled,
  valueType,
  defaultOpen,
}: NumberFacet & {
  disabled?: boolean;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const { updateValue } = useQueryRangeFacet(id);
  const { toDisplayValue, fromDisplayValue } = useMemo(
    () => converters(valueType),
    [valueType]
  );
  const histogramValue = useMemo(
    () =>
      selected && selected.min !== min && selected.max !== max
        ? { min: selected.min / max, max: selected.max / max }
        : undefined,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selected]
  );
  const sliderChanged = useCallback(
    (min: number, max: number) => {
      // console.log("onChange", min, max);
      updateValue({
        min: fromDisplayValue(min),
        max: fromDisplayValue(max),
      });
    },
    [fromDisplayValue, updateValue]
  );
  const invalid = useMemo(() => {
    if (selected == null) return false;
    if (selected.max > min) {
      return "Search range is invalid (min)";
    }
    if (selected.min > max) {
      return "Search range is invalid (max)";
    }
    return false;
  }, [selected, min, max]);
  // console.log({ selected, limits: { min, max }, histogramValue });
  return (
    <fieldset
      className="mb-4 border-b border-gray-100 pb-2"
      disabled={disabled}
    >
      <button
        className="font-medium bold mb-2 flex items-center justify-between w-full text-left"
        onClick={() => setOpen((p) => !p)}
      >
        <span>{name}</span>
        {open ? (
          <ChevronUp className="size-4" />
        ) : (
          <ChevronDown className="size-4" />
        )}
      </button>
      {invalid && (
        <pre className="bg-amber-300 p-2 text-amber-600 text-xs">{invalid}</pre>
      )}
      {open && (
        <>
          <Slider
            min={toDisplayValue(selected?.min ?? min)}
            max={toDisplayValue(selected?.max ?? max)}
            absoluteMax={toDisplayValue(max)}
            absoluteMin={toDisplayValue(min)}
            onChange={sliderChanged}
          />

          {buckets != null && buckets.length > 1 && (
            <HistogramWithSelection
              bins={buckets}
              selection={histogramValue}
              onSelection={(d) => {
                const value = {
                  min: Math.floor(max * d.min),
                  max: Math.ceil(max * d.max),
                };

                updateValue(value);
              }}
            />
          )}
        </>
      )}
    </fieldset>
  );
};
