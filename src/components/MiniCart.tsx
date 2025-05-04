import { ShoppingCartIcon, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { makeImageUrl } from "../utils";
import { useCart, useChangeQuantity } from "../hooks/cartHooks";
import { ButtonLink } from "./ui/button";
import { Link } from "react-router-dom";
import { QuantityInput } from "../pages/builder/QuantityInput";
import { useTranslations } from "../lib/hooks/useTranslations";
import { Sidebar } from "./ui/sidebar";
import { PriceValue } from "./Price";

type CartDialogProps = {
  onClose: () => void;
};

const CartDialog = ({ onClose }: CartDialogProps) => {
  const { data: cart, isLoading } = useCart();
  const { trigger: changeQuantity } = useChangeQuantity();
  const t = useTranslations();
  const items = cart?.items ?? [];
  const totalPrice = cart?.totalPrice ?? 0;

  return (
    <div
      className="bg-white flex flex-col overflow-y-auto p-6 h-full w-full max-w-full md:max-w-md"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{t("cart.title")}</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-gray-500 text-center">{t("cart.empty")}</p>
      ) : (
        <>
          {isLoading ? (
            <div>{t("common.loading")}</div>
          ) : (
            <ul className="divide-y flex-1 divide-gray-200">
              {items.map((item) => (
                <li key={item.id + item.sku} className="py-4 flex flex-col">
                  <div className="flex items-start gap-2">
                    {item.image ? (
                      <img
                        src={makeImageUrl(item.image)}
                        alt={item.name}
                        className="size-16 rounded-sm object-contain aspect-square mr-4"
                      />
                    ) : (
                      <div></div>
                    )}
                    <div className="flex flex-col">
                      <Link
                        to={`/product/${item.sku}`}
                        className="text-sm font-medium"
                      >
                        {item.name}
                      </Link>
                      <span className="text-xs text-gray-500">
                        {item.brand} - {item.category}
                      </span>
                      {item.outlet != null && (
                        <span className="text-xs px-1 py-0.5 bg-amber-100 text-amber-800 rounded">
                          {item.outlet}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end items-center gap-2">
                    <div className="flex items-center gap-2">
                      <PriceValue
                        value={item.price}
                        className={
                          item.orgPrice > 0 && item.orgPrice > item.price
                            ? "text-red-600 font-bold"
                            : "font-bold"
                        }
                      />
                      {item.orgPrice > 0 && item.orgPrice > item.price && (
                        <PriceValue
                          className="line-through text-gray-400"
                          value={item.orgPrice}
                        />
                      )}
                    </div>
                    <QuantityInput
                      value={item.qty}
                      onChange={(value) => {
                        changeQuantity(
                          item.id,

                          value,
                          {
                            item_id: item.itemId,
                            index: item.id,
                            item_name: item.name,
                            price: item.price,
                            quantity: value,
                            item_brand: item.brand,
                            item_category: item.category,
                            item_category2: item.category2,
                            item_category3: item.category3,
                            item_category4: item.category4,
                            item_category5: item.category5,
                          }
                        );
                      }}
                      minQuantity={0}
                      maxQuantity={99}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="justify-end grow-0">
            <div className="mt-4 flex justify-between items-center">
              <span className="text-lg font-bold">{t("cart.total")}:</span>
              <PriceValue className="text-lg font-bold" value={totalPrice} />
            </div>
            <div className="mt-6 w-full">
              {cart?.paymentStatus === "checkout_completed" ? (
                <ButtonLink
                  onClick={onClose}
                  to={`/confirmation/${cart.orderReference}`}
                >
                  {t("cart.show_confirmation")}
                </ButtonLink>
              ) : (
                <ButtonLink onClick={onClose} to={"/checkout"}>
                  {t("cart.proceed_to_checkout")}
                </ButtonLink>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export const MiniCart = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { data: cart, isLoading } = useCart();
  const ref = useRef<HTMLSpanElement>(null);
  const totalItems = useMemo(
    () =>
      isLoading
        ? "~"
        : cart?.items?.reduce((acc, item) => acc + (item.qty ?? 1), 0) ?? 0,
    [cart, isLoading]
  );

  useEffect(() => {
    if (ref.current) {
      const elm = ref.current;
      elm.classList.add("animate-ping");
      const to = setTimeout(() => {
        elm.classList.remove("animate-ping");
      }, 300);
      return () => {
        clearTimeout(to);
        elm.classList.remove("animate-ping");
      };
    }
  }, [totalItems, ref]);

  if (cart == null || cart.items.length === 0) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed top-3 right-3 z-40 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors size-10 flex items-center justify-center"
      >
        <ShoppingCartIcon className="size-5" />

        <span
          ref={ref}
          className="absolute transition-all -top-1 -right-1 bg-blue-800 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
        >
          {totalItems}
        </span>
      </button>
      <Sidebar open={isCartOpen} setOpen={setIsCartOpen} side="right">
        <CartDialog onClose={() => setIsCartOpen(false)} />
      </Sidebar>
    </>
  );
};
