import { useState } from 'react'
import { useRemoveDelivery, useSetPickupPoint } from '../hooks/checkoutHooks'
import { CheckoutDelivery } from '../lib/datalayer/checkout-api'
import { PickupPoint } from '../lib/types'

type DeliveryEditorProps = {
  deliveries: CheckoutDelivery[]
}

export const DeliveryEditor = ({ deliveries }: DeliveryEditorProps) => {
  const { trigger: removeDelivery, isMutating: isRemoving } =
    useRemoveDelivery()
  const { trigger: setPickupPoint, isMutating: isSettingPickup } =
    useSetPickupPoint()
  const [editingDeliveryId, setEditingDeliveryId] = useState<number | null>(
    null,
  )
  const [pickupPointData, setPickupPointData] = useState<Partial<PickupPoint>>(
    {},
  )

  const handleRemove = async (deliveryId: number) => {
    if (confirm('Remove this delivery option?')) {
      await removeDelivery(deliveryId)
    }
  }

  const handleSavePickupPoint = async (deliveryId: number) => {
    if (pickupPointData.id && pickupPointData.name) {
      await setPickupPoint({
        deliveryId,
        pickupPoint: pickupPointData as PickupPoint,
      })
      setEditingDeliveryId(null)
      setPickupPointData({})
    }
  }

  if (!deliveries?.length) {
    return (
      <div className="text-gray-500 text-sm">No deliveries configured yet.</div>
    )
  }

  return (
    <div className="space-y-3">
      {deliveries.map((delivery) => (
        <div
          key={delivery.id}
          className="border rounded-lg p-4 bg-white shadow-sm"
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="font-semibold text-base">{delivery.provider}</div>
              <div className="text-sm text-gray-600">
                Price: {delivery.price.incVat} kr (inc VAT)
              </div>
              <div className="text-sm text-gray-500">
                Items: {delivery.items.length}
              </div>
            </div>
            <button
              onClick={() => handleRemove(delivery.id)}
              disabled={isRemoving}
              className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
            >
              Remove
            </button>
          </div>

          {delivery.pickupPoint && (
            <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
              <div className="font-medium">Pickup Point:</div>
              <div>{delivery.pickupPoint.name}</div>
              {delivery.pickupPoint.address && (
                <div className="text-gray-600">
                  {delivery.pickupPoint.address}, {delivery.pickupPoint.zip}{' '}
                  {delivery.pickupPoint.city}
                </div>
              )}
            </div>
          )}

          {editingDeliveryId === delivery.id ? (
            <div className="mt-3 space-y-2 border-t pt-3">
              <input
                type="text"
                placeholder="Pickup Point ID"
                value={pickupPointData.id || ''}
                onChange={(e) =>
                  setPickupPointData({ ...pickupPointData, id: e.target.value })
                }
                className="w-full px-2 py-1 border rounded text-sm"
              />
              <input
                type="text"
                placeholder="Name"
                value={pickupPointData.name || ''}
                onChange={(e) =>
                  setPickupPointData({
                    ...pickupPointData,
                    name: e.target.value,
                  })
                }
                className="w-full px-2 py-1 border rounded text-sm"
              />
              <input
                type="text"
                placeholder="Address"
                value={pickupPointData.address || ''}
                onChange={(e) =>
                  setPickupPointData({
                    ...pickupPointData,
                    address: e.target.value,
                  })
                }
                className="w-full px-2 py-1 border rounded text-sm"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="ZIP"
                  value={pickupPointData.zip || ''}
                  onChange={(e) =>
                    setPickupPointData({
                      ...pickupPointData,
                      zip: e.target.value,
                    })
                  }
                  className="flex-1 px-2 py-1 border rounded text-sm"
                />
                <input
                  type="text"
                  placeholder="City"
                  value={pickupPointData.city || ''}
                  onChange={(e) =>
                    setPickupPointData({
                      ...pickupPointData,
                      city: e.target.value,
                    })
                  }
                  className="flex-1 px-2 py-1 border rounded text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSavePickupPoint(delivery.id)}
                  disabled={
                    isSettingPickup ||
                    !pickupPointData.id ||
                    !pickupPointData.name
                  }
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingDeliveryId(null)
                    setPickupPointData({})
                  }}
                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setEditingDeliveryId(delivery.id)}
              className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {delivery.pickupPoint ? 'Edit Pickup Point' : 'Set Pickup Point'}
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
