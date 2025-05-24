import { PropsWithChildren } from "react";

export const CarouselItem = ({ children }: PropsWithChildren) => {
  return <div className="shrink-0 w-[300px] flex snap-start">{children}</div>;
};
