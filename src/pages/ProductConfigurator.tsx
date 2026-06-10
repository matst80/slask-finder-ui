import {
  AccessoryGroup,
  ConfiguratorProvider,
  FacetId,
  isKeyFacet,
  useAccessoryGroup,
  useConfigurator,
} from '@matst80/slask-finder-sdk'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { makeImageUrl } from '../utils'

export const KeyFacetSelector = ({
  name,
  id,
  values,
}: {
  name: string
  id: FacetId
  values: string[]
}) => {
  const { selections, handleSelect, getAvailableFacetValues } =
    useConfigurator()
  const selectedValue = selections[String(id)]
  const availableValues = getAvailableFacetValues(id)

  return (
    <div className="border-b border-gray-300 pb-6 last:border-b-0">
      <span className="text-lg mb-4 block">{name}</span>
      <fieldset className="flex gap-2 flex-wrap">
        {values.map((value) => {
          const isSelected = selectedValue === value
          const isAvailable = availableValues.includes(value)
          return (
            <Button
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              disabled={!isAvailable && !isSelected}
              //className={!isAvailable && !isSelected ? 'opacity-40' : ''}
              onClick={() => handleSelect(String(id), value)}
              key={value}
            >
              {value}
            </Button>
          )
        })}
      </fieldset>
    </div>
  )
}

const ResultItem = () => {
  const { availableItems } = useConfigurator()
  const first = availableItems[0]
  if (!first) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No matching combination found
      </div>
    )
  }
  const { title, img } = first
  return (
    <div className="flex items-center justify-center h-full p-6 relative">
      <div className="absolute top-3 right-3 p-2 bg-purple-500 rounded-full aspect-square w-10 h-10 flex items-center justify-center text-white font-bold">
        {availableItems.length}
      </div>
      <img
        className="max-w-full mix-blend-multiply h-auto object-contain product-image"
        src={makeImageUrl(img)}
        alt={title}
      />
    </div>
  )
}

const AccessoryGroupElement = ({ group, items }: AccessoryGroup) => {
  const [open, setOpen] = useState(false)
  return (
    <div className="p-4">
      <button onClick={() => setOpen((p) => !p)} className="font-semibold my-2">
        {group.name ?? 'unknown'}
      </button>
      {open && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {items.map((item) => (
            <div key={item.id} className="flex flex-col gap-2">
              <div className="text-sm font-medium">{item.title}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const AccessoryGroups = ({ id }: { id?: string }) => {
  const { data, isLoading, error } = useAccessoryGroup(id)
  if (isLoading) {
    return <div>Loading accessories...</div>
  }
  if (error) {
    return <div>Error loading accessories: {error}</div>
  }
  if (!data) {
    return <div>No accessories</div>
  }
  return (
    <>
      {data
        .filter((x) => x.items.length > 0)
        .map((grp) => (
          <AccessoryGroupElement key={grp.group.id} {...grp} />
        ))}
    </>
  )
}

const ConfiguratorContent = () => {
  const { facets, loading } = useConfigurator()
  const { pageId } = useParams()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-xl font-medium text-gray-600 animate-pulse">
          Loading configurator...
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[300px_auto] gap-2 h-screen">
      <div className="mb-6 p-6 md:mb-0 bg-gray-100 border-b md:border-b-0 md:border-r md:border-gray-300 overflow-y-auto">
        <div className="flex flex-col gap-3">
          {facets
            .filter((d) => d.id != 'pageId')
            .map((facet) => {
              const possibleValues = Object.keys(
                isKeyFacet(facet) ? facet.result.values : {},
              ).sort((a, b) => a.localeCompare(b))
              return (
                <KeyFacetSelector
                  key={facet.id}
                  name={facet.name}
                  id={facet.id}
                  values={possibleValues}
                />
              )
            })}
        </div>
        <AccessoryGroups id={pageId} />
      </div>

      <ResultItem />
    </div>
  )
}

export const ProductConfigurator = () => {
  const { pageId } = useParams()

  return (
    <ConfiguratorProvider
      query={{ string: [{ id: 'pageId', value: [pageId ?? '88445'] }] }}
    >
      <ConfiguratorContent />
    </ConfiguratorProvider>
  )
}
