import { ItemDetail } from "../../lib/types";
import { useCompatibleItems } from "../../hooks/searchHooks";
import { useSwitching } from "../../lib/hooks/useSwitching";
import { useEffect } from "react";
import { isDefined } from "../../utils";
import { ProductCarouselContainer } from "./ProductCarouselContainer";
import { Loader } from "../Loader";
import { ResultItem } from "../ResultItem";
import { CarouselItem } from "./CarouselItem";

export const CompatibleItems = ({ id }: Pick<ItemDetail, "id">) => {
  const { data, isLoading } = useCompatibleItems(id, []);
  const [productType, setProductTypes] = useSwitching<string>(5000);
  useEffect(() => {
    setProductTypes(
      Array.from(
        new Set(
          data
            ?.map((d) => d.values[31158])
            .filter(isDefined)
            .map((d) => String(d))
        )
      )
    );
  }, [data, setProductTypes]);
  if (!data || data.length === 0) return null;
  return (
    <div className="relative">
      <div className="text-2xl pt-6 mb-8">
        Har du glömt{" "}
        <span
          key={"slask-" + productType}
          className="text-black font-bold animate-pop underline underline-indigo-500"
        >
          {productType ?? ""}
        </span>
      </div>
      <ProductCarouselContainer list_id="compatible" list_name="Compatible">
        {isLoading && <Loader size="md" />}
        {data?.map((item, idx) => (
          <CarouselItem key={item.id}>
            <ResultItem {...item} position={idx} />
          </CarouselItem>
        ))}
      </ProductCarouselContainer>
    </div>
  );
};
