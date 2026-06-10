import {
  BatchUpdateResponse,
  getAdminItem,
  Item,
  ItemDetail,
  ItemValues,
  submitBatchUpdates,
} from '@matst80/slask-finder-sdk'
import {
  AlertCircle,
  CheckCircle,
  Code,
  HelpCircle,
  Plus,
  Save,
  Search,
  Settings,
  Trash2,
} from 'lucide-react'
import { useState } from 'react'
import { useAdminFacets } from '../../adminHooks'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { useNotifications } from '../../components/ui-notifications/useNotifications'

export const ProductEditor = () => {
  const { showNotification } = useNotifications()
  const { data: allFacets = [] } = useAdminFacets()

  // Tabs: 'single' | 'batch' | 'rules'
  const [activeTab, setActiveTab] = useState<'single' | 'batch' | 'rules'>(
    'single',
  )

  // --- Single Item State ---
  const [searchId, setSearchId] = useState('')
  const [loadingItem, setLoadingItem] = useState(false)
  const [item, setItem] = useState<ItemDetail | null>(null)

  // Modified item values
  const [title, setTitle] = useState('')
  const [buyable, setBuyable] = useState(true)
  const [buyableInStore, setBuyableInStore] = useState(true)
  const [saleStatus, setSaleStatus] = useState('')
  const [advertisingText, setAdvertisingText] = useState('')
  const [description, setDescription] = useState('')
  const [deleteProduct, setDeleteProduct] = useState(false)

  // values is key-value map for facets: { [facetId: string]: string | number | null }
  const [facetValues, setFacetValues] = useState<
    Record<string, string | number | null>
  >({})
  const [newFacetId, setNewFacetId] = useState('')
  const [newFacetValue, setNewFacetValue] = useState('')

  // --- Batch State ---
  const [batchJson, setBatchJson] = useState('[\n  \n]')
  const [batchResult, setBatchResult] = useState<BatchUpdateResponse | null>(
    null,
  )
  const [submittingBatch, setSubmittingBatch] = useState(false)

  // --- Single Item Handlers ---
  const handleLoadItem = async () => {
    if (!searchId.trim()) return
    setLoadingItem(true)
    setItem(null)
    try {
      const data = await getAdminItem(searchId.trim())
      if (data) {
        setItem(data)
        setTitle(data.title || '')
        setBuyable(data.buyable ?? true)
        setBuyableInStore(data.buyableInStore ?? true)
        setSaleStatus(data.saleStatus || '')
        setAdvertisingText(data.advertisingText || '')
        setDescription(data.description || '')
        setDeleteProduct(false)

        // Initialize facets
        const initialFacets: Record<string, string | number | null> = {}
        if (data.values) {
          Object.entries(data.values).forEach(([k, v]) => {
            if (v !== undefined) {
              initialFacets[k] = Array.isArray(v)
                ? v.join(', ')
                : (v as string | number)
            }
          })
        }
        setFacetValues(initialFacets)
        showNotification({
          title: 'Loaded',
          message: `Product ${data.id} loaded successfully`,
          variant: 'success',
        })
      } else {
        showNotification({
          title: 'Not Found',
          message: 'Product not found or failed to load',
          variant: 'error',
        })
      }
    } catch (err) {
      console.error(err)
      showNotification({
        title: 'Error',
        message: 'Failed to load product',
        variant: 'error',
      })
    } finally {
      setLoadingItem(false)
    }
  }

  const handleSaveSingle = async () => {
    if (!item) return
    const updateObj: Partial<Item> & { delete?: true } = {
      id: item.id,
    }

    if (deleteProduct) {
      updateObj.delete = true
    } else {
      updateObj.title = title
      updateObj.buyable = buyable
      updateObj.buyableInStore = buyableInStore
      updateObj.saleStatus = saleStatus
      updateObj.advertisingText = advertisingText
      updateObj.description = description
      updateObj.values = { ...facetValues } as ItemValues
    }

    try {
      const resp = await submitBatchUpdates([updateObj])
      if (resp.status === 'ok') {
        showNotification({
          title: 'Saved',
          message: `Changes saved: ${resp.inserts} inserts, ${resp.changes} changes, ${resp.deletes} deletes.`,
          variant: 'success',
        })
        if (deleteProduct) {
          setItem(null)
        } else {
          handleLoadItem() // Reload
        }
      } else {
        showNotification({
          title: 'Failed',
          message: `Save response status: ${resp.status}`,
          variant: 'error',
        })
      }
    } catch (err) {
      console.log(err)
      showNotification({
        title: 'Error',
        message: 'Failed to save product',
        variant: 'error',
      })
    }
  }

  const handleFacetChange = (facetId: string, val: string) => {
    const facetDef = allFacets.find((f) => String(f.id) === facetId)
    const isNumeric =
      facetDef?.valueType === 'decimal' ||
      facetDef?.valueType === 'number' ||
      facetDef?.fieldType === 'float'

    if (val === '') {
      setFacetValues((prev) => ({ ...prev, [facetId]: null }))
    } else if (isNumeric) {
      const parsed = parseFloat(val)
      setFacetValues((prev) => ({
        ...prev,
        [facetId]: isNaN(parsed) ? val : parsed,
      }))
    } else {
      setFacetValues((prev) => ({ ...prev, [facetId]: val }))
    }
  }

  const handleAddFacet = () => {
    if (!newFacetId) return
    const facetDef = allFacets.find((f) => String(f.id) === newFacetId)
    const isNumeric =
      facetDef?.valueType === 'decimal' ||
      facetDef?.valueType === 'number' ||
      facetDef?.fieldType === 'float'

    let val: string | number = newFacetValue
    if (isNumeric) {
      const parsed = parseFloat(newFacetValue)
      if (!isNaN(parsed)) val = parsed
    }

    setFacetValues((prev) => ({ ...prev, [newFacetId]: val }))
    setNewFacetId('')
    setNewFacetValue('')
  }

  // --- Batch JSON Handlers ---
  const handleBatchSubmit = async () => {
    let payload: Partial<Item>[]
    try {
      payload = JSON.parse(batchJson)
      if (!Array.isArray(payload)) {
        throw new Error('Payload must be a JSON array')
      }
    } catch (err) {
      console.log(err)
      showNotification({
        title: 'JSON Parse Error',
        message: 'Invalid JSON format',
        variant: 'error',
      })
      return
    }

    setSubmittingBatch(true)
    setBatchResult(null)
    try {
      const resp = await submitBatchUpdates(payload)
      setBatchResult(resp)
      if (resp.status === 'ok') {
        showNotification({
          title: 'Batch Completed',
          message: `Successfully processed batch request`,
          variant: 'success',
        })
      } else {
        showNotification({
          title: 'Batch Warning',
          message: `Status: ${resp.status}`,
          variant: 'error',
        })
      }
    } catch (err) {
      console.error(err)
      showNotification({
        title: 'Batch Error',
        message: 'Failed to submit batch updates',
        variant: 'error',
      })
    } finally {
      setSubmittingBatch(false)
    }
  }

  const loadTemplate = (type: 'update' | 'clear' | 'delete' | 'mixed') => {
    const templates = {
      update: `[\n  {\n    "id": 861201,\n    "title": "Updated Product Title",\n    "values": {\n      "2": "Intel"\n    }\n  }\n]`,
      clear: `[\n  {\n    "id": 861201,\n    "values": {\n      "32153": null\n    }\n  }\n]`,
      delete: `[\n  {\n    "id": 861201,\n    "delete": true\n  }\n]`,
      mixed: `[\n  {\n    "id": 861201,\n    "values": { "2": "AMD-X" }\n  },\n  {\n    "id": 861202,\n    "delete": true\n  },\n  {\n    "id": 99000001,\n    "buyable": true,\n    "saleStatus": "ACT",\n    "title": "New product",\n    "values": { "4": 50000, "2": "NVIDIA" }\n  }\n]`,
    }
    setBatchJson(templates[type])
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header card */}
      <Card className="overflow-hidden shadow-lg border-0 bg-white">
        <div className="h-2 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600"></div>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Product & Batch Editor
              </h1>
              <p className="text-gray-500 mt-1">
                Manage items, values, and apply bulk updates to the search
                engine
              </p>
            </div>

            {/* Tabs switcher */}
            <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200 self-stretch md:self-auto">
              <button
                onClick={() => setActiveTab('single')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  activeTab === 'single'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Single Item</span>
              </button>
              <button
                onClick={() => setActiveTab('batch')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  activeTab === 'batch'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Code className="w-4 h-4" />
                <span>Batch JSON</span>
              </button>
              <button
                onClick={() => setActiveTab('rules')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  activeTab === 'rules'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>Visibility Rules</span>
              </button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Tab Content */}
      {activeTab === 'single' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left panel: Lookup and Core fields */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-md bg-white">
              <CardHeader className="border-b border-gray-100 pb-3">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Search className="w-5 h-5 text-indigo-500" />
                  <span>Lookup Product</span>
                </h2>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter Item ID or SKU"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLoadItem()}
                  />
                  <Button onClick={handleLoadItem} disabled={loadingItem}>
                    {loadingItem ? 'Loading...' : 'Load'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {item && (
              <Card className="shadow-md bg-white">
                <CardHeader className="border-b border-gray-100 pb-3">
                  <h2 className="text-lg font-bold text-gray-900">
                    Core Attributes
                  </h2>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                      Product Title
                    </label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                        Sale Status
                      </label>
                      <Input
                        value={saleStatus}
                        onChange={(e) => setSaleStatus(e.target.value)}
                        placeholder="e.g. ACT"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                        SKU (Readonly)
                      </label>
                      <Input value={item.sku} disabled className="bg-gray-50" />
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={buyable}
                        onChange={(e) => setBuyable(e.target.checked)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Buyable Online
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={buyableInStore}
                        onChange={(e) => setBuyableInStore(e.target.checked)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Buyable In Store
                      </span>
                    </label>
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <label className="flex items-center gap-2 cursor-pointer text-red-600 hover:text-red-700">
                      <input
                        type="checkbox"
                        checked={deleteProduct}
                        onChange={(e) => setDeleteProduct(e.target.checked)}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500 h-4 w-4"
                      />
                      <span className="text-sm font-bold">
                        DELETE PRODUCT ON SAVE
                      </span>
                    </label>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right panel: Facets Editor */}
          <div className="lg:col-span-2">
            {item ? (
              <Card className="shadow-md bg-white">
                <CardHeader className="border-b border-gray-100 pb-3 flex flex-row justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-900">
                    Facet Values (Dynamic Properties)
                  </h2>
                  <Button
                    size="sm"
                    onClick={handleSaveSingle}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </Button>
                </CardHeader>
                <CardContent className="pt-4 space-y-6">
                  {/* Grid of existing facets */}
                  <div className="space-y-4">
                    {Object.entries(facetValues).map(([facetId, value]) => {
                      const facetDef = allFacets.find(
                        (f) => String(f.id) === facetId,
                      )
                      const displayName = facetDef
                        ? `${facetDef.name} (${facetId})`
                        : `Facet ID: ${facetId}`
                      const isCleared = value === null

                      return (
                        <div
                          key={facetId}
                          className={`flex items-center gap-4 p-3 rounded-lg border transition-all ${isCleared ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}
                        >
                          <div className="flex-1 min-w-0">
                            <span className="block text-sm font-semibold text-gray-700 truncate">
                              {displayName}
                            </span>
                            {facetDef?.description && (
                              <span className="block text-xs text-gray-500 truncate">
                                {facetDef.description}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <Input
                              value={value ?? ''}
                              disabled={isCleared}
                              onChange={(e) =>
                                handleFacetChange(facetId, e.target.value)
                              }
                              placeholder={
                                isCleared
                                  ? 'Cleared (will be deleted)'
                                  : 'Enter value'
                              }
                              className="max-w-[200px] bg-white"
                            />

                            {isCleared ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                                onClick={() => handleFacetChange(facetId, '')}
                              >
                                Restore
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                onClick={() =>
                                  setFacetValues((prev) => ({
                                    ...prev,
                                    [facetId]: null,
                                  }))
                                }
                                title="Clear facet value"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Add Facet Widget */}
                  <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 mt-6">
                    <h3 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-1">
                      <Plus className="w-4 h-4" />
                      <span>Add New Facet Value</span>
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <select
                        value={newFacetId}
                        onChange={(e) => setNewFacetId(e.target.value)}
                        className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="">-- Select Facet field --</option>
                        {allFacets
                          .filter((f) => !(String(f.id) in facetValues))
                          .map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.name} ({f.id}) - {f.valueType || 'string'}
                            </option>
                          ))}
                      </select>

                      <Input
                        placeholder="Facet value"
                        value={newFacetValue}
                        onChange={(e) => setNewFacetValue(e.target.value)}
                        className="sm:max-w-[200px] bg-white"
                      />

                      <Button
                        onClick={handleAddFacet}
                        disabled={!newFacetId}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="h-64 border-2 border-dashed border-gray-200 rounded-xl flex flex-col justify-center items-center text-gray-400 p-4">
                <Search className="w-12 h-12 mb-2 stroke-1" />
                <span className="text-sm font-medium">
                  Lookup a product to edit its dynamic values and facets
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'batch' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Templates Column */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-md bg-white">
              <CardHeader className="border-b border-gray-100 pb-3">
                <h2 className="text-lg font-bold text-gray-900">
                  Batch Templates
                </h2>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => loadTemplate('update')}
                >
                  Update Title & Facet
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => loadTemplate('clear')}
                >
                  Clear Facet Value (null)
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => loadTemplate('delete')}
                >
                  Delete Item Template
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => loadTemplate('mixed')}
                >
                  Mixed Actions Batch
                </Button>
              </CardContent>
            </Card>

            {batchResult && (
              <Card className="shadow-md bg-white border-green-200">
                <CardHeader className="border-b border-gray-100 pb-3 bg-green-50/50">
                  <h2 className="text-lg font-bold text-green-900 flex items-center gap-1.5">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span>Submission Result</span>
                  </h2>
                </CardHeader>
                <CardContent className="pt-4 space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between py-1 border-b border-gray-50">
                    <span className="font-medium">Status:</span>
                    <span className="font-bold text-indigo-600">
                      {batchResult.status}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-50">
                    <span className="font-medium">Inserts:</span>
                    <span className="font-bold">{batchResult.inserts}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-50">
                    <span className="font-medium">Changes:</span>
                    <span className="font-bold">{batchResult.changes}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="font-medium">Deletes:</span>
                    <span className="font-bold">{batchResult.deletes}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* JSON Textarea Column */}
          <div className="lg:col-span-2">
            <Card className="shadow-md bg-white h-full flex flex-col">
              <CardHeader className="border-b border-gray-100 pb-3 flex flex-row justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">
                  Batch JSON Editor
                </h2>
                <Button
                  onClick={handleBatchSubmit}
                  disabled={submittingBatch}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {submittingBatch ? 'Submitting...' : 'Submit Batch'}
                </Button>
              </CardHeader>
              <CardContent className="pt-4 flex-1 flex flex-col">
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
                  JSON payload array
                </label>
                <textarea
                  className="w-full flex-1 min-h-[400px] font-mono text-sm p-4 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-indigo-500"
                  value={batchJson}
                  onChange={(e) => setBatchJson(e.target.value)}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'rules' && (
        <Card className="shadow-md bg-white">
          <CardHeader className="border-b border-gray-100 pb-3">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <span>Making an Item Visible / Live</span>
            </h2>
          </CardHeader>
          <CardContent className="pt-4 space-y-6">
            <p className="text-gray-700 leading-relaxed">
              An item is treated as <strong>soft-deleted</strong> (excluded from
              active search results) unless it meets all of the following
              criteria:
            </p>

            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>
                <strong>Buyable Flag:</strong> The <code>"buyable"</code>{' '}
                property must be set to <code>true</code>.
              </li>
              <li>
                <strong>Sale Status:</strong> The <code>"saleStatus"</code>{' '}
                property must NOT be set to any of:
                <ul className="list-circle pl-6 mt-1 space-y-1 text-gray-600 font-mono">
                  <li>"999" (hard-deleted)</li>
                  <li>"MDD" (hard-deleted)</li>
                  <li>"DIS" (soft-deleted)</li>
                  <li>"DIO" (soft-deleted)</li>
                </ul>
              </li>
              <li>
                <strong>Price Floor:</strong> The price facet (Facet ID{' '}
                <code>"4"</code>) must have a value{' '}
                <strong>greater than 200</strong> (e.g. <code>"4": 250</code>).
              </li>
            </ul>

            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mt-4">
              <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wide mb-1">
                Important
              </h3>
              <p className="text-sm text-amber-700">
                A partial <em>update</em> of an already-live item only needs to
                include its <code>id</code> and the fields to change. The
                live-making fields (like pricing and saleStatus) are preserved
                from the existing item body.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
