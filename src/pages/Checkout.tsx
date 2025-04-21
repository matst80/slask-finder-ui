import { useEffect, useRef } from "react";
import { getCheckout } from "../lib/datalayer/cart-api";
import { useCart } from "../hooks/cartHooks";
import { trackEnterCheckout } from "../lib/datalayer/beacons";

export const Checkout = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { data: cart } = useCart();
  useEffect(() => {
    if (!cart?.items) return;
    trackEnterCheckout({
      items: cart.items.map((item) => ({
        item: Number(item.sku),
        quantity: item.qty,
      })),
    });
  }, [cart]);
  useEffect(() => {
    if (!ref.current) return;
    getCheckout().then((data) => {
      console.log(data);
      const { html_snippet } = data;
      ref.current!.innerHTML = html_snippet;
      const scriptsTags = ref.current!.getElementsByTagName("script");
      // This is necessary otherwise the scripts tags are not going to be evaluated
      for (let i = 0; i < scriptsTags.length; i++) {
        const parentNode = scriptsTags[i].parentNode;
        const newScriptTag = document.createElement("script");
        newScriptTag.type = "text/javascript";
        newScriptTag.text = scriptsTags[i].text;
        parentNode?.removeChild(scriptsTags[i]);
        parentNode?.appendChild(newScriptTag);
      }
    });
  }, []);
  return <div ref={ref} id="checkout-container"></div>;
  // <script>

  // 	fetch('/cart/checkout')
  // 		.then(response => response.json())
  // 		.then(function renderSnippet(data) {
  // 			console.log(data)
  // 			const { html_snippet } = data
  // 			var checkoutContainer = document.getElementById('checkout-container')
  // 			checkoutContainer.innerHTML = html_snippet
  // 			var scriptsTags = checkoutContainer.getElementsByTagName('script')
  // 			// This is necessary otherwise the scripts tags are not going to be evaluated
  // 			for (var i = 0; i < scriptsTags.length; i++) {
  // 				var parentNode = scriptsTags[i].parentNode
  // 				var newScriptTag = document.createElement('script')
  // 				newScriptTag.type = 'text/javascript'
  // 				newScriptTag.text = scriptsTags[i].text
  // 				parentNode.removeChild(scriptsTags[i])
  // 				parentNode.appendChild(newScriptTag)
  // 			}
  // 		})

  // </script>
};
