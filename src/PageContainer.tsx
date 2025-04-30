import { PropsWithChildren } from "react";
import { SidebarMenu } from "./components/SidebarMenu";

export const PageContainer = ({ children }: PropsWithChildren) => {
  return (
    <>
      <SidebarMenu />
      {children}
    </>
  );
};
