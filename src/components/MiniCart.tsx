import { ShoppingCartIcon, X } from "lucide-react";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";

import { cm, isDefined, makeImageUrl } from "../utils";
import { useCart, useChangeQuantity } from "../hooks/cartHooks";
import { ButtonLink } from "./ui/button";
import { Link } from "react-router-dom";
import { QuantityInput } from "../pages/builder/QuantityInput";
import { useTranslations } from "../lib/hooks/useTranslations";
import { Sidebar } from "./ui/sidebar";
import { Price, PriceElement, PriceValue } from "./Price";
import { useCompatibleItems } from "../hooks/searchHooks";
import { CartItem, ItemPrice } from "../lib/types";

type CartDialogProps = {
  onClose: () => void;
};

const CartCompatible = ({ id }: { id: number }) => {
  const { data: cart } = useCart();
  const [open, setOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [idx, setIdx] = useState(0);
  const { data, isLoading } = useCompatibleItems(
    id,
    cart?.items.map((c) => Number(c.itemId)).filter(isDefined) ?? []
  );
  const productTypes = useMemo(() => {
    return Array.from(
      new Set(
        data
          ?.map((d) => d.values[31158])
          .filter(isDefined)
          .map((d) => String(d))
      )
    );
  }, [data]);
  useEffect(() => {
    const to = setInterval(() => {
      setIdx((p) => (productTypes != null ? (p + 1) % productTypes.length : 0));
    }, 5000);
    return () => {
      clearInterval(to);
    };
  }, [productTypes]);
  const productType = useMemo(() => productTypes[idx], [idx, productTypes]);
  if (!isLoading && data?.length === 0) {
    return null;
  }

  return (
    <>
      <button
        className={cm(
          "text-xs text-gray-600 line-clamp-1 -mb-2 mt-1 text-left animate-pop border-gray-200 pb-1",
          open ? "" : "border-b"
        )}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setOpen(!open);
        }}
      >
        Glömde du{" "}
        <span key={productType ?? ""} className="text-black animate-acc">
          {productType ?? ""}
        </span>
      </button>
      {open && (
        <div className="animate-pop bg-gray-50 border-y border-gray-300 overflow-hidden mt-2 -mx-6 grid grid-cols-[auto_1fr_auto] gap-x-4 gap-y-4 p-4 items-center">
          {data
            ?.filter((d) => !cart?.items?.some((c) => Number(c.itemId) == d.id))
            .slice(undefined, showMore ? undefined : 4)
            .map((item) => {
              return (
                <Fragment key={item.id}>
                  <img
                    src={makeImageUrl(item.img)}
                    title={item.title}
                    alt={item.title}
                    className="size-14 rounded-sm object-contain mix-blend-multiply aspect-square flex-shrink-0"
                  />
                  <Link
                    to={`/product/${item.id}`}
                    className="text-xs flex-1 flex flex-col"
                  >
                    <span className="line-clamp-1 font-medium overflow-ellipsis">
                      {item.title}
                    </span>
                    <div className="flex flex-col">
                      {item.bp.split("\n").map((t) => (
                        <span className="text-gray-600 text-2xs line-clamp-1 overflow-ellipsis">
                          {t}
                        </span>
                      ))}
                    </div>
                  </Link>
                  <Price size="small" values={item.values} />
                </Fragment>
              );
            })}
          <div className="flex flex-col col-span-3">
            <button
              className="text-xs text-gray-600 hover:text-gray-800"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setShowMore(!showMore);
              }}
            >
              Show {showMore ? "less" : "more"}
            </button>
          </div>
        </div>
      )}
    </>
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

  function getCartItemPrice(item: CartItem): ItemPrice {
    const price = item.price;
    const orgPrice = item.orgPrice ?? 0;
    const isDiscounted = orgPrice > price;
    if (isDiscounted) {
      return {
        current: price,
        original: orgPrice,
        discount: orgPrice - price,
        isDiscounted: true,
      };
    }
    return {
      current: price,
      isDiscounted: false,
    };
  }

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
            <ul className="flex-1">
              {items.map((item) => (
                <li
                  key={item.id + item.sku}
                  className="py-3 flex flex-col group relative"
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

                  <div className="flex justify-end items-center gap-2 pt-2">
                    <PriceElement price={getCartItemPrice(item)} size="small" />
                    {/* <div className="flex items-center gap-2">
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
                    </div> */}
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
                </li>
              ))}
            </ul>
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
