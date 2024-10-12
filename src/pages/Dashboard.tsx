import { LoaderCircle } from "lucide-react";
import { Chart, ChartOptions } from "react-charts";
import { useDefaultMetricsQuery } from "../metricsHooks";

const SearchChart = () => {
  const metricsData = useDefaultMetricsQuery(
    `rate(slaskfinder_searches_total[1m])`,
    ({ metric, data }) => ({
      label: `Searches (${metric.pod})`,
      data,
    }),
  );
  return (
    <ChartBox
      title="Searches"
      description="Here you can see the total number of searches"
      {...metricsData}
    />
  );
};

const FacetSearchChart = () => {
  const metricsData = useDefaultMetricsQuery(
    `rate(slaskfinder_facets_total[1m])`,
    ({ metric, data }) => ({
      label: `Facet generations (${metric.pod})`,
      data,
    }),
  );
  return (
    <ChartBox
      title="Facet generations"
      description="Here you can see the total number of facet generations"
      {...metricsData}
    />
  );
};

export const TrackingEventsChart = () => {
  const metricsData = useDefaultMetricsQuery(
    `rate(slasktracking_processed_tracking_events_total[1m])`,
    ({ metric, data }) => ({
      label: `Processed tracking events (${metric.pod})`,
      data,
    }),
  );
  return (
    <ChartBox
      title="Tracking events"
      description="Here you can see the total number of tracked events"
      {...metricsData}
    />
  );
};

export const MemoryUsageChart = () => {
  const metricsData = useDefaultMetricsQuery(
    `avg (container_memory_working_set_bytes{container="slask-finder"}) by (container_name,pod)`,
    ({ metric: { pod }, data }) => ({ label: `Memory usage (${pod})`, data }),
  );
  return (
    <ChartBox
      title="Memory usage"
      description="Here you can see memory usage per pod"
      {...metricsData}
    />
  );
};

type ChartBoxProps<T = unknown> = ChartOptions<T> & {
  title: string;
  description: string;
  isEmpty: boolean;
  isLoading: boolean;
  error?: Error;
};

export function ChartBox<T>({
  title,
  description,
  isEmpty,
  isLoading,
  error,
  ...chartOptions
}: ChartBoxProps<T>) {
  if (isEmpty) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <h1 className="font-bold text-lg">
        {title}{" "}
        {isLoading && (
          <LoaderCircle className="size-5 animate-spin inline-block ml-2" />
        )}
      </h1>
      <p>{description}</p>
      <div className="w-full h-96">
        <Chart options={chartOptions} />
      </div>
      {error && <div>Error: {error.message}</div>}
    </div>
  );
}

export const CpuUsageChart = () => {
  const metricsData = useDefaultMetricsQuery(
    `sum (rate (container_cpu_usage_seconds_total {container="slask-finder" } [1m])) by (pod)`,
    ({ metric: { pod }, data }) => ({ label: `Cpu usage (${pod})`, data }),
  );
  return (
    <ChartBox
      title="CPU usage"
      description="Here you can see CPU usage per pod"
      {...metricsData}
    />
  );
};

export const UpsertsChart = () => {
  const metricsData = useDefaultMetricsQuery(
    `rate(slasktracking_processed_item_updates_total[1m])`,
    ({ data }) => ({ label: `Updated items`, data }),
  );
  return (
    <ChartBox
      title="Updated items"
      description="Rate of updated items per minute"
      {...metricsData}
    />
  );
};

export const DashboardView = () => {
  return (
    <div className="container p-10">
      <div className="grid grid-cols-2">
        <SearchChart />
        <FacetSearchChart />
        <CpuUsageChart />
        <MemoryUsageChart />
        <TrackingEventsChart />
        <UpsertsChart />
      </div>
    </div>
  );
};
