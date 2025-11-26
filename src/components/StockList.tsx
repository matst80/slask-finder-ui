import { MapPin } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useStores } from '../lib/datalayer/stores'
import { useTranslations } from '../lib/hooks/useTranslations'
import { BaseEcomEvent, StockData } from '../lib/types'
import { isDefined } from '../utils'
import { StoreWithStock } from './ItemDetails'
import { calculateDistance } from './map-utils'
import { ReservationSummary } from './ReservationSummary'
import { StockLocation } from './StockLocation'
import { useGeoLocation } from './useGeoLocation'

export const StockList = ({
  stock,
  trackingItem,
  sku,
}: StockData & { sku: string; trackingItem: BaseEcomEvent }) => {
  const { location, getBrowserLocation, getCoarseLocation } = useGeoLocation()
  const t = useTranslations()
  const [zip, setZip] = useState('')
  const { data: stores } = useStores()
  const storesWithStock = useMemo<StoreWithStock[]>(() => {
    return (
      stores
        ?.map((store) => {
          const value = stock?.[store.id]
          if (!value && !store.shipToStore) return null
          return {
            ...store,
            stock: value ?? '',
            distance:
              location != null
                ? calculateDistance(location, store.address.location)
                : undefined,
          }
        })
        .filter(isDefined)
        .sort((a, b) =>
          location != null
            ? a.distance! - b.distance!
            : a.displayName.localeCompare(b.displayName),
        ) ?? []
    )
  }, [stock, location, stores])
  useEffect(() => {
    if (zip.length >= 4) {
      getCoarseLocation(zip).catch(() => {
        console.log('unable to get a location')
      })
    }
  }, [zip, getCoarseLocation])
  const stockLevel = stock?.['se'] ?? stock?.['no']
  if (stock == null) return null
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden flex flex-col flex-1 thin-scrollbar">
      <div className="p-4 cursor-pointer hover:bg-gray-50 transition-colors">
        <h3 className="text-lg font-semibold">{t('stock.level')}</h3>
        {stockLevel != null && stockLevel !== '0' && (
          <p className="text-gray-600 mt-1">
            {t('stock.in_stock_online', { stockLevel: '' })}
            <ReservationSummary sku={sku} stock={Number(stockLevel)} />
          </p>
        )}
      </div>
      <div className="flex gap-2 bg-gray-200 p-2 items-center">
        <input
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          placeholder="Zip code"
          className="bg-white rounded-md px-2 py-1 flex-1"
        />
        <button onClick={() => getBrowserLocation()}>
          <MapPin className="text-gray-500" />
        </button>
      </div>
      <div className="overflow-y-auto flex-1 max-h-80">
        <ul className="border-t border-gray-200 divide-y divide-gray-200">
          {storesWithStock.map((s) => (
            <StockLocation
              key={s.id}
              {...s}
              trackingItem={trackingItem}
              sku={sku}
            />
          ))}
        </ul>
      </div>
    </div>
  )
}
