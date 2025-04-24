import { Outlet } from "react-router-dom";
import { BuilderProvider } from "./BuilderProvider";
import { componentRules } from "./rules";
import { ItemWithComponentId } from "./builder-types";
import { PageContainer } from "../../PageContainer";
import { useBuilderContext } from "./useBuilderContext";
import { useEffect } from "react";

const saveBuildToLocalStorage = (data: ItemWithComponentId[]) => {
  globalThis.localStorage?.setItem("build", JSON.stringify(data));
};

const loadBuildFromLocalStorage = (): ItemWithComponentId[] => {
  const data = globalThis.localStorage?.getItem("build");
  return data ? JSON.parse(data) : [];
};

const SaveBuild = () => {
  const { selectedItems } = useBuilderContext();
  useEffect(() => {
    requestAnimationFrame(() => {
      saveBuildToLocalStorage(selectedItems);
    });
  }, [selectedItems]);
  return null;
};

export const BuilderMain = () => {
  const initialItems = loadBuildFromLocalStorage();

  return (
    <BuilderProvider initialRules={componentRules} initialItems={initialItems}>
      <PageContainer>
        <SaveBuild />
        <Outlet />
      </PageContainer>
    </BuilderProvider>
  );
};
