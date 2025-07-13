'use client';

import { Download, Eye, EyeOff, Filter, RefreshCw, TrendingDown, TrendingUp } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

/**
 * TypeScript interfaces for data visualization components
 */
export interface DataPoint {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly category?: string;
  readonly timestamp?: string;
  readonly metadata?: Record<string, unknown>;
}

export interface ChartConfig {
  readonly type: 'bar' | 'line' | 'pie' | 'area' | 'radar';
  readonly title: string;
  readonly description?: string;
  readonly dataKey: string;
  readonly xAxisKey?: string;
  readonly yAxisKey?: string;
  readonly colors?: readonly string[];
  readonly showLegend?: boolean;
  readonly showGrid?: boolean;
  readonly showTooltip?: boolean;
  readonly height?: number;
  readonly responsive?: boolean;
  readonly animated?: boolean;
}

export interface MetricCardProps {
  readonly title: string;
  readonly value: string | number;
  readonly change?: number;
  readonly changeType?: 'increase' | 'decrease' | 'neutral';
  readonly description?: string;
  readonly icon?: React.ComponentType<{ className?: string }>;
  readonly trend?: readonly DataPoint[];
  readonly className?: string;
}

export interface AdvancedDataVisualizationProps {
  readonly data: readonly DataPoint[];
  readonly config: ChartConfig;
  readonly metrics?: readonly MetricCardProps[];
  readonly timeRange?: '7d' | '30d' | '90d' | '1y';
  readonly onTimeRangeChange?: (range: '7d' | '30d' | '90d' | '1y') => void;
  readonly onDataExport?: (format: 'csv' | 'json' | 'pdf') => void;
  readonly onRefresh?: () => void;
  readonly loading?: boolean;
  readonly error?: string | null;
  readonly className?: string;
  readonly ariaLabel?: string;
}

/**
 * Color palette for charts with accessibility considerations
 */
const CHART_COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#f97316', // Orange
] as const;

/**
 * Custom tooltip component with accessibility features
 */
const AccessibleTooltip: React.FC<{
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: string;
}> = ({ active, payload, label }) => {
  if (active && payload && payload.length > 0) {
    return (
      <div className="rounded-lg border border-border bg-background p-3 shadow-lg">
        <p className="font-medium text-foreground">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {`${entry.dataKey}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }

  return null;
};

/**
 * Metric card component with trend visualization
 */
export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  description,
  icon: Icon,
  trend,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleVisibilityToggle = useCallback(() => {
    setIsVisible(!isVisible);
  }, [isVisible]);

  const changeIcon = useMemo(() => {
    if (changeType === 'increase') return TrendingUp;
    if (changeType === 'decrease') return TrendingDown;
    return null;
  }, [changeType]);

  const ChangeIcon = changeIcon;

  return (
    <Card className={cn('relative', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-medium text-sm">{title}</CardTitle>
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleVisibilityToggle}
            aria-label={`${isVisible ? 'Hide' : 'Show'} ${title} metric`}
          >
            {isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      {isVisible && (
        <CardContent>
          <div className="font-bold text-2xl">{value}</div>
          {change !== undefined && ChangeIcon && (
            <div className="flex items-center text-muted-foreground text-xs">
              <ChangeIcon
                className={cn(
                  'mr-1 h-4 w-4',
                  changeType === 'increase' && 'text-green-600',
                  changeType === 'decrease' && 'text-red-600'
                )}
              />
              <span
                className={cn(
                  changeType === 'increase' && 'text-green-600',
                  changeType === 'decrease' && 'text-red-600'
                )}
              >
                {change > 0 ? '+' : ''}
                {change}%
              </span>
              <span className="ml-1">from last period</span>
            </div>
          )}
          {description && <CardDescription className="mt-2">{description}</CardDescription>}
          {trend && trend.length > 0 && (
            <div className="mt-4 h-16">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend as any}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={CHART_COLORS[0]}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

/**
 * Chart component factory with accessibility and performance optimizations
 */
const ChartComponent: React.FC<{
  config: ChartConfig;
  data: readonly DataPoint[];
}> = ({ config, data }) => {
  const debouncedData = useMemo(() => data, [data]);

  const commonProps = {
    data: debouncedData,
    margin: { top: 5, right: 30, left: 20, bottom: 5 },
  };

  const renderChart = () => {
    switch (config.type) {
      case 'bar':
        return (
          <BarChart {...commonProps} data={data as any[]}>
            {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={config.xAxisKey || 'label'} />
            <YAxis />
            {config.showTooltip && <Tooltip content={<AccessibleTooltip />} />}
            {config.showLegend && <Legend />}
            <Bar
              dataKey={config.dataKey}
              fill={config.colors?.[0] || CHART_COLORS[0]}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        );

      case 'line':
        return (
          <LineChart {...commonProps} data={data as any[]}>
            {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={config.xAxisKey || 'label'} />
            <YAxis />
            {config.showTooltip && <Tooltip content={<AccessibleTooltip />} />}
            {config.showLegend && <Legend />}
            <Line
              type="monotone"
              dataKey={config.dataKey}
              stroke={config.colors?.[0] || CHART_COLORS[0]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps} data={data as any[]}>
            {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis dataKey={config.xAxisKey || 'label'} />
            <YAxis />
            {config.showTooltip && <Tooltip content={<AccessibleTooltip />} />}
            {config.showLegend && <Legend />}
            <Area
              type="monotone"
              dataKey={config.dataKey}
              stroke={config.colors?.[0] || CHART_COLORS[0]}
              fill={config.colors?.[0] || CHART_COLORS[0]}
              fillOpacity={0.3}
            />
          </AreaChart>
        );

      case 'pie':
        return (
          <PieChart {...commonProps} data={data as any[]}>
            {config.showTooltip && <Tooltip content={<AccessibleTooltip />} />}
            {config.showLegend && <Legend />}
            <Pie
              data={debouncedData as any[]}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey={config.dataKey}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {debouncedData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    config.colors?.[index % config.colors.length] ||
                    CHART_COLORS[index % CHART_COLORS.length]
                  }
                />
              ))}
            </Pie>
          </PieChart>
        );

      case 'radar':
        return (
          <RadarChart {...commonProps} data={data as any[]}>
            <PolarGrid />
            <PolarAngleAxis dataKey={config.xAxisKey || 'label'} />
            <PolarRadiusAxis />
            {config.showTooltip && <Tooltip content={<AccessibleTooltip />} />}
            {config.showLegend && <Legend />}
            <Radar
              name={config.title}
              dataKey={config.dataKey}
              stroke={config.colors?.[0] || CHART_COLORS[0]}
              fill={config.colors?.[0] || CHART_COLORS[0]}
              fillOpacity={0.3}
            />
          </RadarChart>
        );

      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <ResponsiveContainer
      width="100%"
      height={config.height || 300}
      aria-label={`${config.type} chart showing ${config.title}`}
    >
      {renderChart()}
    </ResponsiveContainer>
  );
};

/**
 * Main Advanced Data Visualization Component
 */
export const AdvancedDataVisualization: React.FC<AdvancedDataVisualizationProps> = ({
  data,
  config,
  metrics = [],
  timeRange = '30d',
  onTimeRangeChange,
  onDataExport,
  onRefresh,
  loading = false,
  error = null,
  className,
  ariaLabel,
}) => {
  const [activeTab, setActiveTab] = useState('chart');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredData = useMemo(() => {
    if (filterCategory === 'all') return data;
    return data.filter((item) => item.category === filterCategory);
  }, [data, filterCategory]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(data.map((item) => item.category).filter(Boolean)));
    return ['all', ...cats];
  }, [data]);

  const handleExport = useCallback(
    (format: 'csv' | 'json' | 'pdf') => {
      onDataExport?.(format);
    },
    [onDataExport]
  );

  const handleRefresh = useCallback(() => {
    onRefresh?.();
  }, [onRefresh]);

  if (error) {
    return (
      <Card className={cn('border-destructive', className)}>
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Data</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)} aria-label={ariaLabel}>
      {/* Metrics Overview */}
      {metrics.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>
      )}

      {/* Main Chart Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{config.title}</CardTitle>
              {config.description && <CardDescription>{config.description}</CardDescription>}
            </div>
            <div className="flex items-center gap-2">
              {/* Time Range Selector */}
              {onTimeRangeChange && (
                <Select value={timeRange} onValueChange={onTimeRangeChange}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">7 days</SelectItem>
                    <SelectItem value="30d">30 days</SelectItem>
                    <SelectItem value="90d">90 days</SelectItem>
                    <SelectItem value="1y">1 year</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {/* Category Filter */}
              {categories.length > 1 && (
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-32">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category as string}>
                        {category === 'all' ? 'All Categories' : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Export Options */}
              {onDataExport && (
                <Select onValueChange={handleExport}>
                  <SelectTrigger className="w-24">
                    <Download className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Export" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {/* Refresh Button */}
              {onRefresh && (
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
                  <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="chart">Chart</TabsTrigger>
              <TabsTrigger value="table">Table</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="chart" className="mt-6">
              {loading ? (
                <div className="flex h-64 items-center justify-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ChartComponent config={config} data={filteredData} />
              )}
            </TabsContent>

            <TabsContent value="table" className="mt-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border border-border p-2 text-left">Label</th>
                      <th className="border border-border p-2 text-left">Value</th>
                      {data.some((item) => item.category) && (
                        <th className="border border-border p-2 text-left">Category</th>
                      )}
                      {data.some((item) => item.timestamp) && (
                        <th className="border border-border p-2 text-left">Date</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/50">
                        <td className="border border-border p-2">{item.label}</td>
                        <td className="border border-border p-2">{item.value}</td>
                        {data.some((item) => item.category) && (
                          <td className="border border-border p-2">
                            {item.category && <Badge variant="secondary">{item.category}</Badge>}
                          </td>
                        )}
                        {data.some((item) => item.timestamp) && (
                          <td className="border border-border p-2">
                            {item.timestamp && new Date(item.timestamp).toLocaleDateString()}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="mt-6">
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Summary Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground text-sm">Total Data Points:</span>
                        <span className="font-medium">{filteredData.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground text-sm">Average Value:</span>
                        <span className="font-medium">
                          {(
                            filteredData.reduce((sum, item) => sum + item.value, 0) /
                            filteredData.length
                          ).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground text-sm">Max Value:</span>
                        <span className="font-medium">
                          {Math.max(...filteredData.map((item) => item.value))}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground text-sm">Min Value:</span>
                        <span className="font-medium">
                          {Math.min(...filteredData.map((item) => item.value))}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Data Quality</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground text-sm">Completeness:</span>
                        <span className="font-medium">
                          {(
                            (filteredData.filter(
                              (item) => item.value !== null && item.value !== undefined
                            ).length /
                              filteredData.length) *
                            100
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground text-sm">Categories:</span>
                        <span className="font-medium">{categories.length - 1}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedDataVisualization;
