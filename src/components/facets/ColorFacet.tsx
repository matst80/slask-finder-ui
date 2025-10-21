import { useQueryKeyFacet } from '../../lib/hooks/useQueryKeyFacet'
import { KeyFacet } from '../../lib/types'
import { cm, colourNameToHex } from '../../utils'

export const ColorFacetSelector = ({ id, result: { values } }: KeyFacet) => {
  const { filter: keyFilters, addValue, removeValue } = useQueryKeyFacet(id)

  return (
    <div className="mb-4 border-b border-gray-200 pb-2">
      <h3 className="font-medium mb-2">Färg</h3>
      <div className="flex flex-wrap gap-2">
        {Object.keys(values).map((color) => {
          const colorHex = colourNameToHex(color)
          if (!colorHex) {
            return null
          }
          const selected = keyFilters.has(color)
          return (
            <button
              key={color}
              title={color}
              className={cm(
                `w-6 h-6 rounded-full border`,
                selected ? 'border-blue-500' : 'border-gray-300',
              )}
              style={colorHex}
              aria-label={`Filter by ${color}`}
              onClick={() => {
                selected != null ? addValue(color) : removeValue(color)
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
