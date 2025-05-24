import { PropsWithChildren } from "react";
import { ImpressionProvider } from "../../lib/hooks/ImpressionProvider";

export const ProductCarouselContainer = ({
  children,
}: PropsWithChildren<{ list_id: string; list_name: string }>) => {
  return (
    <ImpressionProvider>
      <div className="max-w-[100vw] w-[100vw] md:max-w-screen -mx-4 md:mx-0 md:w-full carousel">
        {children}
      </div>
    </ImpressionProvider>
  );
};
