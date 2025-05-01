import { PropsWithChildren } from "react";
import { SidebarMenu } from "./components/SidebarMenu";
import { MiniCart } from "./components/MiniCart";

export const PageContainer = ({ children }: PropsWithChildren) => {
  return (
    <div className="md:py-10 md:px-6">
      <SidebarMenu />
      <MiniCart />
      {children}
    </div>
  );
};
