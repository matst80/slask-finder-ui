"use client";
import { ItemDetail } from "../../lib/types";
import { useRelatedItems } from "../../hooks/searchHooks";
import { Loader } from "../Loader";
import { ResultItem } from "../ResultItem";
import { ProductCarouselContainer } from "./ProductCarouselContainer";
import { CarouselItem } from "./CarouselItem";

export const RelatedItems = ({ id }: Pick<ItemDetail, "id">) => {
  const { data, isLoading } = useRelatedItems(id);

  return (
    <ProductCarouselContainer list_id="related" list_name="Related">
      {isLoading && <Loader size="md" />}
      {data?.map((item, idx) => (
        <CarouselItem key={item.id}>
          <ResultItem {...item} position={idx} />
        </CarouselItem>
      ))}
    </ProductCarouselContainer>
  );
};
