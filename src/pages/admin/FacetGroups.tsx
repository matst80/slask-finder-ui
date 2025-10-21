import fuzzysort from 'fuzzysort'
// Icons
import {
  AlertCircle,
  CheckCircle2,
  Filter,
  Layers,
  Loader2,
  Plus,
  Save,
  Search,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'
import { Checkbox } from '../../components/ui/checkbox'
// UI Components
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group'
import { Separator } from '../../components/ui/separator'
import { useNotifications } from '../../components/ui-notifications/useNotifications'
import { useFacetGroups, useFacetList } from '../../hooks/searchHooks'
import { updateFacetGroups } from '../../lib/datalayer/api'
import { useTranslations } from '../../lib/hooks/useTranslations'

export const FacetGroups = () => {
  const t = useTranslations()
  const [request, setRequest] = useState<{
    group_id: number
    group_name: string
  }>({ group_id: 0, group_name: '' })
  const { showNotification } = useNotifications()
  const [filter, setFilter] = useState<string>('')
  const [ids, setIds] = useState<number[]>([])
  const [saving, setSaving] = useState(false)
  const { data: facets, isLoading: loadingFacets } = useFacetList()
  const { data: groups, isLoading: loadingGroups } = useFacetGroups()

  const updateGroups = () => {
    setSaving(true)
    updateFacetGroups({ ...request, facet_ids: ids })
      .then((ok) => {
        showNotification({
          variant: ok ? 'success' : 'error',
          title: ok
            ? t('facet_groups.update_success_title')
            : t('facet_groups.update_error_title'),
          message: ok
            ? t('facet_groups.update_success')
            : t('facet_groups.update_error'),
        })
      })
      .finally(() => {
        setSaving(false)
      })
  }

  const filteredFacets = useMemo(
    () =>
      fuzzysort
        .go(filter, facets ?? [], {
          keys: ['name', 'id'],
          threshold: 0.2,
          limit: 1000,
        })
        .map(({ obj }) => ({
          ...obj,
          selected: ids.includes(obj.id),
        })),
    [filter, facets, ids],
  )

  const handleSelectAll = () => {
    setIds(filteredFacets.map((facet) => facet.id))
  }

  const handleClearAll = () => {
    setIds([])
  }

  return (
    <div className="center-container px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Group Management Section - Enhanced design */}
        <div className="animated-element">
          <Card className="overflow-hidden border-none shadow-xl">
            <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
            <CardHeader className="bg-gradient-to-b from-slate-50 to-white pb-6">
              <div className="flex items-center mb-2">
                <Layers className="text-blue-500 mr-2 h-5 w-5" />
                <CardTitle>{t('facet_groups.list')}</CardTitle>
              </div>
              <CardDescription>
                Select an existing group or create a new one
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {loadingGroups ? (
                <div className="flex justify-center p-10">
                  <Loader2 className="h-10 w-10 text-primary animate-spin" />
                </div>
              ) : (
                <>
                  <h3 className="text-sm font-medium text-slate-800 mb-3 flex items-center">
                    <Filter className="h-4 w-4 mr-1 text-blue-500" />
                    Existing Groups
                  </h3>
                  <RadioGroup
                    value={request.group_id.toString()}
                    onValueChange={(value) => {
                      const groupId = parseInt(value)
                      const group = groups?.find((g) => g.id === groupId)
                      setIds([])
                      setRequest({
                        group_id: groupId,
                        group_name: group?.name || '',
                      })
                    }}
                    className="space-y-2.5"
                  >
                    {groups?.map((group) => (
                      <div key={group.id} className="flex items-center gap-2">
                        <RadioGroupItem
                          value={group.id.toString()}
                          id={`group-${group.id}`}
                          className="border-2 border-blue-300"
                        />
                        <Label
                          htmlFor={`group-${group.id}`}
                          className="cursor-pointer text-slate-700 font-medium"
                        >
                          {group.name}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>

                  <Separator className="my-6 bg-slate-200" />

                  <div className="space-y-5">
                    <h3 className="text-sm font-medium text-slate-800 mb-3 flex items-center">
                      <Plus className="h-4 w-4 mr-1 text-blue-500" />
                      Group Details
                    </h3>
                    <div className="space-y-2">
                      <Label
                        htmlFor="group-name"
                        className="block text-slate-700 font-medium"
                      >
                        {t('facet_groups.group_name')}
                      </Label>
                      <Input
                        id="group-name"
                        value={request.group_name}
                        onChange={(e) =>
                          setRequest({ ...request, group_name: e.target.value })
                        }
                        className="w-full border-2 border-slate-200 focus:border-blue-500 transition-colors shadow-sm"
                        placeholder="Enter group name..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="group-id"
                        className="block text-slate-700 font-medium"
                      >
                        {t('facet_groups.group_id')}
                      </Label>
                      <Input
                        id="group-id"
                        type="number"
                        value={request.group_id}
                        onChange={(e) =>
                          setRequest({
                            ...request,
                            group_id: Number(e.target.value),
                          })
                        }
                        className="w-full border-2 border-slate-200 focus:border-blue-500 transition-colors shadow-sm"
                        placeholder="Enter group ID..."
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Facets Selection Section - Enhanced design */}
        <div className="animated-element">
          <Card className="overflow-hidden border-none shadow-xl">
            <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            <CardHeader className="bg-gradient-to-b from-slate-50 to-white pb-6">
              <div className="flex items-center mb-2">
                <CheckCircle2 className="text-purple-500 mr-2 h-5 w-5" />
                <CardTitle>{t('facet_groups.facets')}</CardTitle>
              </div>
              <CardDescription>
                Select facets to include in this group
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                <Input
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Search facets..."
                  className="pl-10 border-2 border-slate-200 focus:border-purple-500 transition-colors mb-4 shadow-sm"
                />
              </div>

              <div className="flex justify-between mb-3">
                <button
                  onClick={handleSelectAll}
                  className="text-xs font-medium text-purple-600 hover:text-purple-800 transition-colors"
                >
                  Select All
                </button>
                <button
                  onClick={handleClearAll}
                  className="text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Clear All
                </button>
              </div>

              {loadingFacets ? (
                <div className="flex justify-center p-10">
                  <Loader2 className="h-10 w-10 text-purple-500 animate-spin" />
                </div>
              ) : (
                <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                  {filteredFacets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <AlertCircle className="h-10 w-10 text-slate-300 mb-2" />
                      <p className="text-slate-500">No facets found</p>
                    </div>
                  ) : (
                    <>
                      {filteredFacets.map((facet) => (
                        <div
                          key={facet.id}
                          className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                            facet.selected
                              ? 'bg-purple-50 border border-purple-200'
                              : 'hover:bg-slate-50 border border-transparent hover:border-slate-200'
                          }`}
                        >
                          <Checkbox
                            id={`facet-${facet.id}`}
                            checked={facet.selected}
                            onCheckedChange={(checked) => {
                              setIds((prev) =>
                                checked
                                  ? [...prev, facet.id]
                                  : prev.filter((id) => id !== facet.id),
                              )
                            }}
                            className="border-2 border-purple-400 data-[state=checked]:bg-purple-600"
                          />
                          <Label
                            htmlFor={`facet-${facet.id}`}
                            className="flex-1 cursor-pointer font-medium text-slate-700"
                          >
                            {facet.name}
                            {facet.groupId && (
                              <Badge
                                variant="outline"
                                className="ml-2 bg-slate-100 text-slate-700 border-slate-300"
                              >
                                Group: {facet.groupId}
                              </Badge>
                            )}
                          </Label>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-12 flex justify-end animated-element">
        <Button
          onClick={updateGroups}
          size="lg"
          disabled={!request.group_name || ids.length === 0 || saving}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 px-10 py-6 font-medium text-base flex gap-2 items-center"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {t('common.save')}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
