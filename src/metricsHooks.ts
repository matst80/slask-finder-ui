import { useState, useEffect, useMemo } from "react";
import useSWR from "swr";
import { getPrometheusQueryUrl, getPrometheusData } from "./api";
import type { MetricsData, MetricWithValues, Series } from "./types";
import type { AxisOptions } from "react-charts";

export const useMetricsQuery = (
  query: string,
  formatter = (v: number) => v,
  refresh = 5
) => {
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
  const primaryAxis = useMemo(
    (): AxisOptions<MetricsData> => ({
      getValue: ([date]) => date,
    }),
    []
  );

  const secondaryAxes = useMemo(
    (): AxisOptions<MetricsData>[] => [
      {
        getValue: ([_, value]) => formatter(value ?? 0),
      },
    ],
    [formatter]
  );

  return { data, primaryAxis, secondaryAxes, error, isLoading };
};

export const useDefaultMetricsQuery = (
  query: string,
  toSeries: (metric: MetricWithValues<Record<string, string>>) => Series
) => {
  const {
    data: metrics,
    error,
    primaryAxis,
    secondaryAxes,
    isLoading,
  } = useMetricsQuery(query);
  const data = metrics?.map(toSeries) ?? [];
  return {
    data,
    error,
    primaryAxis,
    secondaryAxes,
    isLoading,
    isEmpty: metrics == null,
  };
};
