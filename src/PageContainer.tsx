import { PropsWithChildren } from "react";
import { SidebarMenu } from "./components/SidebarMenu";
import { MiniCart } from "./components/MiniCart";

export const PageContainer = ({ children }: PropsWithChildren) => {
  return (
    <div>
      <SidebarMenu />
      <MiniCart />
      {children}
    </div>
  );
};
