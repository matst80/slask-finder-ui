import { Edit } from 'lucide-react'
import { Activity, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { DeliveryEditor } from '../components/DeliveryEditor'
import { PaymentProviderUI } from '../components/PaymentProviderUI'
import { PriceValue } from '../components/Price'
import { Button } from '../components/ui/button'
import {
  useCart,
  useChangeQuantity,
  useRemoveItemMarking,
  useSetItemMarking,
} from '../hooks/cartHooks'
import {
  useCheckout,
  useInitiatePayment,
  useStartCheckout,
} from '../hooks/checkoutHooks'
import { CartItem } from '../lib/types'
import { makeImageUrl } from '../utils'
import { QuantityInput } from './builder/QuantityInput'
import { JsonView } from './tracking/JsonView'

const CartItemElement = ({ item }: { item: CartItem }) => {
  const { trigger: changeQuantity } = useChangeQuantity()
  const { trigger: setMarking, isMutating: isSettingMarking } =
    useSetItemMarking()
  const { trigger: removeMarking, isMutating: isRemovingMarking } =
    useRemoveItemMarking()
  const [markingText, setMarkingText] = useState(item.marking?.text || '')
  const [showMarking, setShowMarking] = useState(false)

  const trackingItem = (value?: number) => ({
    item_id: item.itemId,
    index: item.id,
    item_name: item.meta.name,
    price: item.price.incVat,
    quantity: value ?? item.qty,
    item_brand: item.meta.brand,
    item_category: item.meta.category,
    item_category2: item.meta.category2,
    item_category3: item.meta.category3,
    item_category4: item.meta.category4,
    item_category5: item.meta.category5,
  })

  return (
    <li className="py-3 flex flex-col border-b border-gray-200">
      <div className="flex items-start gap-3">
        {item.meta.image && (
          <img
            src={makeImageUrl(item.meta.image)}
            alt={item.meta.name}
            className="size-16 rounded-sm object-contain aspect-square"
          />
        )}
        <div className="flex flex-col grow flex-1">
          <Link
            to={`/product/${item.itemId}`}
            className="text-sm font-medium hover:text-blue-600"
          >
            {item.meta.name}
          </Link>
          <span className="text-xs text-gray-500">
            {item.meta.brand} {item.meta.category && `- ${item.meta.category}`}
          </span>
          {item.marking && (
            <span className="text-xs px-1 py-0.5 bg-blue-100 text-blue-800 rounded mt-1 inline-block self-start">
              Marking: {item.marking.text}
            </span>
          )}
        </div>
      </div>
      <div className="flex justify-end items-center gap-3 pt-2">
        <div className="text-sm font-medium">
          <PriceValue value={item.totalPrice?.incVat ?? item.price.incVat} /> kr
        </div>
        <QuantityInput
          value={item.qty}
          onChange={(value) =>
            changeQuantity(item.id, value, trackingItem(value))
          }
          minQuantity={0}
          maxQuantity={Math.min(99, item.stock)}
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowMarking(!showMarking)}
          className="p-1"
        >
          <Edit size={16} />
        </Button>
      </div>
      {showMarking && (
        <div className="flex items-center gap-2 pt-2">
          <input
            type="text"
            value={markingText}
            onChange={(e) => setMarkingText(e.target.value)}
            placeholder="Add marking"
            className="border border-gray-300 rounded px-2 py-1 text-xs flex-1"
          />
          <Button
            size="sm"
            disabled={isSettingMarking || !markingText.trim()}
            onClick={() => {
              setMarking({
                itemId: item.id,
                marking: { type: 1, marking: markingText.trim() },
              })
            }}
          >
            Set
          </Button>
          {item.marking && (
            <Button
              size="sm"
              variant="outline"
              disabled={isRemovingMarking}
              onClick={() => {
                removeMarking(item.id)
                setMarkingText('')
              }}
            >
              Remove
            </Button>
          )}
        </div>
      )}
    </li>
  )
}

export const KlarnaCheckout = () => {
  const ref = useRef<HTMLDivElement>(null)
  // const { data: cart } = useCart()
  // useEffect(() => {
  //   if (!cart?.items) return
  //   trackEnterCheckout({
  //     items: cart.items.map((item, index) => ({
  //       item_id: Number(item.id),
  //       item_name: item.meta.name,
  //       item_brand: item.meta.brand,
  //       item_category: item.meta.category,
  //       item_category2: item.meta.category2,
  //       item_category3: item.meta.category3,
  //       item_category4: item.meta.category4,
  //       item_category5: item.meta.category5,
  //       index,
  //       price: item.price.incVat,
  //       quantity: item.qty,
  //       discount:
  //         item.orgPrice && item.orgPrice.incVat > item.price.incVat
  //           ? item.orgPrice.incVat - item.price.incVat
  //           : undefined,
  //     })),
  //   })
  // }, [cart])
  // useEffect(() => {
  //   if (!ref.current) return
  //   getCheckout().then((data) => {
  //     console.log(data)
  //     const { html_snippet } = data
  //     ref.current!.innerHTML = html_snippet
  //     const scriptsTags = ref.current!.getElementsByTagName('script')
  //     // This is necessary otherwise the scripts tags are not going to be evaluated
  //     for (let i = 0; i < scriptsTags.length; i++) {
  //       const parentNode = scriptsTags[i].parentNode
  //       const newScriptTag = document.createElement('script')
  //       newScriptTag.type = 'text/javascript'
  //       newScriptTag.text = scriptsTags[i].text
  //       parentNode?.removeChild(scriptsTags[i])
  //       parentNode?.appendChild(newScriptTag)
  //     }
  //   })
  // }, [])
  return <div ref={ref} id="checkout-container"></div>
}

export const Checkout = () => {
  const { data: cart } = useCart()
  const { data: checkout, isLoading } = useCheckout()
  const { trigger: triggerStartCheckout, isMutating: isStarting } =
    useStartCheckout()
  const { trigger: triggerStartPayment } = useInitiatePayment()
  const [showDebug, setShowDebug] = useState(false)

  return (
    <div className="max-w-4xl mx-auto p-4">
      {isLoading && <div>Loading checkout...</div>}
      {checkout?.cartState == null && (
        <div className="mb-6">
          {cart?.items?.length ? (
            <>
              <h2 className="text-xl font-semibold mb-4">Your Cart</h2>
              <ul className="mb-4 border rounded-lg bg-white">
                {cart.items.map((item) => (
                  <CartItemElement key={`${item.id}-${item.sku}`} item={item} />
                ))}
              </ul>
              <div className="p-4 border rounded-lg bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Total Tax:</span>
                  <div className="text-right">
                    {Object.entries(cart.totalPrice.vat ?? {}).map(
                      ([key, value]) => (
                        <div key={key} className="text-sm">
                          <span>{key}%: </span>
                          <PriceValue value={value} /> kr
                        </div>
                      ),
                    )}
                  </div>
                </div>
                {cart.totalDiscount && cart.totalDiscount.incVat > 0 && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Total Discount:</span>
                    <PriceValue value={cart.totalDiscount.incVat} /> kr
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 border-t border-gray-300">
                  <span className="text-lg font-bold">Total:</span>
                  <span className="text-lg font-bold">
                    <PriceValue value={cart.totalPrice.incVat} /> kr
                  </span>
                </div>
              </div>
              <button
                className="mt-4 w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-60"
                disabled={isStarting}
                onClick={() => triggerStartCheckout(cart?.id)}
              >
                {isStarting ? 'Starting…' : 'Start Checkout'}
              </button>
            </>
          ) : (
            <div className="text-center p-8 border rounded-lg bg-gray-50">
              <p className="text-gray-700 mb-2">Your cart is empty.</p>
              <a href="/" className="text-blue-600 hover:underline font-medium">
                Go to start page
              </a>
            </div>
          )}
        </div>
      )}
      {checkout?.cartState && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Cart Preview</h2>
          <ul className="divide-y">
            {checkout.cartState.items.map((item) => (
              <li key={item.id} className="py-3 flex items-center gap-3">
                {item.meta?.image && (
                  <img
                    src={item.meta.image}
                    alt={item.meta.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <div className="font-medium">
                    {item.meta?.name || item.sku}
                  </div>
                  <div className="text-sm text-gray-600">Qty: {item.qty}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {item.totalPrice?.incVat ?? item.price.incVat} kr
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {checkout?.cartState && !checkout?.payments?.length && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Payment Method</h2>
          <div className="flex gap-3">
            <button
              onClick={() => triggerStartPayment('klarna')}
              disabled={checkout.paymentInProgress > 0}
              className="px-6 py-3 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Pay with Klarna
            </button>
            <button
              onClick={() => triggerStartPayment('adyen')}
              disabled={checkout.paymentInProgress > 0}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Pay with Adyen
            </button>
          </div>
          {checkout.paymentInProgress > 0 && (
            <div className="mt-2 text-sm text-orange-600">
              Payment in progress... Please complete the payment process.
            </div>
          )}
        </div>
      )}
      {checkout?.payments && checkout.payments.length > 0 && (
        <div className="mb-6 space-y-4">
          <h2 className="text-lg font-semibold mb-3">Active Payments</h2>
          {checkout.payments.map((payment) => (
            <PaymentProviderUI key={payment.paymentId} payment={payment} />
          ))}
        </div>
      )}
      {checkout?.deliveries && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Delivery Options</h2>
          <DeliveryEditor deliveries={checkout.deliveries} />
        </div>
      )}
      <div className="mt-6">
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="text-sm text-gray-600 hover:text-gray-800 underline"
        >
          {showDebug ? 'Hide' : 'Show'} Debug Data
        </button>
        <Activity mode={showDebug ? 'visible' : 'hidden'}>
          <div className="mt-2">
            <JsonView data={checkout} />
          </div>
        </Activity>
      </div>
    </div>
  )
}
