import { Fragment, ReactNode } from 'react'
import { useQuery } from '../lib/hooks/useQuery'
import { Item } from '../lib/types'

export const HitList = <T extends { item: Item }>({
  children,
  className,
  ...props
}: {
  children: (props: T) => ReactNode
  className?: string
} & Omit<T, 'item'>) => {
  const { hits } = useQuery()
  return (
    <div className={className}>
      {hits.map((item) => {
        return (
          <Fragment key={item.id}>
            {children({ ...props, item } as unknown as T)}
          </Fragment>
        )
      })}
    </div>
  )
}

export const HitListFragment = <T extends { item: Item }>({
  children,
  ...props
}: {
  children: (props: T) => ReactNode
} & Omit<T, 'item'>) => {
  const { hits } = useQuery()
  return (
    <Fragment>
      {hits.map((item) => {
        return (
          <Fragment key={item.id}>
            {children({ ...props, item } as unknown as T)}
          </Fragment>
        )
      })}
    </Fragment>
  )
}
