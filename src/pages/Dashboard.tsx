import { useEffect, useMemo, useState } from "react";
import { AxisOptions, Chart } from "react-charts";
import useSWR from "swr";

type MetricsData = [Date, number];

type Series = {
  label: string;
  data: MetricsData[];
};

type MetricWithValues<TMetric = Record<string, string>> = {
  metric: TMetric;
  values: MetricsData[];
};

const useMetricsQuery = (
  query: string,
  formatter = (v: number) => v,
  refresh = 5
) => {
  const [now, setNow] = useState(Date.now() / 1000);

  const start = now - 3600;
  const params = new URLSearchParams({
    query,
    start: String(start),
    end: String(now),
    step: "14",
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now() / 1000);
    }, refresh * 1000);
    return () => clearInterval(interval);
  }, [refresh]);

  const key = `/api/v1/query_range?${params.toString()}`;

  const { data, error } = useSWR(
    key,
    (url) =>
      fetch(url, { method: "GET" })
        .then((res) => res.json())
        .then((d): MetricWithValues[] => {
          return (
            d?.data?.result?.map(
              ({
                metric,
                values,
              }: {
                metric: { [key: string]: string };
                values: [number, string][];
              }) => {
                return {
                  metric,
                  values:
                    values?.map(
                      ([ts, value]) =>
                        [
                          new Date(ts * 1000),
                          Number(value),
                        ] satisfies MetricsData
                    ) ?? [],
                };
              }
            ) ?? []
          );
        }),
    { keepPreviousData: true }
  );
  const primaryAxis = useMemo(
    (): AxisOptions<MetricsData> => ({
      getValue: ([date]) => date,
    }),
    []
  );

  const secondaryAxes = useMemo(
    (): AxisOptions<MetricsData>[] => [
      {
        getValue: ([_, value]) => formatter(value),
        elementType: "area",
        stacked: false,
      },
    ],
    [formatter]
  );
  return { data, primaryAxis, secondaryAxes, error };
};

const SearchChart = () => {
  const {
    data: metrics,
    primaryAxis,
    secondaryAxes,
    error,
  } = useMetricsQuery(`rate(slaskfinder_searches_total[1m])`);
  const data: Series[] = [
    {
      label: "Searches",
      data: metrics?.[0]?.values ?? [[new Date(), 0]],
    },
  ];

  return (
    <div>
      <h1 className="font-bold text-lg">Searches</h1>
      <p>Here you can see the total number of searches</p>
      <div className="w-full h-96">
        <Chart
          options={{
            data,
            primaryAxis,
            secondaryAxes,
          }}
        />
      </div>
      {error && <div>Error: {error.message}</div>}
    </div>
  );
};

const FacetSearchChart = () => {
  const {
    data: metrics,
    primaryAxis,
    secondaryAxes,
    error,
  } = useMetricsQuery(`rate(slaskfinder_facets_total[1m])`);
  const data: Series[] = [
    {
      label: "Facet generations",
      data: metrics?.[0]?.values ?? [[new Date(), 0]],
    },
  ];

  return (
    <div>
      <h1 className="font-bold text-lg">Facet generations</h1>
      <p>Here you can see the total number of searches</p>
      <div className="w-full h-96">
        <Chart
          options={{
            data,
            primaryAxis,
            secondaryAxes,
          }}
        />
      </div>
      {error && <div>Error: {error.message}</div>}
    </div>
  );
};

const TrackingEventsChart = () => {
  const {
    data: metrics,
    primaryAxis,
    secondaryAxes,
    error,
  } = useMetricsQuery(
    `rate(slasktracking_processed_tracking_events_total[1m])`
  );
  const data: Series[] = [
    {
      label: "Processed tracking events",
      data: metrics?.[0]?.values ?? [[new Date(), 0]],
    },
  ];

  return (
    <div>
      <h1 className="font-bold text-lg">Tracking events</h1>
      <p>Here you can see the total number of tracked events</p>
      <div className="w-full h-96">
        <Chart
          options={{
            data,
            primaryAxis,
            secondaryAxes,
          }}
        />
      </div>
      {error && <div>Error: {error.message}</div>}
    </div>
  );
};

export const MemoryUsageChart = () => {
  const {
    data: memoryMetrics,
    error,
    primaryAxis,
    secondaryAxes,
  } = useMetricsQuery(
    `avg (container_memory_working_set_bytes{container="slask-finder"}) by (container_name,pod)`,
    (v) => v / 1024
  );
  const data = memoryMetrics?.map((metric) => {
    return {
      label: `Memory usage (${metric.metric.pod})`,
      data: metric.values,
    } satisfies Series;
  });
  if (!data) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <h1 className="font-bold text-lg">Memory usage</h1>
      <p>Here you can see memory usage per pod</p>
      <div className="w-full h-96">
        <Chart
          options={{
            data,
            primaryAxis,
            secondaryAxes,
          }}
        />
      </div>
      {error && <div>Error: {error.message}</div>}
    </div>
  );
};

export const CpuUsageChart = () => {
  const {
    data: cpuMetrics,
    error,
    primaryAxis,
    secondaryAxes,
  } = useMetricsQuery(
    `sum (rate (container_cpu_usage_seconds_total {container="slask-finder" } [1m])) by (pod)`
  );
  const data = cpuMetrics?.map((metric) => {
    return {
      label: `Cpu usage (${metric.metric.pod})`,
      data: metric.values,
    } satisfies Series;
  });
  if (!data) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      <h1 className="font-bold text-lg">CPU usage</h1>
      <p>Here you can see CPU usage per pod</p>
      <div className="w-full h-96">
        <Chart
          options={{
            data,
            primaryAxis,
            secondaryAxes,
          }}
        />
      </div>
      {error && <div>Error: {error.message}</div>}
    </div>
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
      </div>
    </div>
  );
};
