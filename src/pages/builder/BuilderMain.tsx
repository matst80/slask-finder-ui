import { Outlet } from "react-router-dom";
import { BuilderProvider } from "./BuilderProvider";
import { componentRules, defaultComponentOrder } from "./rules";
import { ItemWithComponentId, RuleId } from "./builder-types";
import { PageContainer } from "../../PageContainer";
import { useBuilderContext } from "./useBuilderContext";
import { useEffect } from "react";

type LocalStorageData = {
  items: ItemWithComponentId[];
  order: RuleId[];
};

const saveBuildToLocalStorage = (data: LocalStorageData) => {
  globalThis.localStorage?.setItem("build2", JSON.stringify(data));
};

const loadBuildFromLocalStorage = (): LocalStorageData => {
  const data = globalThis.localStorage?.getItem("build2");
  return data ? JSON.parse(data) : { items: [], order: defaultComponentOrder };
};

const SaveBuild = () => {
  const { selectedItems, order } = useBuilderContext();
  useEffect(() => {
    requestAnimationFrame(() => {
      saveBuildToLocalStorage({
        items: selectedItems,
        order,
      });
    });
  }, [selectedItems, order]);
  return null;
};

export const BuilderMain = () => {
  const { items, order } = loadBuildFromLocalStorage();

  return (
    <BuilderProvider
      initialRules={componentRules}
      initialItems={items}
      initialOrder={order}
    >
      <PageContainer>
        <SaveBuild />
        <Outlet />
      </PageContainer>
    </BuilderProvider>
  );
};
