"use client";


import { ItemWithComponentId } from "../builder-types"
import { BuilderProvider } from "../BuilderProvider"
import { componentRules } from "../rules"
import { BuilderContent } from "./BuilderContent"

const saveBuildToLocalStorage = (data: ItemWithComponentId[]) => {
  globalThis.localStorage?.setItem("build", JSON.stringify(data));
};

const loadBuildFromLocalStorage = (): ItemWithComponentId[] => {
  const data = globalThis.localStorage?.getItem("build");
  return data ? JSON.parse(data) : [];
};


export const LocalStorageBuilder = () => {

  
  
  const saveBuild = (items: ItemWithComponentId[]) => {
    saveBuildToLocalStorage(items);
  };

  const initialItems = loadBuildFromLocalStorage();
  
  return (
    <BuilderProvider
      initialRules={componentRules}
      initialItems={initialItems}
      //globalFilters={{ stock: ["2001"] }}
      
      onSelectionChange={saveBuild}
    >
      <BuilderContent />
      {/* <Button
        onClick={() =>
          sendItemsToStore(
            2001,
            siteContext,
          )(
            loadBuildFromLocalStorage().map((d) => ({
              sku: d.sku,
              quantity: 1,
            })),
          )
        }
      >
        Betala i butik
      </Button> */}
    </BuilderProvider>
  );
};
