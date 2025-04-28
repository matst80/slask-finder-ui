import fuzzysort from "fuzzysort";
import { useState, useMemo } from "react";
import { useTranslations } from "../../lib/hooks/useTranslations";
import { useFacetGroups, useFacetList } from "../../hooks/searchHooks";
import { updateFacetGroups } from "../../lib/datalayer/api";
import { useNotifications } from "../../components/ui-notifications/useNotifications";
import { motion } from "framer-motion";

// UI Components
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Label } from "../../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Checkbox } from "../../components/ui/checkbox";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";

// Icons
import {
  Search,
  CheckCircle2,
  Save,
  Plus,
  Layers,
  Filter,
  AlertCircle,
  Loader2,
} from "lucide-react";

export const FacetGroups = () => {
  const t = useTranslations();
  const [request, setRequest] = useState<{
    group_id: number;
    group_name: string;
  }>({ group_id: 0, group_name: "" });
  const { showNotification } = useNotifications();
  const [filter, setFilter] = useState<string>("");
  const [ids, setIds] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const { data: facets, isLoading: loadingFacets } = useFacetList();
  const { data: groups, isLoading: loadingGroups } = useFacetGroups();

  const updateGroups = () => {
    setSaving(true);
    updateFacetGroups({ ...request, facet_ids: ids })
      .then((ok) => {
        showNotification({
          variant: ok ? "success" : "error",
          title: ok
            ? t("facet_groups.update_success_title")
            : t("facet_groups.update_error_title"),
          message: ok
            ? t("facet_groups.update_success")
            : t("facet_groups.update_error"),
        });
      })
      .finally(() => {
        setSaving(false);
      });
  };

  const filteredFacets = useMemo(
    () =>
      fuzzysort
        .go(filter, facets ?? [], {
          keys: ["name", "id"],
          threshold: 0.2,
          limit: 1000,
        })
        .map(({ obj }) => ({
          ...obj,
          selected: ids.includes(obj.id),
        })),
    [filter, facets, ids]
  );

  const selectedFacets = useMemo(
    () => filteredFacets.filter((facet) => facet.selected),
    [filteredFacets]
  );

  const handleSelectAll = () => {
    setIds(filteredFacets.map((facet) => facet.id));
  };

  const handleClearAll = () => {
    setIds([]);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Enhanced header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-8 mb-8 shadow-lg text-white">
        <h1 className="text-3xl font-bold mb-3">{t("facet_groups.title")}</h1>
        <p className="text-indigo-100 max-w-3xl">
          {t("facet_groups.description")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Group Management Section - Enhanced design */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="overflow-hidden border-none shadow-xl">
            <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
            <CardHeader className="bg-gradient-to-b from-slate-50 to-white pb-6">
              <div className="flex items-center mb-2">
                <Layers className="text-blue-500 mr-2 h-5 w-5" />
                <CardTitle>{t("facet_groups.list")}</CardTitle>
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
                  <div className="bg-slate-50 p-4 rounded-lg mb-6">
                    <h3 className="text-sm font-medium text-slate-800 mb-3 flex items-center">
                      <Filter className="h-4 w-4 mr-1 text-blue-500" />
                      Existing Groups
                    </h3>
                    <RadioGroup
                      value={request.group_id.toString()}
                      onValueChange={(value) => {
                        const groupId = parseInt(value);
                        const group = groups?.find((g) => g.id === groupId);
                        setRequest({
                          group_id: groupId,
                          group_name: group?.name || "",
                        });
                      }}
                      className="space-y-2.5"
                    >
                      {groups?.map((group) => (
                        <div
                          key={group.id}
                          className="flex items-center space-x-2 transition-all hover:translate-x-1 duration-200 ease-in-out"
                        >
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
                  </div>

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
                        {t("facet_groups.group_name")}
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
                        {t("facet_groups.group_id")}
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
        </motion.div>

        {/* Facets Selection Section - Enhanced design */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="overflow-hidden border-none shadow-xl">
            <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            <CardHeader className="bg-gradient-to-b from-slate-50 to-white pb-6">
              <div className="flex items-center mb-2">
                <CheckCircle2 className="text-purple-500 mr-2 h-5 w-5" />
                <CardTitle>{t("facet_groups.facets")}</CardTitle>
              </div>
              <CardDescription>
                Select facets to include in this group
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-6 w-full grid grid-cols-2 bg-slate-100 p-1 rounded-lg">
                  <TabsTrigger
                    value="all"
                    className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-md"
                  >
                    All Facets
                  </TabsTrigger>
                  <TabsTrigger
                    value="selected"
                    className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-md"
                  >
                    Selected
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-purple-100 text-purple-700 font-bold"
                    >
                      {selectedFacets.length}
                    </Badge>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
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
                                  ? "bg-purple-50 border border-purple-200"
                                  : "hover:bg-slate-50 border border-transparent hover:border-slate-200"
                              }`}
                            >
                              <Checkbox
                                id={`facet-${facet.id}`}
                                checked={facet.selected}
                                onCheckedChange={(checked) => {
                                  setIds((prev) =>
                                    checked
                                      ? [...prev, facet.id]
                                      : prev.filter((id) => id !== facet.id)
                                  );
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
                </TabsContent>

                <TabsContent value="selected" className="space-y-4">
                  {selectedFacets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-10 text-center bg-slate-50 rounded-lg">
                      <AlertCircle className="h-10 w-10 text-slate-300 mb-2" />
                      <p className="text-slate-500 font-medium">
                        No facets selected
                      </p>
                      <p className="text-slate-400 text-sm mt-1">
                        Go to "All Facets" tab to add some
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                      <div className="p-2 bg-green-50 text-green-700 rounded-lg text-sm mb-3">
                        <div className="flex items-center">
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          <span>Selected {selectedFacets.length} facets</span>
                        </div>
                      </div>

                      {selectedFacets.map((facet) => (
                        <motion.div
                          key={facet.id}
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.95, opacity: 0 }}
                          className="flex items-center space-x-3 p-3 rounded-lg bg-purple-50 border border-purple-200 shadow-sm"
                        >
                          <Checkbox
                            id={`selected-facet-${facet.id}`}
                            checked={true}
                            onCheckedChange={() => {
                              setIds((prev) =>
                                prev.filter((id) => id !== facet.id)
                              );
                            }}
                            className="border-2 border-purple-400 data-[state=checked]:bg-purple-600"
                          />
                          <Label
                            htmlFor={`selected-facet-${facet.id}`}
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
                        </motion.div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        className="mt-12 flex justify-end"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
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
              {t("common.save")}
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
};
