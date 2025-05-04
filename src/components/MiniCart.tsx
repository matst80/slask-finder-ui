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
import { useCompatibleItems } from "../hooks/searchHooks";

type CartDialogProps = {
  onClose: () => void;
};

const CartCompatible = ({ id }: { id: number }) => {
  const { data: cart } = useCart();
  const { data, isLoading } = useCompatibleItems(id);
  if (!isLoading && data?.length === 0) {
    return null;
  }
  return (
    <div className="group-hover:opacity-100 group-hover:max-h-24 max-h-0 bg-gray-50 left-0 right-0 border border-gray-300 rounded-md overflow-hidden mt-2 opacity-0 transition-all">
      <div className="p-1 overflow-x-auto flex flex-nowrap gap-1 relative">
        {data
          ?.filter((d) => !cart?.items?.some((c) => c.id == d.id))
          .map((item) => {
            return (
              <div
                key={item.id}
                className="flex w-16 shrink-0 items-center gap-2 bg-white rounded-md"
              >
                <Link
                  to={`/product/${item.id}`}
                  className="text-sm font-medium aspect-square"
                >
                  <img
                    src={makeImageUrl(item.img)}
                    title={item.title}
                    alt={item.title}
                    className="size-16 rounded-sm object-contain aspect-square mr-4"
                  />

                  {/* <span>{item.title}</span> */}
                </Link>
              </div>
            );
          })}
      </div>
    </div>
  );
};

const CartDialog = ({ onClose }: CartDialogProps) => {
  const { data: cart, isLoading } = useCart();
  const { trigger: changeQuantity } = useChangeQuantity();
  const t = useTranslations();
  const items = cart?.items ?? [];
  const totalPrice = cart?.totalPrice ?? 0;
  const totalTax = cart?.totalTax ?? 0;
  const totalDiscount = cart?.totalDiscount ?? 0;

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
            <div className="divide-y flex-1 divide-gray-200">
              {items.map((item) => (
                <Link
                  to={`/product/${item.sku}`}
                  key={item.id + item.sku}
                  className="py-4 flex flex-col group relative"
                >
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
                      <span className="text-sm font-medium">{item.name}</span>
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
                  <div className="flex justify-end items-center gap-2 pt-2">
                    <div className="flex items-center gap-2">
                      {item.orgPrice > 0 && item.orgPrice > item.price && (
                        <PriceValue
                          className="line-through text-gray-400 text-xs"
                          value={item.orgPrice}
                        />
                      )}
                      <PriceValue
                        value={item.price}
                        className={
                          item.orgPrice > 0 && item.orgPrice > item.price
                            ? "text-red-600 font-bold"
                            : "font-bold"
                        }
                      />
                    </div>
                    <QuantityInput
                      value={item.qty}
                      onChange={(value) => {
                        changeQuantity(item.id, value, {
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
                        });
                      }}
                      minQuantity={0}
                      maxQuantity={99}
                    />
                  </div>
                  <CartCompatible id={Number(item.itemId)} />
                </Link>
              ))}
            </div>
          )}

          <div className="mt-4 justify-end grow-0">
            <div className="flex justify-between items-center">
              <span className="font-bold">{t("cart.totalTax")}:</span>
              <PriceValue value={totalTax} />
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between items-center">
                <span className="font-bold">{t("cart.totalDiscount")}:</span>
                <PriceValue value={totalDiscount} />
              </div>
            )}
            <div className="mt-2 pt-2 flex justify-between items-center border-t border-gray-200">
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
