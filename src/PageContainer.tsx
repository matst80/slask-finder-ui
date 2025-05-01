import { PropsWithChildren } from "react";
import { NavMenu, SidebarMenu } from "./components/SidebarMenu";
import { MiniCart } from "./components/MiniCart";

export const PageContainer = ({ children }: PropsWithChildren) => {
  return (
    <div className="w-full md:px-6 2xl:px-0 2xl:min-h-screen 2xl:grid grid-cols-[auto_1fr]">
      <div className="hidden 2xl:block border-r border-gray-300 bg-white">
        <NavMenu />
      </div>
      <div className="lg:px-6">
        <SidebarMenu />
        <MiniCart />
        {children}
      </div>
    </div>
  );
};
