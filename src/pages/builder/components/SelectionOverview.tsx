import { ItemWithComponentId } from "./builder";
import { ResultItem } from "./ResultItem";
import { componentRules } from "./rules";

type Props = {
  items: ItemWithComponentId[];
};

export const SelectionOverview = ({ items }: Props) => {
  return (
    <>
      <div>
        <span className="text-black text-2xl font-semibold">Ditt </span>
        <span className="text-[#4a90e2] text-2xl font-semibold">
          fantastiska
        </span>
        <span className="text-black text-2xl font-semibold"> bygge</span>
      </div>
      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <ResultItem
            key={item.id}
            item={item}
            tableFacets={
              componentRules
                .filter((d) => d.type === "component")
                .find((d) => d.id == item.componentId)?.importantFacets ?? []
            }
          />
        ))}
      </div>
    </>
  );
};
