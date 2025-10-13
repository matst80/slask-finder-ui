import { BaseEcomEvent, Item } from '../lib/types'

export const toEcomTrackingEvent = (
  item: Item,
  index: number,
): BaseEcomEvent => ({
  item_id: String(item.id),
  index,
  item_name: item.title,
  item_category: item.values?.[10],
  item_category2: item.values?.[11],
  item_category3: item.values?.[12],
  item_category4: item.values?.[13],
  //item_category5: item.values?.[14],
  item_brand: item.values?.['2'],
  price: item.values?.['4'],
  //stock: item.stockLevel!=null,
  //img: item.img,
})
