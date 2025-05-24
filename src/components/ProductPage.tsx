import { ItemDetails } from "./ItemDetails";
import { ItemDetail } from "../lib/types";
import { Loader } from "./Loader";

// type Props = {
//   isEdit?: boolean;
// };

export const ProductPage = (details: ItemDetail) => {
  return (
    <div className="container mx-auto px-4 py-8">
      {details ? <ItemDetails {...details} /> : <Loader size="md" />}
    </div>
  );
};
