import { useMemo } from "react"

interface FunnelItem {
  id: string | number
  value: number
  label: string
  color?: string
}

interface FunnelChartProps {
  data: FunnelItem[]
  width?: number
  height?: number
  className?: string
  showLabels?: boolean
  showValues?: boolean
  showPercentages?: boolean
}

export const FunnelChart = ({
  data,
  width = 600,
  height = 400,
  className = "",
  showLabels = true,
  showValues = true,
  showPercentages = true,
}: FunnelChartProps) => {
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => b.value - a.value)
  }, [data])

  const maxValue = useMemo(() => {
    return sortedData.length > 0 ? sortedData[0].value : 0
  }, [sortedData])

  const totalValue = useMemo(() => {
    return sortedData.reduce((sum, item) => sum + item.value, 0)
  }, [sortedData])

  // Enhanced color palette
  const defaultColors = [
    "#4338ca", // indigo-700
    "#4f46e5", // indigo-600
    "#6366f1", // indigo-500
    "#818cf8", // indigo-400
    "#a5b4fc", // indigo-300
    "#c7d2fe", // indigo-200
  ]

  // Calculate trapezoid points for each segment
  const segments = useMemo(() => {
    if (sortedData.length === 0) return []

    const segmentHeight = height / sortedData.length
    const padding = width * 0.1 // 10% padding on each side
    const availableWidth = width - padding * 2

    return sortedData.map((item, index) => {
      const topWidth = availableWidth * (index === 0 ? 1 : sortedData[index - 1].value / maxValue)
      const bottomWidth = availableWidth * (item.value / maxValue)

      const x1 = (width - topWidth) / 2
      const x2 = x1 + topWidth
      const y1 = index * segmentHeight
      const y2 = y1 + segmentHeight

      const x3 = (width - bottomWidth) / 2
      const x4 = x3 + bottomWidth

      // Calculate drop rate from previous step
      const prevValue = index > 0 ? sortedData[index - 1].value : item.value
      const dropRate = prevValue > 0 ? ((prevValue - item.value) / prevValue) * 100 : 0
      
      return {
        points: `${x1},${y1} ${x2},${y1} ${x4},${y2} ${x3},${y2}`,
        item,
        color: item.color || defaultColors[index % defaultColors.length],
        percentage: (item.value / (sortedData[0]?.value || 1)) * 100,
        dropRate,
        centerX: width / 2,
        centerY: y1 + segmentHeight / 2,
        gradientId: `gradient-${item.id}`,
      }
    })
  }, [sortedData, width, height, maxValue, totalValue, defaultColors])

  if (data.length === 0) {
    return <div className="text-center p-4 text-gray-500">No data available for visualization</div>
  }

  return (
    <div className={`relative ${className}`}>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible" preserveAspectRatio="xMidYMid meet">
        <defs>
          {segments.map((segment) => (
            <linearGradient
              key={segment.gradientId}
              id={segment.gradientId}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor={segment.color} stopOpacity="0.9" />
              <stop offset="100%" stopColor={segment.color} stopOpacity="0.7" />
            </linearGradient>
          ))}
        </defs>
        
        {/* Draw shadows for depth */}
        {segments.map((segment) => (
          <polygon
            key={`shadow-${segment.item.id}`}
            points={segment.points}
            fill="rgba(0,0,0,0.06)"
            transform="translate(3, 3)"
          />
        ))}
        
        {/* Draw segments with gradients */}
        {segments.map((segment, index) => (
          <g key={segment.item.id}>
            <polygon
              points={segment.points}
              fill={`url(#${segment.gradientId})`}
              stroke="#ffffff"
              strokeWidth="1.5"
              className="transition-all duration-300 hover:opacity-95 cursor-pointer"
            >
              <title>
                {`${segment.item.label}: ${segment.item.value.toLocaleString()} events (${segment.percentage.toFixed(1)}%)`}
                {index > 0 ? ` • Drop: ${segment.dropRate.toFixed(1)}%` : ''}
              </title>
            </polygon>

            {showLabels && (
              <text
                x={segment.centerX}
                y={segment.centerY}
                textAnchor="middle"
                fill="#ffffff"
                fontSize="14"
                fontWeight="bold"
                className="pointer-events-none"
                style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
              >
                {segment.item.label}
                {showValues && ` (${segment.item.value.toLocaleString()})`}
                {showPercentages && ` ${segment.percentage.toFixed(0)}%`}
              </text>
            )}
          </g>
        ))}
        
        {/* Add connecting lines between segments */}
        {segments.map((segment, index) => {
          if (index === segments.length - 1) return null
          
          const nextSegment = segments[index + 1]
          if (!nextSegment) return null
          
          const points = segment.points.split(' ')
          const nextPoints = nextSegment.points.split(' ')
          
          const bottomLeft = points[3].split(',')
          const bottomRight = points[2].split(',')
          const topLeft = nextPoints[0].split(',')
          const topRight = nextPoints[1].split(',')
          
          return (
            <line
              key={`connector-${segment.item.id}`}
              x1={(parseFloat(bottomLeft[0]) + parseFloat(topLeft[0])) / 2}
              y1={parseFloat(bottomLeft[1])}
              x2={(parseFloat(bottomRight[0]) + parseFloat(topRight[0])) / 2}
              y2={parseFloat(topLeft[1])}
              stroke="#ffffff"
              strokeWidth="1"
              strokeDasharray="2,1"
              opacity="0.5"
            />
          )
        })}
      </svg>
    </div>
  )
}