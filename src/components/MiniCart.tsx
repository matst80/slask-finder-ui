import { ShoppingCartIcon, TicketIcon, X } from "lucide-react";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";

import { cm, isDefined, makeImageUrl } from "../utils";
import {
  useAddToCart,
  useAddVoucher,
  useCart,
  useChangeQuantity,
} from "../hooks/cartHooks";
import { ButtonAnchor } from "./ui/button";
import { Link } from "react-router-dom";
import { QuantityInput } from "../pages/builder/QuantityInput";
import { useTranslations } from "../lib/hooks/useTranslations";
import { Sidebar } from "./ui/sidebar";
import { Price, PriceElement, PriceValue } from "./Price";
import { useCompatibleItems } from "../hooks/searchHooks";
import { CartItem, ItemPrice, Voucher } from "../lib/types";
import { toEcomTrackingEvent } from "./toImpression";
import { ImpressionProvider } from "../lib/hooks/ImpressionProvider";
import { useSwitching } from "../lib/hooks/useSwitching";
import {
  ShippingInputs,
  ShippingOptionList,
  ShippingProvider,
} from "../pages/Shipping";

type CartDialogProps = {
  onClose: () => void;
  open: boolean;
};

const hasLength = (value?: string | null) => {
  return value != null && value.length > 0;
};

const CartCompatible = ({ id }: { id: number }) => {
  const { data: cart } = useCart();
  const { isMutating, trigger: addToCart } = useAddToCart();
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [productType, setProductTypes] = useSwitching<string>(5000);

  const { data, isLoading } = useCompatibleItems(
    id,
    cart?.items.map((c) => Number(c.itemId)).filter(isDefined) ?? [],
  );
  useEffect(() => {
    setProductTypes(
      Array.from(
        new Set(
          data
            ?.map((d) => d.values[31158])
            .filter(isDefined)
            .map((d) => String(d)),
        ),
      ),
    );
  }, [data, setProductTypes]);

  if (!isLoading && data?.length === 0) {
    return null;
  }

  return (
    <>
      <button
        className={cm(
          "text-xs text-gray-600 line-clamp-1 -mb-2 mt-1 text-left animate-pop border-gray-200 pb-1",
          open ? "" : "border-b",
        )}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setOpen(!open);
        }}
      >
        Glömde du{" "}
        <span
          key={productType}
          className="text-black animate-acc underline underline-indigo-500"
        >
          {productType}
        </span>
      </button>
      {open && (
        <ImpressionProvider>
          <div className="animate-pop bg-gradient-to-b from-white to-gray-100 border-y border-gray-300 overflow-hidden mt-2 -mx-6 grid grid-cols-[auto_1fr_auto] gap-x-4 gap-y-4 p-4 items-center">
            {data?.slice(undefined, showMore ? undefined : 4).map((item, a) => {
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
                      {item.bp
                        .split("\n")
                        .filter(hasLength)
                        .map((s) => (
                          <span
                            key={s}
                            className="text-gray-600 text-2xs line-clamp-1 overflow-ellipsis"
                          >
                            {s}
                          </span>
                        ))}
                    </div>
                  </Link>
                  <div className="flex flex-col items-end">
                    <Price size="small" values={item.values} />
                    <button
                      disabled={isMutating}
                      onClick={() =>
                        addToCart(
                          { ...item, quantity: 1 },
                          toEcomTrackingEvent(item, a),
                        )
                      }
                      className="underline text-xs text-gray-600 hover:text-gray-800"
                    >
                      {t("cart.add")}
                    </button>
                  </div>
                </Fragment>
              );
            })}
            {data != null && data?.length > 4 && (
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
            )}
          </div>
        </ImpressionProvider>
      )}
    </>
  );
};

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

const useCartItemData = (item: CartItem) => {
  return useMemo(() => {
    return {
      price: getCartItemPrice(item),
      trackingItem: (value?: number) => ({
        item_id: item.itemId,
        index: item.id,
        item_name: item.name,
        price: item.price,
        quantity: value ?? item.qty,
        item_brand: item.brand,
        item_category: item.category,
        item_category2: item.category2,
        item_category3: item.category3,
        item_category4: item.category4,
        item_category5: item.category5,
      }),
    };
  }, [item]);
};

const ownIds = ["001071", "498"];

const CartItemElement = ({ item, open }: { item: CartItem; open: boolean }) => {
  const { trigger: changeQuantity } = useChangeQuantity();
  const { price, trackingItem } = useCartItemData(item);

  return (
    <li key={item.id + item.sku} className="py-3 flex flex-col group relative">
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
        <div className="flex flex-col grow flex-1">
          <Link to={`/product/${item.itemId}`} className="text-sm font-medium">
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
          {item.sellerId != null &&
            item.sellerName != null &&
            !ownIds.includes(item.sellerId) && (
              <span className="text-xs self-end px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full inline-block">
                {item.sellerName}
              </span>
            )}
        </div>
      </div>

      {open && (
        <>
          <div className="flex justify-end items-center gap-2 pt-2 animate-pop">
            <PriceElement price={price} size="small" />
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
                changeQuantity(item.id, value, trackingItem(value));
              }}
              minQuantity={0}
              maxQuantity={99}
            />
          </div>

          <CartCompatible id={Number(item.itemId)} />
        </>
      )}
    </li>
  );
};

const Vouchers = ({ added }: { added: Voucher[] }) => {
  const t = useTranslations();
  const { trigger: addVoucher, isMutating, error } = useAddVoucher();
  const [code, setCode] = useState("");

  return (
    <div>
      {added?.length > 0 ? (
        <div className="flex flex-col gap-2">
          {added.map((voucher) => (
            <div key={voucher.code} className="flex items-center gap-2">
              <div className="bg-gray-200 rounded-full p-2">
                <TicketIcon size={16} />
              </div>
              <div className="flex flex-col">
                <p className="text-sm font-bold">{voucher.code}</p>
                <p className="text-xs text-gray-500">{voucher.discount}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">{t("cart.no_vouchers")}</p>
      )}
      {error && <p className="text-red-500">{error.message}</p>}
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={t("cart.enter_voucher_code")}
          className="border border-gray-300 rounded-md px-2 py-1 flex-1 grow"
        />
        <button
          onClick={() => addVoucher(code)}
          disabled={isMutating}
          className="bg-blue-500 text-white rounded-md px-2 py-1"
        >
          {isMutating ? t("cart.adding") : t("cart.add")}
        </button>
      </div>
    </div>
  );
};

const CartDialog = ({ onClose, open }: CartDialogProps) => {
  const { data: cart, isLoading } = useCart();
  const [shippingOpen, setShippingOpen] = useState(false);
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
            <ul className="flex-1">
              {items.map((item) => (
                <CartItemElement
                  key={item.id + item.sku}
                  item={item}
                  open={open}
                />
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
            <button
              className="underline text-blue-600 hover:text-blue-800 mt-2 text-sm"
              onClick={() => setShippingOpen(!shippingOpen)}
            >
              {shippingOpen ? t("cart.hide_shipping") : t("cart.show_shipping")}
            </button>
            {cart != null && shippingOpen && (
              <ShippingProvider>
                <ShippingInputs />
                <ShippingOptionList />
              </ShippingProvider>
            )}
            <Vouchers added={cart?.vouchers ?? []} />
            <div className="mt-6 w-full flex gap-2 items-center">
              {cart?.paymentStatus === "checkout_completed" ? (
                <ButtonAnchor
                  onClick={onClose}
                  to={`/confirmation/${cart.orderReference}`}
                >
                  {t("cart.show_confirmation")}
                </ButtonAnchor>
              ) : (
                <>
                  <ButtonAnchor onClick={onClose} to={"/checkout"}>
                    {t("menu.checkout")}
                  </ButtonAnchor>
                </>
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
  const [shouldOpen, setShouldOpen] = useState(false);
  const totalItems = useMemo(
    () =>
      isLoading
        ? "~"
        : (cart?.items?.reduce((acc, item) => acc + (item.qty ?? 1), 0) ?? 0),
    [cart, isLoading],
  );

  useEffect(() => {
    if (ref.current) {
      if (shouldOpen) {
        setIsCartOpen(true);
      }
      setShouldOpen(true);
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

  if (cart?.items == null || cart.items.length === 0) {
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
        <CartDialog onClose={() => setIsCartOpen(false)} open={isCartOpen} />
      </Sidebar>
    </>
  );
};
