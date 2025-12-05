import { Check } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { CheckoutPayment } from '../lib/datalayer/checkout-api'
import { CancelPaymentButton } from './CancelPaymentButton'
import { PriceValue } from './Price'

type KlarnaPaymentProviderUIProps = {
  payment: CheckoutPayment
}

export const KlarnaPaymentUI = ({ payment }: KlarnaPaymentProviderUIProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { sessionData } = payment

  useEffect(() => {
    if (!containerRef.current || !sessionData) return

    const klarnaSession = sessionData as { html_snippet?: string }
    console.log('Klarna session data:', klarnaSession)
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

  if (payment.status === 'success' && payment.completedAt) {
    return (
      <div className="border rounded-lg p-4 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Klarna Payment</h3>
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

      {payment.status === 'pending' && (
        <CancelPaymentButton paymentId={payment.paymentId} />
      )}
    </div>
  )
}
