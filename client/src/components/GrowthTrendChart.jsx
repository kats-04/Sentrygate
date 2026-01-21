import React, { useState } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns';
// import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './ui';

/**
 * GrowthTrendChart Component
 * Visualizes user registration trends with interactive time ranges
 */
const GrowthTrendChart = ({ data = [] }) => {
    const [timeRange, setTimeRange] = useState(7);
    // const [hoverData, setHoverData] = useState(null);

    // Generate date labels based on range
    const getChartData = () => {
        const end = startOfDay(new Date());
        const start = subDays(end, timeRange - 1);

        // Create array of all dates in range
        const dates = eachDayOfInterval({ start, end });

        // Map existing data to dates, filling zeros for missing days
        return dates.map(date => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const found = data.find(d => d._id === dateStr);
            return {
                date: format(date, 'MMM dd'),
                fullDate: dateStr,
                count: found ? found.count : 0,
            };
        });
    };

    const chartData = getChartData();
    const totalInPeriod = chartData.reduce((acc, curr) => acc + curr.count, 0);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                    <p className="font-semibold text-slate-900 dark:text-white mb-1">{label}</p>
                    <p className="text-primary-600 dark:text-primary-400 font-medium">
                        {payload[0].value} New Users
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <Card variant="glass" padding="none" className="overflow-hidden">
            <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Growth Trends
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            <span className="font-bold text-primary-600 dark:text-primary-400">{totalInPeriod}</span> registrations in last {timeRange} days
                        </p>
                    </div>

                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg self-start sm:self-auto">
                        {[7, 30, 90].map((days) => (
                            <button
                                key={days}
                                onClick={() => setTimeRange(days)}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${timeRange === days
                                    ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                    }`}
                            >
                                {days}D
                            </button>
                        ))}
                    </div>
                </div>

                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.3} />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                tickMargin={10}
                                interval={timeRange > 30 ? 4 : 0}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                allowDecimals={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="count"
                                stroke="#0ea5e9"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorCount)"
                                animationDuration={1500}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </Card>
    );
};

export default GrowthTrendChart;
