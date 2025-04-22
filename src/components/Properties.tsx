import { useMemo } from "react"
import { Link } from "react-router-dom"
import { useAdmin } from "../hooks/appState"
import { useFacetMap } from "../hooks/searchHooks"
import { useQuery } from "../lib/hooks/useQuery"
import { ItemDetail } from "../lib/types"
import { isDefined, byPriority } from "../utils"

 const ignoreFaceIds = [3, 4, 5, 10, 11, 12, 13];

export const Properties = ({ values }: Pick<ItemDetail, "values">) => {
  const { setQuery } = useQuery()
  const { data } = useFacetMap()
  const [isAdmin] = useAdmin()
  const fields = useMemo(() => {
    return Object.entries(values)
      .map(([id, value]) => {
        const facet = data?.[id]
        if (!facet || ignoreFaceIds.includes(facet.id)) {
          return null
        }
        if (!isAdmin && facet.hide) {
          return null
        }
        return {
          ...facet,
          value,
        }
      })
      .filter(isDefined)
      .sort(byPriority)
  }, [values, data, isAdmin])
  return (
    <div className="md:bg-white md:rounded-lg md:shadow-sm md:border border-gray-100 md:p-4">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">
        Egenskaper
        <span className="ml-2 text-gray-500 text-lg">({fields.length})</span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
        {fields.map((field) => (
          <div
            key={`prop-${field.id}-${field.valueType}`}
            className="py-2 md:p-3 md:rounded-lg md:hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <h4
                className="text-lg font-semibold text-gray-900"
                onClick={() => {
                  navigator.clipboard.writeText(String(field.id))
                }}
              >
                {field.name}
              </h4>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-gray-700">
                {Array.isArray(field.value)
                  ? field.value.join(", ")
                  : String(field.value)}
              </p>
              {field.linkedId != null &&
                isAdmin &&
                field.linkedId > 0 &&
                field.value != null && (
                  <Link
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center gap-1"
                    to="/"
                    onClick={() => {
                      if (field.linkedId != null && field.value != null) {
                        setQuery({
                          page: 0,
                          string: [
                            {
                              id: field.linkedId,
                              value: Array.isArray(field.value)
                                ? field.value
                                : [String(field.value)],
                            },
                          ],
                        })
                      }
                    }}
                  >
                    Visa kompatibla
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      {field.linkedId}
                    </span>
                  </Link>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
