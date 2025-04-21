import { LoaderCircle, ArrowUp, ArrowDown } from "lucide-react";
import { useDefaultMetricsQuery } from "../hooks/metricsHooks";

const StatCard = ({
  title,
  value,
  isLoading,
  error,
  trend,
}: {
  title: string;
  value: string | number;
  isLoading: boolean;
  error?: Error;
  trend?: number;
}) => {
  const getTrendColor = (trend: number) => {
    if (trend > 0) return "text-green-500";
    if (trend < 0) return "text-red-500";
    return "text-gray-500";
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <ArrowUp className="size-4" />;
    if (trend < 0) return <ArrowDown className="size-4" />;
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <div className="mt-2 flex items-baseline">
        {isLoading ? (
          <LoaderCircle className="size-5 animate-spin" />
        ) : error ? (
          <span className="text-red-500">Error loading data</span>
        ) : (
          <div className="flex items-center gap-2">
            <p className="text-3xl font-semibold text-gray-900">{value}</p>
            {trend !== undefined && (
              <div className={`flex items-center ${getTrendColor(trend)}`}>
                {getTrendIcon(trend)}
                <span className="text-sm ml-1">
                  {Math.abs(trend).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const SearchStats = () => {
  const { data, isLoading, error } = useDefaultMetricsQuery(
    `sum(slaskfinder_searches_total)`,
    ({ data }) => ({
      label: "Total searches",
      data,
    })
  );

  const currentValue = data?.[0]?.data?.[data[0].data.length - 1]?.[1] ?? 0;
  const previousValue = data?.[0]?.data?.[data[0].data.length - 2]?.[1] ?? 0;
  const trend = previousValue
    ? ((currentValue - previousValue) / previousValue) * 100
    : 0;

  return (
    <StatCard
      title="Total Searches"
      value={currentValue.toLocaleString()}
      isLoading={isLoading}
      error={error}
      trend={trend}
    />
  );
};

const FacetStats = () => {
  const { data, isLoading, error } = useDefaultMetricsQuery(
    `sum(slaskfinder_facets_total)`,
    ({ data }) => ({
      label: "Total facets",
      data,
    })
  );

  const currentValue = data?.[0]?.data?.[data[0].data.length - 1]?.[1] ?? 0;
  const previousValue = data?.[0]?.data?.[data[0].data.length - 2]?.[1] ?? 0;
  const trend = previousValue
    ? ((currentValue - previousValue) / previousValue) * 100
    : 0;

  return (
    <StatCard
      title="Total Facet Generations"
      value={currentValue.toLocaleString()}
      isLoading={isLoading}
      error={error}
      trend={trend}
    />
  );
};

const TrackingEventsStats = () => {
  const { data, isLoading, error } = useDefaultMetricsQuery(
    `sum(slasktracking_processed_tracking_events_total)`,
    ({ data }) => ({
      label: "Total tracking events",
      data,
    })
  );

  const currentValue = data?.[0]?.data?.[data[0].data.length - 1]?.[1] ?? 0;
  const previousValue = data?.[0]?.data?.[data[0].data.length - 2]?.[1] ?? 0;
  const trend = previousValue
    ? ((currentValue - previousValue) / previousValue) * 100
    : 0;

  return (
    <StatCard
      title="Total Tracking Events"
      value={currentValue.toLocaleString()}
      isLoading={isLoading}
      error={error}
      trend={trend}
    />
  );
};

const MemoryStats = () => {
  const { data, isLoading, error } = useDefaultMetricsQuery(
    `avg(container_memory_working_set_bytes{container="slask-finder"})`,
    ({ data }) => ({
      label: "Memory usage",
      data,
    })
  );

  const currentValue = data?.[0]?.data?.[data[0].data.length - 1]?.[1] ?? 0;
  const previousValue = data?.[0]?.data?.[data[0].data.length - 2]?.[1] ?? 0;
  const trend = previousValue
    ? ((currentValue - previousValue) / previousValue) * 100
    : 0;
  const memoryUsageGB = (currentValue / (1024 * 1024 * 1024)).toFixed(2);

  return (
    <StatCard
      title="Average Memory Usage"
      value={`${memoryUsageGB} GB`}
      isLoading={isLoading}
      error={error}
      trend={trend}
    />
  );
};

const CpuStats = () => {
  const { data, isLoading, error } = useDefaultMetricsQuery(
    `sum(rate(container_cpu_usage_seconds_total{container="slask-finder"}[1m]))`,
    ({ data }) => ({
      label: "CPU usage",
      data,
    })
  );

  const currentValue = data?.[0]?.data?.[data[0].data.length - 1]?.[1] ?? 0;
  const previousValue = data?.[0]?.data?.[data[0].data.length - 2]?.[1] ?? 0;
  const trend = previousValue
    ? ((currentValue - previousValue) / previousValue) * 100
    : 0;
  const cpuUsagePercent = (currentValue * 100).toFixed(1);

  return (
    <StatCard
      title="CPU Usage"
      value={`${cpuUsagePercent}%`}
      isLoading={isLoading}
      error={error}
      trend={trend}
    />
  );
};

const UpsertsStats = () => {
  const { data, isLoading, error } = useDefaultMetricsQuery(
    `sum(slasktracking_processed_item_updates_total)`,
    ({ data }) => ({
      label: "Total updates",
      data,
    })
  );

  const currentValue = data?.[0]?.data?.[data[0].data.length - 1]?.[1] ?? 0;
  const previousValue = data?.[0]?.data?.[data[0].data.length - 2]?.[1] ?? 0;
  const trend = previousValue
    ? ((currentValue - previousValue) / previousValue) * 100
    : 0;

  return (
    <StatCard
      title="Total Item Updates"
      value={currentValue.toLocaleString()}
      isLoading={isLoading}
      error={error}
      trend={trend}
    />
  );
};

export const DashboardView = () => {
  return (
    <div className="container p-4 md:p-10">
      <h1 className="text-2xl font-bold mb-6">System Statistics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SearchStats />
        <FacetStats />
        <TrackingEventsStats />
        <MemoryStats />
        <CpuStats />
        <UpsertsStats />
      </div>
    </div>
  );
};
