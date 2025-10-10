import { useEffect, useRef } from 'react'
import { getCheckout } from '../lib/datalayer/cart-api'
import { useCart } from '../hooks/cartHooks'
import { trackEnterCheckout } from '../lib/datalayer/beacons'

export const Checkout = () => {
  const ref = useRef<HTMLDivElement>(null)
  const { data: cart } = useCart()
  useEffect(() => {
    if (!cart?.items) return
    trackEnterCheckout({
      items: cart.items.map((item, index) => ({
        item_id: Number(item.id),
        item_name: item.name,
        item_brand: item.brand,
        item_category: item.category,
        item_category2: item.category2,
        item_category3: item.category3,
        item_category4: item.category4,
        item_category5: item.category5,
        index,
        price: item.price,
        quantity: item.qty,
        discount:
          item.orgPrice && item.orgPrice > item.price
            ? item.orgPrice - item.price
            : undefined,
      })),
    })
  }, [cart])
  useEffect(() => {
    if (!ref.current) return
    getCheckout().then((data) => {
      console.log(data)
      const { html_snippet } = data
      ref.current!.innerHTML = html_snippet
      const scriptsTags = ref.current!.getElementsByTagName('script')
      // This is necessary otherwise the scripts tags are not going to be evaluated
      for (let i = 0; i < scriptsTags.length; i++) {
        const parentNode = scriptsTags[i].parentNode
        const newScriptTag = document.createElement('script')
        newScriptTag.type = 'text/javascript'
        newScriptTag.text = scriptsTags[i].text
        parentNode?.removeChild(scriptsTags[i])
        parentNode?.appendChild(newScriptTag)
      }
    })
  }, [])
  return <div ref={ref} id="checkout-container"></div>
}
