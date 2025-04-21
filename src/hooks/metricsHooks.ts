import { useState, useEffect } from "react";
import useSWR from "swr";
import { getPrometheusQueryUrl, getPrometheusData } from "../lib/datalayer/api";
import type { MetricsData, MetricWithValues, Series } from "../lib/types";

export const useMetricsQuery = (query: string, refresh = 5) => {
  const [now, setNow] = useState(new Date());

  const start = new Date(now.getTime() - 600000);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, refresh * 1000);
    return () => clearInterval(interval);
  }, [refresh]);

  const key = getPrometheusQueryUrl(query, start, now);

  const { data, error, isLoading } = useSWR(
    key,
    (url) =>
      getPrometheusData(url).then(
        (d) =>
          d?.data?.result?.map(({ metric, values }) => ({
            metric,
            data:
              values?.map(
                ([ts, value]) =>
                  [new Date(ts * 1000), Number(value)] satisfies MetricsData
              ) ?? [],
          })) ?? []
      ),
    { keepPreviousData: true }
  );

  return { data, error, isLoading };
};

export const useDefaultMetricsQuery = (
  query: string,
  toSeries: (metric: MetricWithValues<Record<string, string>>) => Series
) => {
  const {
    data: metrics,
    error,

    isLoading,
  } = useMetricsQuery(query);
  const data = metrics?.map(toSeries) ?? [];
  return {
    data,
    error,

    isLoading,
    isEmpty: metrics == null,
  };
};
