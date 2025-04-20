import { ResultItemInner } from "../../../components/ResultItem"
import { ItemWithComponentId } from "../builder-types"
import { componentRules } from "../rules"
import { ImportantFacets } from "./ImportantFacets"

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
          <ResultItemInner
            key={item.id}
        {...item}
            
          >
            <ImportantFacets 
              values={item.values}
            tableFacets={
              componentRules
                .filter((d) => d.type === "component")
                .find((d) => d.id == item.componentId)?.importantFacets ?? []} />
            
            </ResultItemInner>
        ))}
      </div>
    </>
  );
};
