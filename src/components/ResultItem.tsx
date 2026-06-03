import { GitCompareArrows, X } from 'lucide-react'
import { memo, PropsWithChildren, useMemo, useState } from 'react'
import { Link, useViewTransitionState } from 'react-router-dom'
import { useCompareContext } from '../lib/hooks/CompareProvider'
import { useTranslations } from '../lib/hooks/useTranslations'
import { Item, StockData } from '../lib/types'
import { useProductData } from '../lib/utils'
import { makeImageUrl } from '../utils'
import { PriceElement } from './Price'
import { Stars } from './Stars'
import { TimeAgo } from './TimeAgo'

const hasStock = (value?: string | null) => {
  return value != null && value != '0'
}

export const StockBalloon = ({ stock }: StockData) => {
  const hasStoreStock = Object.entries(stock ?? {}).length > 0
  const hasOnlineStock = hasStock(stock?.['se'] ?? stock?.['no'])
  return (
    <div
      className={`size-2 rounded-full aspect-square ${
        hasStoreStock || hasOnlineStock ? 'bg-green-500' : 'bg-amber-500'
      }`}
    />
  )
}

export const StockIndicator = ({
  stock,
  showOnlyInStock = false,
}: StockData & { showOnlyInStock?: boolean }) => {
  const t = useTranslations()
  const stockLevel = stock?.['se'] ?? stock?.['no']
  const locationId = (
    globalThis.window as Window & { selectedStoreId?: string }
  ).selectedStoreId
  const stockOnLocation = locationId != null ? stock?.[locationId] : null
  const storesWithStock = Object.entries(stock ?? {}).length
  const hasStoreStock =
    stockOnLocation != null ? hasStock(stockOnLocation) : storesWithStock > 0
  const hasOnlineStock = hasStock(stockLevel)

  if (showOnlyInStock && !hasOnlineStock && !hasStoreStock) {
    return null
  }

  return (
    <>
      {locationId != null ? (
        <span
          className={`inline-flex items-center line-clamp-1 text-ellipsis  gap-1.5 text-sm font-medium ${
            hasStoreStock ? 'text-green-600' : 'text-amber-600'
          }`}
        >
          <span
            className={`size-2 rounded-full ${
              stockOnLocation != null ? 'bg-green-500' : 'bg-amber-500'
            }`}
          />
          {stockOnLocation != null
            ? t('stock.in_your_store', { stock: stockOnLocation })
            : t('stock.out_of_stock_in_store')}
        </span>
      ) : (
        (!showOnlyInStock || hasStoreStock) && (
          <span
            className={`inline-flex line-clamp-1 text-ellipsis items-center gap-1.5 text-sm font-medium relative ${
              hasStoreStock ? 'text-green-600' : 'text-amber-600'
            }`}
          >
            <span
              className={`size-2 rounded-full ${
                hasStoreStock ? 'bg-green-500' : 'bg-amber-500'
              }`}
            />
            {t('stock.stores_with_stock', { count: storesWithStock })}
          </span>
        )
      )}

      {showOnlyInStock && !hasOnlineStock ? null : (
        <span
          className={`inline-flex items-center gap-1.5 text-sm font-medium ${
            hasOnlineStock ? 'text-green-600' : 'text-amber-600'
          }`}
        >
          <span
            className={`size-2 rounded-full ${
              hasOnlineStock ? 'bg-green-500' : 'bg-amber-500'
            }`}
          />
          {hasOnlineStock
            ? t('stock.online_stock', { stock: stockLevel })
            : t('stock.not_in_stock')}
        </span>
      )}
    </>
  )
}

// const UpdatedBanner = ({ lastUpdate }: Pick<Item, "lastUpdate">) => {
//   const recentlyUpdated = useMemo(
//     () => (lastUpdate ?? 0) > Date.now() - 1000 * 60 * 60,
//     [lastUpdate]
//   );
//   return recentlyUpdated ? (
//     <div className="flex items-center rounded-bl-md p-1 bg-yellow-300 text-xs gap-2 absolute top-0 right-0">
//       <Zap size={18} />
//       <TimeAgo ts={lastUpdate} />
//     </div>
//   ) : null;
// };

const ImageWithPlaceHolder = ({
  img,
  isTransitioning,
  title,
}: Pick<Item, 'img' | 'title'> & { isTransitioning: boolean }) => {
  const [loaded, setLoaded] = useState(false)
  if (img == null) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <span className="text-gray-400 text-sm">{title}</span>
      </div>
    )
  }
  return (
    <div className="relative w-full h-48">
      {img != null && (
        <img
          className={`w-full h-full transition-all group-hover:scale-110 duration-300 object-contain mix-blend-multiply ${
            loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
          src={makeImageUrl(img)}
          alt={title}
          style={{
            viewTransitionName: isTransitioning ? 'product-image' : 'none',
          }}
          onLoad={() => setLoaded(true)}
        />
      )}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="size-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}

export const CompareButton = ({
  item,
  className = 'text-gray-600 hover:text-blue-500 hover:bg-gray-100 p-1 rounded-sm text-shadow transition-all',
}: {
  item: Item
  className?: string
}) => {
  const { id } = item
  const { setItems, items } = useCompareContext()
  const selected = useMemo(() => items.some((i) => i.id === id), [items, id])
  return (
    <button
      className={className}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        setItems((prev) => {
          const newItems = [...prev]
          const index = newItems.findIndex((item) => item.id === id)
          if (index !== -1) {
            newItems.splice(index, 1)
          } else {
            newItems.push(item)
          }
          return newItems
        })
      }}
    >
      {selected ? (
        <X className="size-5" />
      ) : (
        <GitCompareArrows className="size-5" />
      )}
    </button>
  )
}

export const ResultItemInner = ({
  transitionUrl,
  hideCompare = false,
  ...item
}: PropsWithChildren<Item> & {
  transitionUrl?: string
  hideCompare?: boolean
}) => {
  const {
    title,
    img,
    badgeUrl,
    values,
    stock,
    id,
    children,
    bp,
    lastUpdate,
    disclaimer,
    advertisingText,
  } = item
  const { price, rating, grade, isOwn, isOutlet, soldBy } =
    useProductData(values)

  const isTransitioning = useViewTransitionState(
    transitionUrl ?? `/product/${id}`,
  )

  return (
    <>
      <div className="relative pt-4 px-4">
        <ImageWithPlaceHolder
          img={img}
          title={title}
          isTransitioning={isTransitioning}
        />

        {badgeUrl != null && (
          <img
            src={makeImageUrl(badgeUrl)}
            alt={title}
            className="size-16 object-contain absolute top-4 right-4 drop-shadow-lg"
          />
        )}
        {isOutlet && (
          <img
            className="size-16 object-contain absolute top-4 left-4 drop-shadow-lg"
            src="https://www.elgiganten.se/content/SE/outlet/outlet.svg"
            alt="Outlet"
          />
        )}
      </div>
      <div className="p-4 space-y-1">
        <h2
          className="text-lg font-semibold leading-tight text-gray-900 hover:text-blue-600 transition-colors"
          style={{
            viewTransitionName: isTransitioning ? 'product-name' : 'none',
          }}
        >
          {title}
        </h2>

        <div className="flex flex-wrap justify-between gap-2">
          {rating != null && <Stars {...rating} />}
          {lastUpdate != null && lastUpdate > 0 && (
            <span className="text-sm inline-block align-top bg-gray-100 rounded-bl-none after:absolute after:left-0 after:box-content after:border-transparent forced-colors:border forced-colors:after:hidden after:border-l-gray-100 rounded-border px-2 py-0.5 after:-bottom-[7px] after:border-[7px] absolute left-0 top-0 z-1">
              <TimeAgo ts={lastUpdate} />
            </span>
          )}
        </div>

        {bp && (
          <ul className="text-sm text-gray-600 space-y-1">
            {bp
              .split('\n')
              .filter((d: string) => d?.length)
              .map((bp: string, idx: number) => (
                <li key={`${bp}-${idx}`} className="line-clamp-1 text-ellipsis">
                  {bp}
                </li>
              ))}
          </ul>
        )}

        {price != null && (
          <div className="pt-2 place-self-start">
            <PriceElement size="large" price={price} disclaimer={disclaimer} />
            {advertisingText != null && (
              <em className="block text-xs text-gray-500 italic">
                {advertisingText}
              </em>
            )}
          </div>
        )}

        {children}

        {isOutlet && grade != null && (
          <em className="block text-xs text-gray-500 italic">{grade}</em>
        )}
        {soldBy != null && !isOwn && (
          <em className="block text-xs text-gray-500 italic">
            Säljs av: {soldBy}
          </em>
        )}
      </div>
      {!hideCompare && (
        <CompareButton
          item={item}
          className="absolute top-3 right-3 text-blue-400 hover:bg-gray-100 p-1 rounded-sm text-shadow transition-all"
        />
      )}

      <div className="mb-0 mt-auto px-4 pb-3 flex gap-1 justify-between">
        <StockIndicator stock={stock} showOnlyInStock />
      </div>
    </>
  )
}

const Value = ({ value }: { value: unknown }) => {
  if (value === null) return <span className="text-gray-400 italic">null</span>
  if (value === undefined)
    return <span className="text-gray-400 italic">undefined</span>
  if (Array.isArray(value)) {
    return (
      <div className="flex flex-col gap-1 pl-2 border-l border-gray-100">
        {value.map((v, i) => (
          <div key={i} className="border-b border-gray-50 last:border-0 pb-1">
            <span className="text-gray-400 mr-1">[{i}]:</span>
            <Value value={v} />
          </div>
        ))}
      </div>
    )
  }
  if (typeof value === 'object') {
    return (
      <div className="flex flex-col gap-1">
        {Object.entries(value ?? {}).map(([key, val]) => (
          <DataProperty key={key} title={key} value={val} />
        ))}
      </div>
    )
  }
  if (typeof value === 'boolean') {
    return (
      <span
        className={
          value ? 'text-green-600 font-bold' : 'text-red-600 font-bold'
        }
      >
        {String(value)}
      </span>
    )
  }
  if (typeof value === 'number') {
    return <span className="text-blue-600 font-medium">{value}</span>
  }
  return <span className="text-gray-900 break-all">{String(value)}</span>
}

const DataProperty = ({ title, value }: { title: string; value: unknown }) => {
  if (value === undefined) {
    return null
  }

  const isObj = typeof value === 'object' && value !== null
  return (
    <details
      className="text-xs font-mono border-l border-gray-100 pl-2 my-0.5"
      open={!isObj}
    >
      <summary className="cursor-pointer hover:text-indigo-600 font-bold select-none py-0.5 text-gray-700 list-none flex items-center gap-1">
        <span className="text-gray-400 text-[10px]">{isObj ? '▶' : '•'}</span>
        <span>{title}</span>
      </summary>
      <div className="pl-3 py-0.5 text-gray-600">
        <Value value={value} />
      </div>
    </details>
  )
}

export const DataViewItem = ({ item }: { item: Item }) => {
  return <Value value={item} />
}

export const PlaceholderItem = () => {
  return (
    <div className="bg-white md:shadow-xs border-b border-gray-200 md:border-b-0 p-4 space-y-4 animate-pulse flex flex-col min-w-64 min-h-[250px]">
      <div className="h-6 bg-gray-100 rounded-md w-3/4" />
      <div className="h-4 bg-gray-100 rounded-md w-1/2" />
      <div className="space-y-2 py-2">
        <div className="h-3 bg-gray-100 rounded-md w-5/6" />
        <div className="h-3 bg-gray-100 rounded-md w-2/3" />
      </div>
    </div>
  )
}

export const ResultItem = memo(
  ({ item }: { item: Item; position?: number }) => {
    const imageUrl = item.img || item.image
    const itemTitle = item.title || item.name

    return (
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs hover:shadow-md transition-all font-mono text-xs overflow-auto max-h-96 flex flex-col justify-between h-full">
        <div>
          <div className="flex justify-between items-start gap-2 mb-2 pb-2 border-b border-gray-100">
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-indigo-600">ID: {item.id}</span>
              {itemTitle && (
                <span
                  className="font-semibold text-gray-800 text-sm truncate max-w-[180px]"
                  title={String(itemTitle)}
                >
                  {String(itemTitle)}
                </span>
              )}
            </div>
            <Link
              to={`/edit/products`}
              onClick={() => {
                sessionStorage.setItem('admin_search_id', String(item.id))
              }}
              className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold px-2 py-1 rounded transition-colors shrink-0"
            >
              Edit
            </Link>
          </div>
          {imageUrl && (
            <div className="w-full h-32 flex items-center justify-center bg-gray-50 rounded mb-3 overflow-hidden border border-gray-100 shrink-0">
              <img
                src={makeImageUrl(imageUrl)}
                alt={String(itemTitle || 'Product preview')}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          )}
          <div className="space-y-2">
            <DataViewItem item={item} />
          </div>
        </div>
      </div>
    )
  },
)
