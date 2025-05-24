import { useQuery } from "../../lib/hooks/useQuery";
import { Loader } from "../Loader";
import { ResultItem } from "../ResultItem";
import { ProductCarouselContainer } from "./ProductCarouselContainer";
import { CarouselItem } from "./CarouselItem";

export const ResultCarousel = (context: {
  list_id: string;
  list_name: string;
}) => {
  const { hits, isLoading } = useQuery();

  return (
    <ProductCarouselContainer {...context}>
      {isLoading && <Loader size="md" />}
      {hits?.map((item, idx) => (
        <CarouselItem key={item.id}>
          <ResultItem {...item} position={idx} />
        </CarouselItem>
      ))}
    </ProductCarouselContainer>
  );
};
