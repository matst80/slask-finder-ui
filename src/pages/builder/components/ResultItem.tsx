"use client";
import Image from "next/image";
import clsx from "clsx";
import { Button } from "@repo/ui/button";
import { PropsWithChildren } from "react";
import { useRecordClientTranslations } from "@components/product-filter/record.utils";
import { ItemWithComponentId, OnSelectedItem } from "./builder";
import { ImportantFacets } from "./ImportantFacets";
import {
  addImageDomain,
  convertToRecord,
} from "./slask-finder/slask-finder.utils";
import { Item } from "./slask-finder/slask-finder.types";
import { getPossibleDiscount } from "./rules";
import { ItemDetails } from "./ItemDetails";
import { ComponentCardInner } from "./ComponentCardInner";

export const ResultItem = ({
  item,
  tableFacets,
}: {
  item: ItemWithComponentId;
  tableFacets: number[];
}) => {
  return (
    <div className="flex gap-2 justify-between items-center">
      <div className="flex gap-4 items-center">
        <Image
          width={140}
          height={140}
          src={addImageDomain(item.img)}
          alt={item.title}
          className="size-20 object-contain mix-blend-multiply"
        />
        <div>
          <h2>{item.title}</h2>
          {tableFacets && (
            <ImportantFacets tableFacets={tableFacets} values={item.values} />
          )}
        </div>
      </div>
      <div className="flex gap-4 items-center justify-between">
        <div>
          <span>1 stk</span>&nbsp;
          <span className="font-bold font-regular text-[1.125rem] leading-5 tracking-wide">
            {item.values[4] / 100}.-
          </span>
        </div>
      </div>
    </div>
  );
};

export const ToggleResultItem = ({
  selected,
  isValid,
  tableFacets,
  ...item
}: Item & {
  selected: boolean;
  isValid: boolean;
  tableFacets?: number[];
} & OnSelectedItem) => {
  //const { selectedItems } = useBuilderContext();
  //const hasOtherItems = selectedItems.some((d) => d.mp != null && d.mp > 0);
  const possibleDiscount = getPossibleDiscount(item);
  //item.mp != null && item.mp > 0 ? (item.mp / 100) * item.values[4] : null;
  return (
    <ItemDetails
      item={item}
      key={item.id}
      className={clsx(
        "border p-2 relative",
        selected ? "border-accent border" : "border-gray-300",
      )}
    >
      <ResultItemInner tableFacets={tableFacets} {...item}>
        {possibleDiscount && (
          <>
            <span className="bg-blue-950 text-white text-xs font-bold p-1 rounded-sm my-2">
              Paket rabatt {Math.floor(possibleDiscount / 100)}.-
            </span>
            {/* <span>
              {Math.ceil((item.values[4] - (possibleDiscount ?? 0)) / 100)}.-
            </span> */}
          </>
        )}
        <Button
          variant={selected ? "contrast" : "secondaryTransparent"}
          size={"small"}
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

export const ResultItemInner = ({
  children,
  tableFacets,
  ...item
}: PropsWithChildren<Item & { tableFacets?: number[] }>) => {
  const { translations } = useRecordClientTranslations();
  return (
    <ComponentCardInner
      index={0}
      tableFacets={tableFacets}
      data={convertToRecord()(item)}
      translations={translations}
      values={item.values}
    >
      {children}
    </ComponentCardInner>
  );
};
