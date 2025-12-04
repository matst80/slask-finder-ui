import { useEffect, useRef, useState } from 'react'
import { useSetPaymentResult } from '../hooks/checkoutHooks'
import { CheckoutPayment } from '../lib/datalayer/checkout-api'
import '@adyen/adyen-web/styles/adyen.css'
import { Card, Core, CoreConfiguration, Klarna, Swish } from '@adyen/adyen-web'
import { adyenConfig, paymentMethodsConfiguration } from '../lib/adyen-config'

type PaymentProviderUIProps = {
  payment: CheckoutPayment
}

export const KlarnaPaymentUI = ({ payment }: PaymentProviderUIProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { sessionData } = payment

  useEffect(() => {
    if (!containerRef.current || !sessionData) return

    const klarnaSession = sessionData as { html_snippet?: string }

    if (klarnaSession?.html_snippet) {
      const container = containerRef.current
      container.innerHTML = klarnaSession.html_snippet

      // Re-execute script tags (Klarna requirement)
      const scriptTags = container.getElementsByTagName('script')
      for (let i = 0; i < scriptTags.length; i++) {
        const parentNode = scriptTags[i].parentNode
        const newScriptTag = document.createElement('script')
        newScriptTag.type = 'text/javascript'
        newScriptTag.text = scriptTags[i].text
        parentNode?.removeChild(scriptTags[i])
        parentNode?.appendChild(newScriptTag)
      }
    }
  }, [sessionData])

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Klarna Payment</h3>
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

      <div ref={containerRef} id={`klarna-container-${payment.paymentId}`} />
    </div>
  )
}

export const AdyenPaymentUI = ({ payment }: PaymentProviderUIProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { sessionData } = payment
  const { trigger } = useSetPaymentResult(payment.paymentId)
  const [adyenCheckout, setAdyenCheckout] = useState<Core | null>(null)

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
  }, [sessionData, adyenCheckout, trigger])

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

export const PaymentProviderUI = ({ payment }: PaymentProviderUIProps) => {
  if (!payment.provider) {
    return (
      <div className="border rounded-lg p-4 bg-gray-50">
        <p className="text-sm text-gray-600">Unknown payment provider</p>
      </div>
    )
  }

  switch (payment.provider.toLowerCase()) {
    case 'klarna':
      return <KlarnaPaymentUI payment={payment} />
    case 'adyen':
      return <AdyenPaymentUI payment={payment} />
    default:
      return (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">{payment.provider} Payment</h3>
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
          <p className="text-sm text-gray-600">
            Payment ID: {payment.paymentId}
          </p>
        </div>
      )
  }
}
