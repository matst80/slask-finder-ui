import { useCallback } from "react";
import { ItemDetail } from "../../lib/types";
import { useFacetMap } from "../../hooks/searchHooks";
import { convertDetails } from "../../page-components/tools";
import {
  AiShoppingProvider,
  MessageList,
  QueryInput,
} from "../../page-components/AiShopper";

export const AiChatForCurrentProduct = (item: ItemDetail) => {
  const { data: facets } = useFacetMap();
  const convertItem = useCallback(convertDetails(facets ?? {}), [facets]);
  if (!item || !facets) return null;
  return (
    <AiShoppingProvider
      messages={[
        {
          role: "system",
          content:
            "The user needs some help, details for the product: \n```json\n" +
            JSON.stringify(convertItem(item)) +
            "\n```",
        },
      ]}
    >
      <div className="flex flex-col gap-6 flex-1">
        <div className="flex-1 overflow-auto">
          <MessageList />
        </div>
        <QueryInput />
      </div>
    </AiShoppingProvider>
  );
};
