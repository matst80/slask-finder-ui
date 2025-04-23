import { Outlet } from "react-router-dom";
import { BuilderProvider } from "./BuilderProvider";
import { componentRules } from "./rules";
import { ItemWithComponentId } from "./builder-types";
import { PageContainer } from "../../PageContainer";

const saveBuildToLocalStorage = (data: ItemWithComponentId[]) => {
  globalThis.localStorage?.setItem("build", JSON.stringify(data));
};

const loadBuildFromLocalStorage = (): ItemWithComponentId[] => {
  const data = globalThis.localStorage?.getItem("build");
  return data ? JSON.parse(data) : [];
};

export const BuilderMain = () => {
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
      <PageContainer>
        <Outlet />
      </PageContainer>
    </BuilderProvider>
  );
};
