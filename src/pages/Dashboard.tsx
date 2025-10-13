import {
  ArrowUp,
  ArrowDown,
  Search,
  Layers,
  Activity,
  MemoryStick,
  Cpu,
  RefreshCw,
  Lightbulb,
} from 'lucide-react'
import { useDefaultMetricsQuery } from '../hooks/metricsHooks'
import { useTranslations } from '../lib/hooks/useTranslations'

type CardProps = {
  title: string
}

const StatCard = ({
  title,
  value,
  error,
  trend,
  icon: Icon,
  color,
}: CardProps & {
  value: string | number
  isLoading: boolean
  error?: Error
  trend?: number
  icon: React.ComponentType<{ className?: string }>
  color: string
}) => {
  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-500'
    if (trend < 0) return 'text-red-500'
    return 'text-gray-500'
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <ArrowUp className="size-4" />
    if (trend < 0) return <ArrowDown className="size-4" />
    return null
  }

  return (
    <div
      className={`rounded-lg shadow-md p-6 relative overflow-hidden ${color}`}
    >
      <div className="absolute top-0 right-0 opacity-10">
        <Icon className="size-24" />
      </div>
      <div className="relative z-10">
        <div className="flex items-baseline gap-2 mb-2">
          <Icon className="size-5" />
          <h3 className="text-sm font-medium">{title}</h3>
        </div>
        <div className="flex items-baseline">
          {error ? (
            <span className="text-red-500">Error loading data</span>
          ) : (
            <div className="flex items-center gap-2">
              <p className="text-3xl font-semibold">{value}</p>
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
    </div>
  )
}

const SearchStats = ({ title }: CardProps) => {
  const { data, isLoading, error } = useDefaultMetricsQuery(
    `sum(slaskfinder_searches_total)`,
    ({ data }) => ({
      label: title,
      data,
    }),
  )

  const currentValue = data?.[0]?.data?.[data[0].data.length - 1]?.[1] ?? 0
  const previousValue = data?.[0]?.data?.[data[0].data.length - 2]?.[1] ?? 0
  const trend = previousValue
    ? ((currentValue - previousValue) / previousValue) * 100
    : 0

  return (
    <StatCard
      title={title}
      value={currentValue.toLocaleString()}
      isLoading={isLoading}
      error={error}
      trend={trend}
      icon={Search}
      color="bg-linear-to-br from-blue-50 to-blue-100"
    />
  )
}

const FacetStats = ({ title }: CardProps) => {
  const { data, isLoading, error } = useDefaultMetricsQuery(
    `sum(slaskfinder_facets_total)`,
    ({ data }) => ({
      label: title,
      data,
    }),
  )

  const currentValue = data?.[0]?.data?.[data[0].data.length - 1]?.[1] ?? 0
  const previousValue = data?.[0]?.data?.[data[0].data.length - 2]?.[1] ?? 0
  const trend = previousValue
    ? ((currentValue - previousValue) / previousValue) * 100
    : 0

  return (
    <StatCard
      title={title}
      value={currentValue.toLocaleString()}
      isLoading={isLoading}
      error={error}
      trend={trend}
      icon={Layers}
      color="bg-linear-to-br from-purple-50 to-purple-100"
    />
  )
}

const TrackingEventsStats = ({ title }: CardProps) => {
  const { data, isLoading, error } = useDefaultMetricsQuery(
    `sum(slasktracking_processed_tracking_events_total)`,
    ({ data }) => ({
      label: title,
      data,
    }),
  )

  const currentValue = data?.[0]?.data?.[data[0].data.length - 1]?.[1] ?? 0
  const previousValue = data?.[0]?.data?.[data[0].data.length - 2]?.[1] ?? 0
  const trend = previousValue
    ? ((currentValue - previousValue) / previousValue) * 100
    : 0

  return (
    <StatCard
      title={title}
      value={currentValue.toLocaleString()}
      isLoading={isLoading}
      error={error}
      trend={trend}
      icon={Activity}
      color="bg-linear-to-br from-green-50 to-green-100"
    />
  )
}

const MemoryStats = ({ title }: CardProps) => {
  const { data, isLoading, error } = useDefaultMetricsQuery(
    `avg(container_memory_working_set_bytes{container="slask-finder"})`,
    ({ data }) => ({
      label: title,
      data,
    }),
  )

  const currentValue = data?.[0]?.data?.[data[0].data.length - 1]?.[1] ?? 0
  const previousValue = data?.[0]?.data?.[data[0].data.length - 2]?.[1] ?? 0
  const trend = previousValue
    ? ((currentValue - previousValue) / previousValue) * 100
    : 0
  const memoryUsageGB = (currentValue / (1024 * 1024 * 1024)).toFixed(2)

  return (
    <StatCard
      title={title}
      value={`${memoryUsageGB} GB`}
      isLoading={isLoading}
      error={error}
      trend={trend}
      icon={MemoryStick}
      color="bg-linear-to-br from-orange-50 to-orange-100"
    />
  )
}

const CpuStats = ({ title }: CardProps) => {
  const { data, isLoading, error } = useDefaultMetricsQuery(
    `sum(rate(container_cpu_usage_seconds_total{container="slask-finder"}[1m]))`,
    ({ data }) => ({
      label: title,
      data,
    }),
  )

  const currentValue = data?.[0]?.data?.[data[0].data.length - 1]?.[1] ?? 0
  const previousValue = data?.[0]?.data?.[data[0].data.length - 2]?.[1] ?? 0
  const trend = previousValue
    ? ((currentValue - previousValue) / previousValue) * 100
    : 0
  const cpuUsagePercent = (currentValue * 100).toFixed(1)

  return (
    <StatCard
      title={title}
      value={`${cpuUsagePercent}%`}
      isLoading={isLoading}
      error={error}
      trend={trend}
      icon={Cpu}
      color="bg-linear-to-br from-red-50 to-red-100"
    />
  )
}

const UpsertsStats = ({ title }: CardProps) => {
  const { data, isLoading, error } = useDefaultMetricsQuery(
    `sum(slaskfinder_index_updates_total)`,
    ({ data }) => ({
      label: title,
      data,
    }),
  )

  const currentValue = data?.[0]?.data?.[data[0].data.length - 1]?.[1] ?? 0
  const previousValue = data?.[0]?.data?.[data[0].data.length - 2]?.[1] ?? 0
  const trend = previousValue
    ? ((currentValue - previousValue) / previousValue) * 100
    : 0

  return (
    <StatCard
      title={title}
      value={currentValue.toLocaleString()}
      isLoading={isLoading}
      error={error}
      trend={trend}
      icon={RefreshCw}
      color="bg-linear-to-br from-cyan-50 to-cyan-100"
    />
  )
}

const SuggestStats = ({ title }: CardProps) => {
  const { data, error, isLoading } = useDefaultMetricsQuery(
    `sum(slaskfinder_suggest_total)`,
    ({ data }) => ({
      label: title,
      data,
    }),
  )

  const currentValue = data?.[0]?.data?.[data[0].data.length - 1]?.[1] ?? 0
  const previousValue = data?.[0]?.data?.[data[0].data.length - 2]?.[1] ?? 0
  const trend = previousValue
    ? ((currentValue - previousValue) / previousValue) * 100
    : 0

  return (
    <StatCard
      title={title}
      value={currentValue.toLocaleString()}
      error={error}
      trend={trend}
      icon={Lightbulb}
      color="bg-linear-to-br from-yellow-50 to-yellow-100"
      isLoading={isLoading}
    />
  )
}

export const DashboardView = () => {
  const t = useTranslations()
  return (
    <div className="container p-4 md:p-10">
      <h1 className="text-2xl font-bold mb-6">{t('dashboard.title')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SearchStats title={t('dashboard.searches')} />
        <FacetStats title={t('dashboard.facets')} />
        <TrackingEventsStats title={t('dashboard.tracking_events')} />
        <MemoryStats title={t('dashboard.memory')} />
        <CpuStats title={t('dashboard.cpu')} />
        <UpsertsStats title={t('dashboard.updates')} />
        <SuggestStats title={t('dashboard.suggestions')} />
      </div>
    </div>
  )
}
