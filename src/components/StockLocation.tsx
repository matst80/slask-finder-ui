import { Fragment, useState } from 'react'
import { useAddToCart } from '../hooks/cartHooks'
import { useFavouriteStore } from '../hooks/useFavouriteStore'
import { useTranslations } from '../lib/hooks/useTranslations'
import { BaseEcomEvent, Store } from '../lib/types'
import { StoreWithStock } from './ItemDetails'
import { ReservationSummary } from './ReservationSummary'
import { Button } from './ui/button'

const weekdayDateMap = {
  Mon: new Date('2020-01-06T00:00:00.000Z'),
  Tue: new Date('2020-01-07T00:00:00.000Z'),
  Wed: new Date('2020-01-08T00:00:00.000Z'),
  Thu: new Date('2020-01-09T00:00:00.000Z'),
  Fri: new Date('2020-01-10T00:00:00.000Z'),
  Sat: new Date('2020-01-11T00:00:00.000Z'),
  Sun: new Date('2020-01-12T00:00:00.000Z'),
}
const shortWeekdays = Object.keys(
  weekdayDateMap,
) as (keyof typeof weekdayDateMap)[]

const getDayOfWeek = (
  shortName: keyof typeof weekdayDateMap,
  locale = 'en-US',
  length: 'short' | 'long' | 'narrow',
) =>
  new Intl.DateTimeFormat(locale, { weekday: length }).format(
    weekdayDateMap[shortName],
  )

const getDaysOfWeek = (
  locale = 'en-US',
  length: 'short' | 'long' | 'narrow' = 'short',
) => shortWeekdays.map((shortName) => getDayOfWeek(shortName, locale, length))

const toTime = ([hour, minute]: [number, number, number]) => {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
}

const OpenHours = ({ openHours }: Pick<Store, 'openHours'>) => {
  const dayIdx = new Date().getDay() // 0=Sun, 1=Mon, ..., 6=Sat
  const today = openHours.days[dayIdx]
  if (!today)
    return <div className="mt-1 text-sm text-gray-600">Closed today</div>
  const currentHour = new Date().getHours()
  const [opens, closes] = today
  const isOpen = currentHour >= opens[0] && currentHour < closes[0]
  if (isOpen) {
    return (
      <div className="mt-1 text-sm text-green-600 font-medium">
        Open now - closes at {toTime(closes)}
      </div>
    )
  }
  if (currentHour < opens[0]) {
    return (
      <div className="mt-1 text-sm text-gray-600">
        Closed now - opens at {toTime(opens)}
      </div>
    )
  }
  if (currentHour >= closes[0]) {
    const nextDayIdx = (dayIdx + 1) % 7
    const nextDay = openHours.days[nextDayIdx]
    if (nextDay) {
      return (
        <div className="mt-1 text-sm text-gray-600">
          Opens tomorrow at {toTime(nextDay[0])}
        </div>
      )
    }
    return <div className="mt-1 text-sm text-gray-600">Closed now</div>
  }
  return (
    <span>
      {toTime(opens)} - {toTime(closes)}
    </span>
  )
}

const WeekHours = ({ openHours }: Pick<Store, 'openHours'>) => {
  const nameNames = getDaysOfWeek('sv-SE', 'long')
  return (
    <div className="grid grid-cols-2 gap-1 border-t mt-2 pt-2 text-sm text-gray-600">
      {openHours.days.map((hours, idx) => (
        <Fragment key={idx}>
          <span className="capitalize">{nameNames[idx]}</span>
          <span className="text-right">
            {!hours ? (
              <>Closed</>
            ) : (
              <>
                {toTime(hours[0])} - {toTime(hours[1])}
              </>
            )}
          </span>
        </Fragment>
      ))}
    </div>
  )
}

export const StockLocation = ({
  stock,
  distance,
  sku,
  trackingItem,
  ...store
}: StoreWithStock & { sku: string; trackingItem: BaseEcomEvent }) => {
  const { trigger: addToCart, isMutating } = useAddToCart()
  const t = useTranslations()
  const [favouriteStore, setFavouriteStore] = useFavouriteStore()
  const [open, setOpen] = useState(favouriteStore === store.id)

  return (
    <li
      key={store.id}
      className="hover:bg-gray-50 transition-colors cursor-pointer"
    >
      <div
        className="flex items-center py-2 px-3 gap-2"
        onClick={() => {
          setFavouriteStore(store.id)
          setOpen(!open)
        }}
      >
        <span className="font-medium line-clamp-1 text-ellipsis flex-1">
          {store.displayName}
        </span>

        {stock != '0' && (
          <span className="text-green-600 font-medium flex-shrink-0">
            {t('stock.nr', { stock })}
          </span>
        )}
        {distance != null && (
          <span className="text-gray-500 text-sm flex-shrink-0">
            {t('stock.distance', { distance: distance.toFixed(0) })}
          </span>
        )}
      </div>
      {open && (
        <div className="px-3 py-2 text-sm text-gray-600">
          <div className="font-bold">
            <ReservationSummary
              sku={sku}
              locationId={store.id}
              stock={Number(stock)}
            />
          </div>
          <div className="flex gap-1">
            <p className="flex-1">
              {store.address.street}, {store.address.zip} {store.address.city}
            </p>

            {(Number(stock) > 0 || store.shipToStore) && (
              <Button
                size="sm"
                onClick={() =>
                  addToCart(
                    { sku: sku, storeId: store.id, quantity: 1 },
                    trackingItem,
                  )
                }
              >
                {isMutating ? 'Reserving...' : 'Reserve'}
              </Button>
            )}
          </div>

          <OpenHours openHours={store.openHours} />
          <WeekHours openHours={store.openHours} />
        </div>
      )}
    </li>
  )
}
