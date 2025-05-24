"use client";
import { useState } from "react";
import { ItemDetail } from "../../lib/types";
import { useAdmin } from "../../hooks/appState";
import {
  getAdminItem,
  getAdminItemPopularity,
  ItemPopularity,
} from "../../lib/datalayer/api";
import { trackAction } from "../../lib/datalayer/beacons";
import { Button } from "../ui/button";
import { UserCog } from "lucide-react";
import { PriceValue } from "../Price";

export const PopulateAdminDetails = ({ id }: { id: number }) => {
  const [isAdmin] = useAdmin();
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [popularity, setPopularity] = useState<ItemPopularity | null>(null);
  if (!isAdmin) return null;
  if (item != null) {
    const mp = Math.max(item.mp ?? 0, 0);
    const itemPrice = typeof item.values[4] === "number" ? item.values[4] : 0;
    const possibleDiscount = itemPrice * (mp / 100);
    console.log({ popularity }); // popularity is set but not used, kept as in original
    return (
      <>
        <div className="p-4 my-2 flex gap-2 items-center justify-between bg-amber-100 text-amber-800 rounded-lg">
          <PriceValue
            value={itemPrice - possibleDiscount}
            className="font-bold"
          />
          {mp > 0 && <span>{mp}%</span>}
        </div>
      </>
    );
  }
  return (
    <Button
      size="sm"
      variant="outline"
      className="my-2"
      onClick={() => {
        trackAction({ action: "fetch_admin_details", reason: "admin_button" });
        getAdminItem(id).then(setItem);
        getAdminItemPopularity(id).then(setPopularity);
      }}
    >
      <UserCog className="size-5" />
    </Button>
  );
};
