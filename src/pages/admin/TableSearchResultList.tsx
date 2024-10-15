import { Table, Link, Edit, Trash } from "lucide-react";
import { useMemo } from "react";
import { usePopularity, useStaticPositions } from "../../adminHooks";
import {
  useHashResultItems,
  useHashQuery,
  useFacetList,
} from "../../hooks/searchHooks";
import { CategoryList } from "../../components/SearchResultList";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import { Input } from "../../components/ui/input";
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../../components/ui/table";

export const TableSearchResultList = () => {
  const { data: results, isLoading: loadingItems } = useHashResultItems();
  const {
    popular,
    setItemPopularity,
    isDirty: isDirtyPopular,
    save: savePopular,
  } = usePopularity();
  const {
    positions,
    setItemPosition,
    isDirty: isDirtyPositions,
    save: savePositions,
  } = useStaticPositions();
  const {
    query: { query },
  } = useHashQuery();
  const { data } = useFacetList();
  const virtualCategories = useMemo(
    () => data?.filter((facet) => facet.type === "virtual"),
    [data]
  );

  //const start = (page ?? 0) * (pageSize ?? 40);
  if (loadingItems && (!results || !results.length)) {
    return <div>Loading...</div>;
  }

  if (!results || (!results.length && (query == null || query.length < 1))) {
    return <CategoryList />;
  }
  return (
    <>
      <form>
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Select</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Popularity</TableHead>
                <TableHead>Static position</TableHead>
                {virtualCategories?.map((category) => (
                  <TableHead key={`vcat-${category.id}`}>
                    {category.name}
                  </TableHead>
                ))}
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Checkbox name={product.id} />
                  </TableCell>
                  <TableCell className="font-bold">{product.title}</TableCell>
                  <TableCell>{product.values["10"]}</TableCell>
                  <TableCell>
                    <Input
                      value={popular[Number(product.id)] ?? 0}
                      onChange={(e) => {
                        setItemPopularity(
                          Number(product.id),
                          Number(e.target.value)
                        );
                      }}
                      className="w-14"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={positions[Number(product.id)] ?? 0}
                      onChange={(e) => {
                        setItemPosition(
                          Number(product.id),
                          Number(e.target.value)
                        );
                      }}
                      className="w-14"
                    />
                  </TableCell>
                  {virtualCategories?.map((category) => (
                    <TableCell key={`vcat-${category.id}-${product.id}`}>
                      <Input
                        defaultValue={product.values[category.id]}
                        className="w-24"
                        name={`${category.id}-${product.id}`}
                      />
                    </TableCell>
                  ))}
                  <TableCell>{product.values["4"].toFixed(2)}</TableCell>
                  <TableCell>{product.stockLevel ?? "0"}</TableCell>
                  <TableCell className="justify-end flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Link to={`/edit/product/${product.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </form>
      <div className="flex gap-2 mt-4 sticky bottom-4">
        <Button
          disabled={!isDirtyPopular}
          onClick={() => {
            savePopular();
          }}
        >
          Save popular
        </Button>
        <Button
          disabled={!isDirtyPositions}
          onClick={() => {
            savePositions();
          }}
        >
          Save static positions
        </Button>
      </div>
    </>
  );
};
