"use client";




import { ItemDetails } from "./ItemDetails";
import { Item } from "../../../lib/types"
import { OnSelectedItem } from "../builder-types"
import { cm } from "../../../utils"
import { Button } from "../../../components/ui/button"
import {  ResultItemInner } from "../../../components/ResultItem"




export const ToggleResultItem = ({
  selected,
  isValid,
  ...item
}: Item & {
  selected: boolean;
  isValid: boolean;
  tableFacets?: number[];
} & OnSelectedItem) => {
  
  return (
    <ItemDetails
      item={item}
      key={item.id}
      className={cm(
        "border p-2 relative border-collapse",
        selected ? "border-accent border" : "border-gray-300",
      )}
    >
      <ResultItemInner  {...item}>
        {/* {tableFacets!=null && <ImportantFacets tableFacets={tableFacets} values={item.values} />} */}
        <Button
          variant={selected ? "default" : "outline"}
          size={"sm"}
          disabled={!isValid}
          className="mt-4"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            item.onSelectedChange(selected ? null : item);
          }}
        >
          Välj
        </Button>
      </ResultItemInner>
    </ItemDetails>
  );
};

