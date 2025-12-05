import { Card, Core, CoreConfiguration, Klarna, Swish } from '@adyen/adyen-web'
import { Check } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import {
  usePaymentStatusUpdater,
  useSetPaymentResult,
} from '../hooks/checkoutHooks'
import { adyenConfig, paymentMethodsConfiguration } from '../lib/adyen-config'
import { CheckoutPayment } from '../lib/datalayer/checkout-api'
import { PriceValue } from './Price'
import { Button } from './ui/button'

type AdyenPaymentProviderUIProps = {
  payment: CheckoutPayment
}

export const AdyenPaymentUI = ({ payment }: AdyenPaymentProviderUIProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { sessionData } = payment
  const { trigger } = useSetPaymentResult(payment.paymentId)
  const [adyenCheckout, setAdyenCheckout] = useState<Core | null>(null)
  const { wait, isWaiting, cancel } = usePaymentStatusUpdater(payment.paymentId)

  useEffect(() => {
    if (!containerRef.current || !sessionData || adyenCheckout) return

    const initAdyen = async () => {
      try {
        const AdyenModule = await import('@adyen/adyen-web')

        const checkout = await AdyenModule.AdyenCheckout({
          ...adyenConfig,
          session: sessionData as CoreConfiguration['session'],
          onPaymentCompleted: (response) => {
            if ('sessionResult' in response) {
              trigger(response).then((data) => {
                console.log(data)
              })
            }
            switch (response.resultCode) {
              case 'Authorised':
                // TODO: navigate to success route or emit event
                console.log('Authorised')
                break
              case 'Pending':
              case 'Received':
                console.log('Pending/Received')
                break
              default:
                console.log('Payment error', response)
                break
            }
            wait(60_000)
          },
          onError: (error) => {
            console.error('Adyen error:', error)
          },
        })

        setAdyenCheckout(checkout)

        // Create Drop-in component and mount with UI components as in MiniCart
        if (containerRef.current) {
          new AdyenModule.Dropin(checkout, {
            paymentMethodsConfiguration: paymentMethodsConfiguration,
            paymentMethodComponents: [Card, Klarna, Swish],
          }).mount(containerRef.current)
        }
      } catch (error) {
        console.error('Failed to initialize Adyen:', error)
      }
    }

    initAdyen()
  }, [sessionData, adyenCheckout, trigger, wait])

  if (payment.status === 'success' && payment.completedAt) {
    return (
      <div className="border rounded-lg p-4 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Adyen Payment</h3>
          <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800">
            {payment.status}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Check className="text-green-600" size={24} />
          <span>
            Paid <PriceValue value={payment.amount} /> {payment.currency}
          </span>
        </div>
      </div>
    )
  }

  if (isWaiting) {
    return (
      <div>
        Processing payment, please wait...
        <Button onClick={cancel}>Stop waiting...</Button>{' '}
      </div>
    )
  }

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Adyen Payment</h3>
        <span
          className={`text-xs px-2 py-1 rounded ${
            payment.status === 'success'
              ? 'bg-green-100 text-green-800'
              : payment.status === 'failed'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {payment.status}
        </span>
      </div>

      <div ref={containerRef} id={`adyen-container-${payment.paymentId}`} />
    </div>
  )
}
