import { Minus, Plus, ShoppingCartIcon, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { makeImageUrl } from "../utils";
import { useCart, useChangeQuantity } from "../hooks/cartHooks";
import { Button, ButtonLink } from "./ui/button";
import { Link } from "react-router-dom";

type CartDialogProps = {
  onClose: () => void;
};

const CartDialog = ({ onClose }: CartDialogProps) => {
  const { data: cart, isLoading } = useCart();
  const { trigger: changeQuantity } = useChangeQuantity();
  const items = cart?.items ?? [];
  const totalPrice = cart?.totalPrice ?? 0;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-screen overflow-y-auto animate-cart-open"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Your Cart</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        {items.length === 0 ? (
          <p className="text-gray-500 text-center">Your cart is empty</p>
        ) : (
          <>
            {isLoading ? (
              <div>Loading...</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {items.map((item) => (
                  <li
                    key={item.id + item.sku}
                    className="py-4 flex items-center"
                  >
                    {item.image ? (
                      <img
                        src={makeImageUrl(item.image)}
                        alt={item.name}
                        className="size-16 rounded-sm object-contain aspect-square mr-4"
                      />
                    ) : (
                      <div></div>
                    )}
                    <div className="flex-1">
                      <Link
                        to={`/product/${item.sku}`}
                        className="text-sm font-medium"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm text-gray-500">
                        {(item.price / 100).toFixed(2)} kr{" "}
                        {item.orgPrice > 0 && item.orgPrice > item.price && (
                          <span className="line-through text-gray-400">
                            {(item.orgPrice / 100).toFixed(2)} kr
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <button
                        onClick={() => {
                          changeQuantity({
                            id: item.id,
                            quantity: item.qty - 1,
                          });
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="mx-2 text-gray-700">{item.qty}</span>
                      <button
                        onClick={() => {
                          changeQuantity({
                            id: item.id,
                            quantity: item.qty + 1,
                          });
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 flex justify-between items-center">
              <span className="text-lg font-bold">Total:</span>
              <span className="text-lg font-bold">{totalPrice / 100} kr</span>
            </div>
            <div className="mt-6 w-full">
              {cart?.paymentStatus === "checkout_completed" ? (
                <ButtonLink
                  onClick={onClose}
                  to={`/confirmation/${cart.orderReference}`}
                >
                  Show confirmation
                </ButtonLink>
              ) : (
                <ButtonLink onClick={onClose} to={"/checkout"}>
                  Proceed to Checkout
                </ButtonLink>
              )}
            </div>
          </>
        )}
      </div>
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

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsCartOpen(true)}
        className="relative p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
      >
        <ShoppingCartIcon className="size-5" />

        <span
          ref={ref}
          className="absolute transition-all -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
        >
          {totalItems}
        </span>
      </Button>
      {isCartOpen && <CartDialog onClose={() => setIsCartOpen(false)} />}
    </>
  );
};
