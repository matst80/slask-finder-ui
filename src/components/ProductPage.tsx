import { useLoaderData } from "react-router-dom";
import { ItemDetails } from "./ItemDetails";
import { ItemDetail } from "../types";

export const ProductPage = () => {
  const details = useLoaderData() as ItemDetail | null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Produktsida</h1>
      {details ? <ItemDetails {...details} /> : <p>Laddar...</p>}
    </div>
  );
};
